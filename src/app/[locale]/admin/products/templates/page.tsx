"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import FileUploadDemo from "@/components/file-upload-demo";
import { locales } from "@/i18n/routing";
import { getSessionSnapshot } from "@/lib/auth-session";
import {
  createProductTemplate,
  getAddProductSubcategories,
  getProductTemplates,
  type ProductGalleryImage,
  type ProductTemplate,
  uploadProductGalleryImages,
  uploadProductImage,
} from "@/lib/api";
import { useTranslations } from "next-intl";

const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,image/svg+xml,image/avif";
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

type ParentCategory = "phones" | "tablets" | "accessories";
type BrandLibraryItem = { name: string; domain: string };
type BrandOption = { name: string; logoUrl?: string };
type UploadedImageState = { name: string; url: string };
type UploadedGalleryImageState = ProductGalleryImage & { name: string };

const STORAGE_PRESETS: Record<ParentCategory, string[]> = {
  phones: ["64GB", "128GB", "256GB", "512GB", "1TB", "2TB"],
  tablets: ["64GB", "128GB", "256GB", "512GB", "1TB", "2TB"],
  accessories: [],
};

const BRAND_LIBRARY: Record<ParentCategory, BrandLibraryItem[]> = {
  phones: [
    { name: "Apple", domain: "apple.com" },
    { name: "Samsung", domain: "samsung.com" },
    { name: "Google", domain: "google.com" },
    { name: "Xiaomi", domain: "mi.com" },
    { name: "Huawei", domain: "huawei.com" },
    { name: "Honor", domain: "honor.com" },
    { name: "OnePlus", domain: "oneplus.com" },
    { name: "OPPO", domain: "oppo.com" },
    { name: "vivo", domain: "vivo.com" },
    { name: "realme", domain: "realme.com" },
    { name: "Motorola", domain: "motorola.com" },
    { name: "Nokia", domain: "nokia.com" },
    { name: "Sony", domain: "sony.com" },
    { name: "ASUS", domain: "asus.com" },
    { name: "Nothing", domain: "nothing.tech" },
    { name: "Lenovo", domain: "lenovo.com" },
    { name: "ZTE", domain: "zte.com.cn" },
    { name: "Meizu", domain: "meizu.com" },
    { name: "Tecno", domain: "tecno-mobile.com" },
    { name: "Infinix", domain: "infinixmobility.com" },
    { name: "itel", domain: "itel-mobile.com" },
  ],
  tablets: [
    { name: "Apple", domain: "apple.com" },
    { name: "Samsung", domain: "samsung.com" },
    { name: "Huawei", domain: "huawei.com" },
    { name: "Xiaomi", domain: "mi.com" },
    { name: "Lenovo", domain: "lenovo.com" },
    { name: "Microsoft", domain: "microsoft.com" },
    { name: "Amazon", domain: "amazon.com" },
    { name: "Google", domain: "google.com" },
    { name: "ASUS", domain: "asus.com" },
    { name: "Acer", domain: "acer.com" },
    { name: "Dell", domain: "dell.com" },
    { name: "HP", domain: "hp.com" },
  ],
  accessories: [
    { name: "Apple", domain: "apple.com" },
    { name: "Samsung", domain: "samsung.com" },
    { name: "Anker", domain: "anker.com" },
    { name: "Belkin", domain: "belkin.com" },
    { name: "UGREEN", domain: "ugreen.com" },
    { name: "Baseus", domain: "baseus.com" },
    { name: "JBL", domain: "jbl.com" },
    { name: "Sony", domain: "sony.com" },
    { name: "Bose", domain: "bose.com" },
    { name: "Sennheiser", domain: "sennheiser.com" },
    { name: "Beats", domain: "beatsbydre.com" },
    { name: "Logitech", domain: "logitech.com" },
    { name: "Razer", domain: "razer.com" },
    { name: "Spigen", domain: "spigen.com" },
    { name: "OtterBox", domain: "otterbox.com" },
    { name: "ESR", domain: "esrgear.com" },
    { name: "Xiaomi", domain: "mi.com" },
    { name: "OnePlus", domain: "oneplus.com" },
    { name: "Google", domain: "google.com" },
    { name: "Nothing", domain: "nothing.tech" },
  ],
};

