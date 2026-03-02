"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Image as ImageIcon,
  ImagePlus,
  Loader2,
} from "lucide-react";
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
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
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
  }, [fetchGroups]);

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

    if (!name.trim()) {
      setErrorMessage("Display name is required.");
      return;
    }

    if (!slug.trim()) {
      setErrorMessage("Slug is required.");
      return;
    }

    if (!iconKey) {
      setErrorMessage("Please select an icon. It will auto-upload.");
      return;
    }

    try {
      setIsCreating(true);
      const response = await createSubcategory(
        {
          parentCategory,
          name: name.trim(),
          slug: slug.trim(),
          iconKey,
          iconUrl: iconUrl ?? undefined,
          isActive: true,
        },
        accessToken,
      );

      setName("");
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
          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-zinc-700"
              htmlFor="parentCategory"
            >
              Parent Category
            </label>
            <div className="relative">
              <select
                id="parentCategory"
                value={parentCategory}
                onChange={(event) =>
                  setParentCategory(event.target.value as ParentCategory)
                }
                className="h-14 w-full appearance-none rounded-2xl border border-zinc-200 bg-zinc-50 px-5 text-base font-medium text-zinc-900 outline-none transition focus:ring-2 focus:ring-zinc-900/10"
              >
                <option value="phones">Phones</option>
                <option value="tablets">Tablets</option>
                <option value="accessories">Accessories</option>
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-5 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label
                className="text-sm font-semibold text-zinc-700"
                htmlFor="name"
              >
                Display Name
              </label>
              <input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Apple"
                className="h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-5 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900/10"
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-semibold text-zinc-700"
                htmlFor="slug"
              >
                Slug
              </label>
              <input
                id="slug"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="e.g. apple-phones"
                className="h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-5 font-mono text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900/10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-zinc-700"
              htmlFor="icon-upload"
            >
              Icon File (max 5MB)
            </label>
            <input
              id="icon-upload"
              type="file"
              accept={ICON_ACCEPT}
              className="sr-only"
              onChange={async (event) => {
                const inputElement = event.currentTarget;
                const file = event.target.files?.[0] ?? null;
                if (file) {
                  await uploadIconImmediately(file);
                }
                inputElement.value = "";
              }}
            />
            <label
              htmlFor="icon-upload"
              className="group flex min-h-32 cursor-pointer flex-col items-center justify-center gap-5 rounded-3xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-6 py-10 text-center transition-colors hover:border-zinc-400"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-200 text-zinc-500 transition-colors group-hover:bg-zinc-300">
                {isUploadingIcon ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <ImageIcon className="h-8 w-8" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-semibold text-zinc-900">
                  {selectedIconName ? "Change Icon" : "Choose Icon"}
                </p>
                <p className="text-base text-zinc-400">
                  PNG, JPEG, WEBP, SVG, AVIF. Up to 5MB.
                </p>
              </div>
            </label>
            {selectedIconName ? (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-900">
                      {selectedIconName}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {isUploadingIcon
                        ? "Uploading..."
                        : iconKey
                          ? "Uploaded and ready"
                          : "Not uploaded"}
                    </p>
                  </div>
                  {iconKey && !isUploadingIcon ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : isUploadingIcon ? (
                    <ImagePlus className="h-5 w-5 text-zinc-500" />
                  ) : null}
                </div>
                {iconPreviewUrl || iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={iconUrl ?? iconPreviewUrl ?? ""}
                    alt="Selected category icon preview"
                    className="mt-4 h-20 w-20 rounded-xl border border-zinc-200 bg-white object-contain p-1"
                  />
                ) : null}
              </div>
            ) : null}
          </div>

          {iconKey ? (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-sm">
              <p className="font-semibold text-zinc-800">Uploaded icon key</p>
              <p className="break-all text-zinc-500">{iconKey}</p>
            </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </div>
          ) : null}

          <div className="pt-1">
            <button
              type="button"
              onClick={onCreateSubcategory}
              disabled={isCreating || isUploadingIcon || !iconKey}
              className="inline-flex h-14 items-center justify-center rounded-2xl bg-zinc-900 px-10 text-lg font-semibold text-white shadow-lg shadow-zinc-900/10 transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreating ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : null}
              Create Subcategory
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
          Current Subcategories
        </h2>
        {isFetching ? (
          <div className="flex items-center text-sm text-zinc-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading categories...
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {groups.map((group) => (
              <div
                key={group.key}
                className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 px-6 py-5">
                  <h3 className="text-2xl font-bold text-zinc-900">
                    {group.name}
                  </h3>
                  <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-zinc-200 bg-white px-2 text-sm font-medium text-zinc-400">
                    {group.total}
                  </span>
                </div>
                <div className="min-h-35 space-y-3 px-6 py-5">
                  {group.total === 0 ? (
                    <p className="text-base italic text-zinc-400">
                      No subcategories yet.
                    </p>
                  ) : (
                    group.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        {item.iconUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.iconUrl}
                            alt={`${item.name} icon`}
                            className="h-8 w-8 rounded-lg border border-zinc-100 bg-zinc-50 object-contain p-1"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-100 bg-zinc-50 text-zinc-400">
                            <ImageIcon className="h-4 w-4" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">
                            {item.name}
                          </p>
                          <p className="text-[11px] font-mono text-zinc-400">
                            {item.slug}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
