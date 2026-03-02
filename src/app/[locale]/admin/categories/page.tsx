"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { getSessionSnapshot } from "@/lib/auth-session";
import {
  type ApiError,
  type CategoryBoardGroup,
  type ParentCategory,
  createSubcategory,
  getCategoryBoard,
  uploadCategoryIcon,
} from "@/lib/api";
import { locales } from "@/i18n/routing";
import {
  PHONE_MODELS,
  TABLET_MODELS,
  ACCESSORY_MODELS,
  generateSlug,
  getBrandName,
  getModelsByCategory,
} from "@/lib/models";
import {
  BrandSelector,
  CategoryNameInput,
  CreateButton,
  FormMessage,
  IconUploadSection,
  ModelSelector,
  ParentCategorySelect,
  SlugInput,
  SubcategoriesDisplay,
} from "./components";

const ICON_ACCEPT = "image/png,image/jpeg,image/webp,image/svg+xml,image/avif";
const MAX_ICON_SIZE_BYTES = 5 * 1024 * 1024;
const PARENT_CATEGORIES: ParentCategory[] = [
  "phones",
  "tablets",
  "accessories",
];

const emptyBoardGroups = (): CategoryBoardGroup[] => [
  { key: "phones", name: "Phones", total: 0, items: [] },
  { key: "tablets", name: "Tablets", total: 0, items: [] },
  { key: "accessories", name: "Accessories", total: 0, items: [] },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeBoardGroups(data: CategoryBoardGroup[]) {
  const byKey = new Map(data.map((group) => [group.key, group]));
  return PARENT_CATEGORIES.map((key) => {
    const group = byKey.get(key);
    if (group) {
      return group;
    }

    const fallback = emptyBoardGroups().find((item) => item.key === key);
    return fallback ?? { key, name: key, total: 0, items: [] };
  });
}

function getAvailableBrands(
  category: ParentCategory,
  customBrands: Record<string, string[]>,
): { key: string; name: string }[] {
  const models = getModelsByCategory(category);
  const predefinedBrands = Object.keys(models).map((key) => ({
    key,
    name: getBrandName(key),
  }));

  const customEntries = (customBrands[category] || []).map((name) => ({
    key: `custom-${name.toLowerCase()}`,
    name,
  }));

  return [...predefinedBrands, ...customEntries];
}

function getAvailableModels(
  category: ParentCategory,
  brandKey: string,
  customBrands: Record<string, string[]>,
): { name: string; slug: string }[] {
  const models = getModelsByCategory(category);

  if (brandKey.startsWith("custom-")) {
    const customBrandName = brandKey.replace("custom-", "");
    return (customBrands[category] || [])
      .filter((name) => name.toLowerCase() === customBrandName.toLowerCase())
      .flatMap((brandName) => {
        const customModelKey = `custom-models-${brandName.toLowerCase()}`;
        const storedModels = localStorage?.getItem(customModelKey);
        return storedModels ? JSON.parse(storedModels) : [];
      });
  }

  return models[brandKey] || [];
}

function toApiMessage(error: unknown) {
  if (isRecord(error) && typeof error.message === "string") {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export default function ManageCategoriesPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [groups, setGroups] = useState<CategoryBoardGroup[]>(emptyBoardGroups);
  const [isFetching, setIsFetching] = useState(false);
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [parentCategory, setParentCategory] =
    useState<ParentCategory>("phones");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [customBrandName, setCustomBrandName] = useState("");
  const [customModelName, setCustomModelName] = useState("");
  const [useCustomBrand, setUseCustomBrand] = useState(false);
  const [useCustomModel, setUseCustomModel] = useState(false);
  const [customName, setCustomName] = useState("");
  const [useCustomName, setUseCustomName] = useState(false);
  const [slug, setSlug] = useState("");
  const [customBrands, setCustomBrands] = useState<Record<string, string[]>>({
    phones: [],
    tablets: [],
    accessories: [],
  });
  const [iconPreviewUrl, setIconPreviewUrl] = useState<string | null>(null);
  const [selectedIconName, setSelectedIconName] = useState<string | null>(null);
  const [iconKey, setIconKey] = useState<string | null>(null);
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const ensureAccessToken = useCallback(async () => {
    const snapshot = getSessionSnapshot();
    if (snapshot.accessToken) {
      return snapshot.accessToken;
    }

    const locale = pathname?.split("/").filter(Boolean)[0];
    const hasLocale = locale && (locales as readonly string[]).includes(locale);
    const next = `${window.location.pathname}${window.location.search}`;
    router.push(
      `${hasLocale ? `/${locale}` : "/en"}/login?next=${encodeURIComponent(next)}`,
    );
    return null;
  }, [pathname, router]);

  const fetchGroups = useCallback(async () => {
    const accessToken = await ensureAccessToken();
    if (!accessToken) {
      setErrorMessage("Missing access token. Please log in again.");
      return;
    }

    try {
      setIsFetching(true);
      const response = await getCategoryBoard(accessToken);
      if (!Array.isArray(response.data)) {
        setGroups(emptyBoardGroups());
        return;
      }
      setGroups(normalizeBoardGroups(response.data));
    } catch (error) {
      setErrorMessage(toApiMessage(error));
    } finally {
      setIsFetching(false);
    }
  }, [ensureAccessToken]);

  useEffect(() => {
    void fetchGroups();

    // Load custom brands from localStorage
    const loadedCustomBrands = {
      phones: JSON.parse(localStorage?.getItem("customBrands-phones") || "[]"),
      tablets: JSON.parse(
        localStorage?.getItem("customBrands-tablets") || "[]",
      ),
      accessories: JSON.parse(
        localStorage?.getItem("customBrands-accessories") || "[]",
      ),
    };
    setCustomBrands(loadedCustomBrands);
  }, [fetchGroups]);

  useEffect(() => {
    if (selectedBrand || useCustomBrand || selectedModel) {
      const displayName = useCustomName
        ? customName
        : useCustomBrand
          ? customBrandName
          : useCustomModel
            ? customModelName
            : selectedModel
              ? selectedModel
              : selectedBrand
                ? getBrandName(selectedBrand)
                : "";

      if (displayName && !useCustomName) {
        setSlug(generateSlug(displayName));
      }
    }
  }, [
    selectedBrand,
    selectedModel,
    useCustomBrand,
    useCustomModel,
    useCustomName,
    customName,
    customBrandName,
    customModelName,
  ]);

  useEffect(() => {
    if (useCustomName && customName) {
      setSlug(generateSlug(customName));
    }
  }, [useCustomName, customName]);

  useEffect(
    () => () => {
      if (iconPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(iconPreviewUrl);
      }
    },
    [iconPreviewUrl],
  );

  const uploadIconImmediately = async (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIconKey(null);
    setIconUrl(null);

    const accessToken = await ensureAccessToken();
    if (!accessToken) {
      setErrorMessage("Missing access token. Please log in again.");
      return;
    }

    if (!ICON_ACCEPT.split(",").includes(file.type)) {
      setErrorMessage(
        "Invalid file type. Please upload PNG, JPEG, WEBP, SVG, or AVIF.",
      );
      return;
    }

    if (file.size > MAX_ICON_SIZE_BYTES) {
      setErrorMessage("File is too large. Maximum file size is 5MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setIconPreviewUrl((previousUrl) => {
      if (previousUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previousUrl);
      }
      return previewUrl;
    });
    setSelectedIconName(file.name);

    try {
      setIsUploadingIcon(true);
      const response = await uploadCategoryIcon(file, accessToken);
      setIconKey(response.data.key);
      setIconUrl(response.data.url ?? null);
      setSuccessMessage("Icon uploaded successfully.");
    } catch (error) {
      setErrorMessage(toApiMessage(error));
    } finally {
      setIsUploadingIcon(false);
    }
  };

  const onCreateSubcategory = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const accessToken = await ensureAccessToken();
    if (!accessToken) {
      setErrorMessage("Missing access token. Please log in again.");
      return;
    }

    const displayName = useCustomName
      ? customName
      : useCustomBrand
        ? customBrandName
        : useCustomModel
          ? customModelName
          : selectedModel
            ? selectedModel
            : selectedBrand
              ? getBrandName(selectedBrand)
              : "";

    if (!displayName.trim()) {
      setErrorMessage("Please select a brand/model or enter a custom name.");
      return;
    }

    if (!slug.trim()) {
      setErrorMessage("Slug is required.");
      return;
    }

    if (!iconKey) {
      setErrorMessage("Please select an icon.");
      return;
    }

    try {
      setIsCreating(true);

      // Save custom brand if it's a new one
      if (useCustomBrand && customBrandName.trim()) {
        const updatedCustomBrands = { ...customBrands };
        if (!updatedCustomBrands[parentCategory].includes(customBrandName)) {
          updatedCustomBrands[parentCategory] = [
            ...updatedCustomBrands[parentCategory],
            customBrandName,
          ];
          setCustomBrands(updatedCustomBrands);
          localStorage.setItem(
            `customBrands-${parentCategory}`,
            JSON.stringify(updatedCustomBrands[parentCategory]),
          );
        }
      }

      // Save custom model if it's a new one
      if (useCustomModel && customModelName.trim() && selectedBrand) {
        const customModelKey = `custom-models-${selectedBrand.toLowerCase()}`;
        const existingModels = localStorage?.getItem(customModelKey);
        const modelsList = existingModels ? JSON.parse(existingModels) : [];

        if (!modelsList.some((m: any) => m.name === customModelName)) {
          modelsList.push({
            name: customModelName,
            slug: generateSlug(customModelName),
          });
          localStorage.setItem(customModelKey, JSON.stringify(modelsList));
        }
      }

      const response = await createSubcategory(
        {
          parentCategory,
          name: displayName.trim(),
          slug: slug.trim(),
          iconKey,
          iconUrl: iconUrl ?? undefined,
          isActive: true,
        },
        accessToken,
      );

      setSelectedBrand(null);
      setSelectedModel(null);
      setCustomBrandName("");
      setCustomModelName("");
      setUseCustomBrand(false);
      setUseCustomModel(false);
      setCustomName("");
      setUseCustomName(false);
      setSlug("");
      setSelectedIconName(null);
      setIconPreviewUrl((previousUrl) => {
        if (previousUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(previousUrl);
        }
        return null;
      });
      setIconKey(null);
      setIconUrl(null);
      setSuccessMessage(`Created subcategory: ${response.data.name}`);
      await fetchGroups();
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.status === 409) {
        setErrorMessage(apiError.message);
      } else {
        setErrorMessage(toApiMessage(error));
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 md:text-5xl">
          Manage Categories
        </h1>
        <p className="text-base text-zinc-500">
          Upload icon and create subcategories under phones, tablets, or
          accessories.
        </p>
      </div>

      <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-6 py-5 md:px-8">
          <h2 className="text-2xl font-semibold text-zinc-900">
            Create Subcategory
          </h2>
        </div>

        <div className="space-y-6 px-6 py-6 md:px-8 md:py-8">
          {/* Parent Category */}
          <ParentCategorySelect
            parentCategory={parentCategory}
            onParentCategoryChange={(category) => {
              setParentCategory(category);
              setSelectedBrand(null);
              setSelectedModel(null);
            }}
          />

          {/* Brand Selector */}
          <BrandSelector
            parentCategory={parentCategory}
            selectedBrand={selectedBrand}
            useCustomBrand={useCustomBrand}
            customBrandName={customBrandName}
            availableBrands={getAvailableBrands(parentCategory, customBrands)}
            onBrandChange={(brand) => {
              setSelectedBrand(brand);
              setSelectedModel(null);
              setUseCustomModel(false);
              setCustomModelName("");
            }}
            onUseCustomBrandChange={setUseCustomBrand}
            onCustomBrandNameChange={setCustomBrandName}
          />

          {/* Model Selector */}
          {!useCustomBrand && selectedBrand && (
            <ModelSelector
              selectedBrand={selectedBrand}
              selectedModel={selectedModel}
              useCustomModel={useCustomModel}
              customModelName={customModelName}
              availableModels={getAvailableModels(
                parentCategory,
                selectedBrand,
                customBrands,
              )}
              onModelChange={setSelectedModel}
              onUseCustomModelChange={setUseCustomModel}
              onCustomModelNameChange={setCustomModelName}
            />
          )}

          {/* Category Name Input */}
          <CategoryNameInput
            selectedBrand={selectedBrand}
            selectedModel={selectedModel}
            useCustomBrand={useCustomBrand}
            useCustomModel={useCustomModel}
            useCustomName={useCustomName}
            customName={customName}
            customBrandName={customBrandName}
            customModelName={customModelName}
            onUseCustomNameChange={setUseCustomName}
            onCustomNameChange={setCustomName}
          />

          {/* Slug Input */}
          <SlugInput slug={slug} onSlugChange={setSlug} />

          {/* Icon Upload Section */}
          <IconUploadSection
            selectedIconName={selectedIconName}
            iconPreviewUrl={iconPreviewUrl}
            iconUrl={iconUrl}
            iconKey={iconKey}
            isUploadingIcon={isUploadingIcon}
            onFileSelect={uploadIconImmediately}
          />

          {/* Error/Success Messages */}
          <FormMessage message={errorMessage} type="error" />
          <FormMessage message={successMessage} type="success" />

          {/* Create Button */}
          <CreateButton
            isLoading={isCreating}
            isDisabled={
              isCreating ||
              isUploadingIcon ||
              !iconKey ||
              (!useCustomBrand && !selectedBrand) ||
              (useCustomBrand && !customBrandName.trim()) ||
              (!useCustomBrand &&
                selectedBrand &&
                !useCustomModel &&
                !selectedModel) ||
              (useCustomModel && !customModelName.trim()) ||
              !slug.trim()
            }
            onClick={onCreateSubcategory}
          />
        </div>
      </section>

      {/* Subcategories Display */}
      <SubcategoriesDisplay groups={groups} isFetching={isFetching} />
    </div>
  );
}