type TemplateFormState = {
  parentCategory: ParentCategory;
  subcategoryName: string;
  name: string;
  storage: string;
  color: string;
  description: string;
  specificationsText: string;
  isActive: boolean;
};

const initialTemplateForm: TemplateFormState = {
  parentCategory: "phones",
  subcategoryName: "",
  name: "",
  storage: "",
  color: "",
  description: "",
  specificationsText: "",
  isActive: true,
};

function toErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "error" in error) {
    return String((error as { error?: unknown }).error ?? "Unknown error");
  }
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message ?? "Unknown error");
  }
  return "Something went wrong. Please try again.";
}

function parseTemplateSpecifications(text: string) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const parsed: { key: string; value: string }[] = [];
  for (const line of lines) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) {
      return {
        error: "Each specification line must be in 'Key: Value' format.",
        value: null,
      } as const;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (!key || !value) {
      return {
        error: "Each specification line must include both key and value.",
        value: null,
      } as const;
    }

    parsed.push({ key, value });
  }

  return { error: null, value: parsed } as const;
}

function templateLabel(template: ProductTemplate) {
  const details = [template.storage, template.color]
    .map((value) => value?.trim())
    .filter(Boolean);

  return details.length > 0
    ? `${template.name} (${details.join(", ")})`
    : template.name;
}

function buildLogoUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}

function normalizeBrandKey(name: string) {
  return name.trim().toLowerCase();
}

function buildFallbackBrandLogoUrl(name: string) {
  const initial = name.trim().slice(0, 1).toUpperCase() || "?";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="32" fill="#f3f4f6" />
      <text x="32" y="32" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#374151">
        ${initial}
      </text>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function ProductTemplatesPage() {
  const t = useTranslations("AdminTemplates");
  const pathname = usePathname();
  const router = useRouter();

  const [templates, setTemplates] = useState<ProductTemplate[]>([]);
  const [subcategoriesByParent, setSubcategoriesByParent] = useState<
    Record<ParentCategory, { id: string; name: string; slug: string }[]>
  >({
    phones: [],
    tablets: [],
    accessories: [],
  });

  const [templateForm, setTemplateForm] =
    useState<TemplateFormState>(initialTemplateForm);
  const [templateSearch, setTemplateSearch] = useState("");
  const [isBrandPickerOpen, setIsBrandPickerOpen] = useState(false);
  const [brandQuery, setBrandQuery] = useState("");
  const [failedBrandLogos, setFailedBrandLogos] = useState<
    Record<string, boolean>
  >({});

  const [coverImage, setCoverImage] = useState<UploadedImageState | null>(
    null,
  );
  const [galleryImages, setGalleryImages] = useState<UploadedGalleryImageState[]>(
    [],
  );
  const [coverUploadKey, setCoverUploadKey] = useState(0);
  const [galleryUploadKey, setGalleryUploadKey] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const brandPickerRef = useRef<HTMLDivElement | null>(null);

  const locale = pathname?.split("/").filter(Boolean)[0] || "en";
  const adminBase = `/${locale}/admin/products`;

  const ensureAccessToken = useCallback(async () => {
    const token = getSessionSnapshot().accessToken;
    if (token) return token;

    const hasLocale = locale && (locales as readonly string[]).includes(locale);
    const next = `${window.location.pathname}${window.location.search}`;
    router.push(
      `${hasLocale ? `/${locale}` : "/en"}/login?next=${encodeURIComponent(next)}`,
    );
    return null;
  }, [locale, router]);

  const loadData = useCallback(async () => {
    const accessToken = await ensureAccessToken();
    if (!accessToken) return;

    try {
      setIsLoading(true);
      setError(null);

      const [templatesResponse, subcategoriesResponse] = await Promise.all([
        getProductTemplates(accessToken),
        getAddProductSubcategories(accessToken),
      ]);

      const loadedTemplates = Array.isArray(templatesResponse.data)
        ? templatesResponse.data
        : [];

      setTemplates(loadedTemplates);
      setSubcategoriesByParent({
        phones: subcategoriesResponse.data.phones ?? [],
        tablets: subcategoriesResponse.data.tablets ?? [],
        accessories: subcategoriesResponse.data.accessories ?? [],
      });
    } catch (loadError) {
      setError(toErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [ensureAccessToken]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const availableBrands =
    subcategoriesByParent[templateForm.parentCategory] ?? [];
  const isAccessoryCategory = templateForm.parentCategory === "accessories";
  const isStorageRequired = !isAccessoryCategory;

  const brandOptions = useMemo(() => {
    const byName = new Map<string, BrandOption>();
    const libraryByName = new Map(
      BRAND_LIBRARY[templateForm.parentCategory].map((item) => [
        item.name.toLowerCase(),
        item,
      ]),
    );

    for (const brand of availableBrands) {
      const normalized = brand.name.trim().toLowerCase();
      if (!normalized) continue;
      const match = libraryByName.get(normalized);
      byName.set(normalized, {
        name: brand.name.trim(),
        logoUrl: match ? buildLogoUrl(match.domain) : undefined,
      });
    }

    for (const item of BRAND_LIBRARY[templateForm.parentCategory]) {
      const normalized = item.name.toLowerCase();
      if (byName.has(normalized)) continue;
      byName.set(normalized, {
        name: item.name,
        logoUrl: buildLogoUrl(item.domain),
      });
    }

    return Array.from(byName.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [availableBrands, templateForm.parentCategory]);

  const selectedBrandOption = brandOptions.find(
    (item) =>
      item.name.toLowerCase() ===
      templateForm.subcategoryName.trim().toLowerCase(),
  );
  const filteredBrandOptions = useMemo(() => {
    const normalized = brandQuery.trim().toLowerCase();
    if (!normalized) return brandOptions;
    return brandOptions.filter((item) =>
      item.name.toLowerCase().includes(normalized),
    );
  }, [brandOptions, brandQuery]);

  useEffect(() => {
    if (templateForm.subcategoryName) return;
    const fallback = brandOptions[0]?.name;
    if (fallback) {
      setTemplateForm((prev) => ({ ...prev, subcategoryName: fallback }));
    }
  }, [brandOptions, templateForm.subcategoryName]);

  useEffect(() => {
    setIsBrandPickerOpen(false);
    setBrandQuery("");
  }, [templateForm.parentCategory]);

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (!brandPickerRef.current) return;
      if (brandPickerRef.current.contains(event.target as Node)) return;
      setIsBrandPickerOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, []);

  const filteredTemplates = useMemo(() => {
    const normalized = templateSearch.trim().toLowerCase();
    if (!normalized) return templates;

    return templates.filter((template) => {
      return (
        template.name.toLowerCase().includes(normalized) ||
        (template.storage ?? "").toLowerCase().includes(normalized) ||
        template.color.toLowerCase().includes(normalized) ||
        (template.subcategoryName ?? "").toLowerCase().includes(normalized)
      );
    });
  }, [templateSearch, templates]);

  const validateImageFile = useCallback(
    (file: File) => {
      if (!IMAGE_ACCEPT.split(",").includes(file.type)) {
        return t("invalidFileType");
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        return t("fileTooLarge");
      }

      return null;
    },
    [t],
  );

  const uploadTemplateImage = useCallback(
    async (file: File, accessToken: string) => {
      const uploadResponse = await uploadProductImage(file, accessToken);
      const imageUrl = uploadResponse.data.url?.trim();

      if (!imageUrl) {
        throw new Error("Uploaded image URL is missing.");
      }

      return {
        name: file.name,
        url: imageUrl,
      } satisfies UploadedImageState;
    },
    [],
  );

  const clearQueuedGalleryImages = useCallback(() => {
    setGalleryImages([]);
  }, []);

  const removeQueuedGalleryImage = useCallback((imageId: string) => {
    setGalleryImages((prev) => prev.filter((image) => image.key !== imageId));
  }, []);

  const onUploadCoverImage = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;

      setError(null);
      setSuccess(null);

      const validationError = validateImageFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      const accessToken = await ensureAccessToken();
      if (!accessToken) return;

      try {
        setIsCoverUploading(true);
        const uploadedImage = await uploadTemplateImage(file, accessToken);
        setCoverImage(uploadedImage);
        setCoverUploadKey((prev) => prev + 1);
        setSuccess(t("coverImageUploaded"));
      } catch (uploadError) {
        setError(toErrorMessage(uploadError));
      } finally {
        setIsCoverUploading(false);
      }
    },
    [ensureAccessToken, t, uploadTemplateImage, validateImageFile],
  );

  const onUploadGalleryImages = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      setError(null);
      setSuccess(null);

      for (const file of files) {
        const validationError = validateImageFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }
      }

      const accessToken = await ensureAccessToken();
      if (!accessToken) return;

      try {
        setIsGalleryUploading(true);
        const uploadedImages = await uploadProductGalleryImages(
          files,
          accessToken,
        );
        const uploadedGalleryItems = uploadedImages.map((image, index) => ({
          ...image,
          name: files[index]?.name ?? image.key.split("/").pop() ?? image.key,
        }));

        setGalleryImages((prev) => {
          const next = [...prev];
          for (const image of uploadedGalleryItems) {
            if (next.some((item) => item.key === image.key || item.url === image.url)) {
              continue;
            }
            next.push(image);
          }
          return next;
        });
        setGalleryUploadKey((prev) => prev + 1);
        setSuccess(
          t("galleryImagesUploaded", { count: uploadedGalleryItems.length }),
        );
      } catch (uploadError) {
        setError(toErrorMessage(uploadError));
      } finally {
        setIsGalleryUploading(false);
      }
    },
    [ensureAccessToken, t, validateImageFile],
  );

  const onCreateTemplate = async () => {
    setError(null);
    setSuccess(null);

    const accessToken = await ensureAccessToken();
    if (!accessToken) return;

    if (
      !templateForm.name.trim() ||
      !templateForm.color.trim() ||
      (isStorageRequired && !templateForm.storage.trim()) ||
      !templateForm.subcategoryName.trim()
    ) {
      setError(
        t(
          isStorageRequired
            ? "requiredFieldsWithStorage"
            : "requiredFieldsWithoutStorage",
        ),
      );
      return;
    }

    if (!coverImage?.url) {
      setError(t("uploadCoverImageFirst"));
      return;
    }

    const specParse = parseTemplateSpecifications(
      templateForm.specificationsText,
    );
    if (specParse.error) {
      setError(specParse.error);
      return;
    }

    try {
      setIsCreatingTemplate(true);

      const created = await createProductTemplate(
        {
          parentCategory: templateForm.parentCategory,
          subcategoryName: templateForm.subcategoryName.trim(),
          name: templateForm.name.trim(),
          ...(templateForm.storage.trim()
            ? { storage: templateForm.storage.trim() }
            : {}),
          color: templateForm.color.trim(),
          image: coverImage.url,
          ...(galleryImages.length > 0
            ? {
                gallery: galleryImages.map(
                  ({ key, url, contentType, size }) => ({
                    key,
                    url,
                    contentType,
                    size,
                  }),
                ),
              }
            : {}),
          description: templateForm.description.trim() || undefined,
          specifications: specParse.value,
          isActive: templateForm.isActive,
        },
        accessToken,
      );

      setTemplates((prev) => [created.data, ...prev]);
      setTemplateForm((prev) => ({
        ...initialTemplateForm,
        parentCategory: prev.parentCategory,
        subcategoryName: prev.subcategoryName,
      }));
      setCoverImage(null);
      clearQueuedGalleryImages();
      setCoverUploadKey((prev) => prev + 1);
      setGalleryUploadKey((prev) => prev + 1);
      setSuccess(t("templateCreated", { name: created.data.name }));
      void loadData();
    } catch (createError) {
      setError(toErrorMessage(createError));
    } finally {
      setIsCreatingTemplate(false);
      setIsGalleryUploading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{t("title")}</h1>
          <p className="text-sm text-gray-500 md:text-base">{t("subtitle")}</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button asChild variant="outline">
            <Link href={adminBase}>{t("inventory")}</Link>
          </Button>
          <Button asChild className="bg-black text-white hover:bg-gray-800">
            <Link href={`${adminBase}/add-stock`}>{t("goToAddProduct")}</Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div className="flex-1">
            <p className="font-semibold text-red-900">{t("actionFailed")}</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div className="flex-1">
            <p className="font-semibold text-emerald-900">{t("success")}</p>
            <p className="text-sm text-emerald-700">{success}</p>
          </div>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("templateForm")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">
                {t("category")} <span className="text-red-600">*</span>
              </label>
              <select
                value={templateForm.parentCategory}
                onChange={(e) => {
                  const parentCategory = e.target.value as ParentCategory;
                  setTemplateForm((prev) => ({
                    ...prev,
                    parentCategory,
                    subcategoryName: "",
                    storage: "",
                  }));
                }}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="phones">{t("phones")}</option>
                <option value="tablets">{t("tablets")}</option>
                <option value="accessories">{t("accessories")}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">
                {t("brandSubcategory")} <span className="text-red-600">*</span>
              </label>
              <div ref={brandPickerRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsBrandPickerOpen((prev) => !prev)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <img
                      src={
                        selectedBrandOption
                          ? failedBrandLogos[
                              normalizeBrandKey(selectedBrandOption.name)
                            ]
                            ? buildFallbackBrandLogoUrl(
                                selectedBrandOption.name,
                              )
                            : (selectedBrandOption.logoUrl ??
                              buildFallbackBrandLogoUrl(
                                selectedBrandOption.name,
                              ))
                          : buildFallbackBrandLogoUrl(
                              templateForm.subcategoryName.trim(),
                            )
                      }
                      onError={() => {
                        if (!selectedBrandOption?.logoUrl) return;
                        const normalized = normalizeBrandKey(
                          selectedBrandOption.name,
                        );
                        setFailedBrandLogos((prev) =>
                          prev[normalized]
                            ? prev
                            : { ...prev, [normalized]: true },
                        );
                      }}
                      alt={`${templateForm.subcategoryName || "Brand"} logo`}
                      className="h-5 w-5 rounded-full border bg-white object-contain"
                    />
                    {templateForm.subcategoryName.trim() || t("selectBrand")}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {isBrandPickerOpen && (
                  <div className="absolute z-20 mt-2 w-full rounded-md border bg-white p-2 shadow-md">
                    <Input
                      placeholder={t("searchBrand")}
                      value={brandQuery}
                      onChange={(e) => setBrandQuery(e.target.value)}
                    />
                    <div className="mt-2 max-h-64 overflow-y-auto">
                      {filteredBrandOptions.map((brand) => {
                        const isSelected =
                          brand.name.toLowerCase() ===
                          templateForm.subcategoryName.trim().toLowerCase();
                        return (
                          <button
                            key={brand.name}
                            type="button"
                            onClick={() => {
                              setTemplateForm((prev) => ({
                                ...prev,
                                subcategoryName: brand.name,
                              }));
                              setIsBrandPickerOpen(false);
                              setBrandQuery("");
                            }}
                            className="flex w-full items-center justify-between rounded px-2 py-2 text-left text-sm hover:bg-gray-100"
                          >
                            <span className="flex items-center gap-2">
                              <img
                                src={
                                  failedBrandLogos[
                                    normalizeBrandKey(brand.name)
                                  ]
                                    ? buildFallbackBrandLogoUrl(brand.name)
                                    : (brand.logoUrl ??
                                      buildFallbackBrandLogoUrl(brand.name))
                                }
                                onError={() => {
                                  if (!brand.logoUrl) return;
                                  const normalized = normalizeBrandKey(
                                    brand.name,
                                  );
                                  setFailedBrandLogos((prev) =>
                                    prev[normalized]
                                      ? prev
                                      : { ...prev, [normalized]: true },
                                  );
                                }}
                                alt={`${brand.name} logo`}
                                className="h-5 w-5 rounded-full border bg-white object-contain"
                              />
                              {brand.name}
                            </span>
                            {isSelected && (
                              <Check className="h-4 w-4 text-black" />
                            )}
                          </button>
                        );
                      })}
                      {filteredBrandOptions.length === 0 && (
                        <p className="px-2 py-2 text-sm text-gray-500">
                          {t("noBrandsFound")}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">
                {t("templateName")} <span className="text-red-600">*</span>
              </label>
              <Input
                placeholder={t("templateNamePlaceholder")}
                value={templateForm.name}
                onChange={(e) =>
                  setTemplateForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            {!isAccessoryCategory && (
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  {t("storage")} <span className="text-red-600">*</span>
                </label>
                <select
                  value={templateForm.storage}
                  onChange={(e) => {
                    const value = e.target.value;
                    setTemplateForm((prev) => ({
                      ...prev,
                      storage: value,
                    }));
                  }}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="">{t("selectStorage")}</option>
                  {STORAGE_PRESETS[templateForm.parentCategory].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium">
                {t("color")} <span className="text-red-600">*</span>
              </label>
              <Input
                placeholder={t("colorPlaceholder")}
                value={templateForm.color}
                onChange={(e) =>
                  setTemplateForm((prev) => ({
                    ...prev,
                    color: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">{t("description")}</label>
              <Input
                placeholder={t("descriptionPlaceholder")}
                value={templateForm.description}
                onChange={(e) =>
                  setTemplateForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium">{t("specifications")}</label>
            <textarea
              value={templateForm.specificationsText}
              onChange={(e) =>
                setTemplateForm((prev) => ({
                  ...prev,
                  specificationsText: e.target.value,
                }))
              }
              placeholder={t("specificationsPlaceholder")}
              className="mt-2 min-h-24 w-full rounded-md border border-input px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-4 space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-medium">{t("coverImage")}</p>
              <p className="text-xs text-gray-500">{t("coverImageHint")}</p>
              <div className="space-y-3">
                <FileUploadDemo
                  key={`cover-upload-${coverUploadKey}`}
                  className="min-h-55 max-w-none"
                  onFilesChange={(files) => {
                    void onUploadCoverImage(files);
                  }}
                />
                <p className="text-xs text-gray-500">
                  {t("uploadImageDemoHint")}
                </p>
                {isCoverUploading && (
                  <span className="inline-flex items-center text-sm text-gray-600">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("uploadingCover")}
                  </span>
                )}
                {coverImage && (
                  <div className="rounded-lg border bg-gray-50 p-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={coverImage.url}
                        alt={coverImage.name}
                        className="h-20 w-20 rounded-md border bg-white object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {coverImage.name}
                        </p>
                        <p className="break-all text-xs text-gray-600">
                          {t("imageUrl", { url: coverImage.url })}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCoverImage(null);
                          setCoverUploadKey((prev) => prev + 1);
                        }}
                      >
                        {t("removeImage")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">{t("galleryImages")}</p>
              <p className="text-xs text-gray-500">{t("galleryImagesHint")}</p>
              <div className="space-y-3">
                <FileUploadDemo
                  key={`gallery-upload-${galleryUploadKey}`}
                  multiple
                  className="min-h-55 max-w-none"
                  onFilesChange={(files) => {
                    void onUploadGalleryImages(files);
                  }}
                />
                <p className="text-xs text-gray-500">
                  {t("uploadGalleryDemoHint")}
                </p>
                {isGalleryUploading && (
                  <span className="inline-flex items-center text-sm text-gray-600">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("uploadingGallery")}
                  </span>
                )}
                {galleryImages.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {galleryImages.map((image) => (
                      <div
                        key={image.key}
                        className="rounded-lg border bg-gray-50 p-3"
                      >
                        <img
                          src={image.url}
                          alt={image.name}
                          className="mb-3 h-32 w-full rounded-md border bg-white object-cover"
                        />
                        <p className="truncate text-sm font-medium text-gray-900">
                          {image.name}
                        </p>
                        <p className="mt-1 break-all text-xs text-gray-600">
                          {t("imageUrl", { url: image.url })}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => {
                            removeQueuedGalleryImage(image.key);
                          }}
                        >
                          {t("removeImage")}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={templateForm.isActive}
              onChange={(e) =>
                setTemplateForm((prev) => ({
                  ...prev,
                  isActive: e.target.checked,
                }))
              }
            />
            <span>{t("templateActive")}</span>
          </div>

          <div className="mt-5 flex justify-end">
            <Button
              onClick={onCreateTemplate}
              disabled={
                isCreatingTemplate || isCoverUploading || isGalleryUploading
              }
              className="bg-black text-white hover:bg-gray-800"
            >
              {isCreatingTemplate ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  {t("creatingTemplate")}
                </>
              ) : (
                t("createTemplate")
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("templates", { count: filteredTemplates.length })}
          </CardTitle>
          <Input
            placeholder={t("searchTemplatePlaceholder")}
            value={templateSearch}
            onChange={(e) => setTemplateSearch(e.target.value)}
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-gray-500">
              <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
              {t("loadingTemplates")}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <p className="text-sm text-gray-500">{t("noTemplatesFound")}</p>
          ) : (
            <div className="space-y-2">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="rounded-md border p-3">
                  <p className="font-medium">{templateLabel(template)}</p>
                  <p className="text-sm text-gray-600">
                    {t("brand", { brand: template.subcategoryName || "-" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
