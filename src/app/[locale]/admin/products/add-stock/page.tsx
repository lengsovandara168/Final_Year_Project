"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { locales } from "@/i18n/routing";
import { getSessionSnapshot } from "@/lib/auth-session";
import {
  createProduct,
  getProductTemplates,
  type ProductTemplate,
} from "@/lib/api";

function toErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "error" in error) {
    return String((error as { error?: unknown }).error ?? "Unknown error");
  }
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message ?? "Unknown error");
  }
  return "Something went wrong. Please try again.";
}

function templateLabel(template: ProductTemplate) {
  return `${template.name} (${template.storage}, ${template.color})`;
}

type StockFormState = {
  imei: string;
  price: string;
  originalPrice: string;
  inStock: boolean;
  isPopular: boolean;
  isBestSeller: boolean;
};

const initialStockForm: StockFormState = {
  imei: "",
  price: "",
  originalPrice: "",
  inStock: true,
  isPopular: false,
  isBestSeller: false,
};

export default function AddStockPage() {
  const pathname = usePathname();
  const router = useRouter();

  const [templates, setTemplates] = useState<ProductTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templateSearch, setTemplateSearch] = useState("");
  const [stockForm, setStockForm] = useState<StockFormState>(initialStockForm);

  const [isLoading, setIsLoading] = useState(true);
  const [isAddingStock, setIsAddingStock] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  const loadTemplates = useCallback(async () => {
    const accessToken = await ensureAccessToken();
    if (!accessToken) return;

    try {
      setIsLoading(true);
      setError(null);
      const templatesResponse = await getProductTemplates(accessToken);
      const loadedTemplates = Array.isArray(templatesResponse.data)
        ? templatesResponse.data
        : [];
      setTemplates(loadedTemplates);
      if (loadedTemplates.length > 0) {
        setSelectedTemplateId((prev) => prev || loadedTemplates[0].id);
      }
    } catch (loadError) {
      setError(toErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [ensureAccessToken]);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  const templateById = useMemo(() => {
    return new Map(templates.map((template) => [template.id, template]));
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    const normalized = templateSearch.trim().toLowerCase();
    if (!normalized) return templates;

    return templates.filter((template) => {
      return (
        template.name.toLowerCase().includes(normalized) ||
        template.storage.toLowerCase().includes(normalized) ||
        template.color.toLowerCase().includes(normalized) ||
        (template.subcategoryName ?? "").toLowerCase().includes(normalized)
      );
    });
  }, [templateSearch, templates]);

  const onAddStock = async () => {
    setError(null);
    setSuccess(null);

    const accessToken = await ensureAccessToken();
    if (!accessToken) return;

    if (!selectedTemplateId) {
      setError("Please select a template first.");
      return;
    }

    if (!stockForm.imei.trim() || !stockForm.price.trim()) {
      setError("IMEI and price are required.");
      return;
    }

    const parsedPrice = Number(stockForm.price);
    const parsedOriginalPrice = stockForm.originalPrice.trim()
      ? Number(stockForm.originalPrice)
      : undefined;

    if (Number.isNaN(parsedPrice)) {
      setError("Price must be a valid number.");
      return;
    }

    if (parsedOriginalPrice !== undefined && Number.isNaN(parsedOriginalPrice)) {
      setError("Original price must be a valid number.");
      return;
    }

    try {
      setIsAddingStock(true);

      const created = await createProduct(
        {
          templateId: selectedTemplateId,
          imei: stockForm.imei.trim(),
          price: parsedPrice,
          originalPrice: parsedOriginalPrice,
          inStock: stockForm.inStock,
          isPopular: stockForm.isPopular,
          isBestSeller: stockForm.isBestSeller,
        },
        accessToken,
      );

      setStockForm((prev) => ({ ...prev, imei: "" }));
      setSuccess(`Stock item added: ${created.data.name} (${created.data.imei})`);
    } catch (stockError) {
      setError(toErrorMessage(stockError));
    } finally {
      setIsAddingStock(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Add Product (From Template)</h1>
          <p className="text-sm text-gray-500 md:text-base">
            Select an existing template, set price, then scan IMEI to insert products.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button asChild variant="outline">
            <Link href={adminBase}>Inventory</Link>
          </Button>
          <Button asChild className="bg-black text-white hover:bg-gray-800">
            <Link href={`${adminBase}/templates`}>Build Template</Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div className="flex-1">
            <p className="font-semibold text-red-900">Action failed</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div className="flex-1">
            <p className="font-semibold text-emerald-900">Success</p>
            <p className="text-sm text-emerald-700">{success}</p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Stock Entry</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-gray-500">
              <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
              Loading templates...
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium">Search Template</label>
                <Input
                  placeholder="Search by model, storage, color, or brand"
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium">
                  Select Template <span className="text-red-600">*</span>
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="">Choose template</option>
                  {filteredTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {templateLabel(template)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedTemplateId && templateById.get(selectedTemplateId) && (
                <div className="rounded-md border bg-gray-50 p-3 text-sm md:col-span-2">
                  <p className="font-medium text-gray-900">
                    {templateLabel(templateById.get(selectedTemplateId)!)}
                  </p>
                  <p className="text-gray-600">
                    Brand: {templateById.get(selectedTemplateId)!.subcategoryName || "-"}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-medium">
                  IMEI <span className="text-red-600">*</span>
                </label>
                <Input
                  placeholder="Scan or enter 15-digit IMEI"
                  value={stockForm.imei}
                  onChange={(e) => setStockForm((prev) => ({ ...prev, imei: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (!isAddingStock) void onAddStock();
                    }
                  }}
                />
                <p className="text-xs text-gray-500">
                  Tip: scanner Enter key will add each product instantly.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Price (USD) <span className="text-red-600">*</span>
                </label>
                <Input
                  placeholder="e.g. 1299"
                  type="number"
                  value={stockForm.price}
                  onChange={(e) => setStockForm((prev) => ({ ...prev, price: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Original Price (Optional)</label>
                <Input
                  placeholder="e.g. 1399"
                  type="number"
                  value={stockForm.originalPrice}
                  onChange={(e) =>
                    setStockForm((prev) => ({ ...prev, originalPrice: e.target.value }))
                  }
                />
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm md:col-span-2">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={stockForm.inStock}
                    onChange={(e) =>
                      setStockForm((prev) => ({ ...prev, inStock: e.target.checked }))
                    }
                  />
                  In Stock
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={stockForm.isPopular}
                    onChange={(e) =>
                      setStockForm((prev) => ({ ...prev, isPopular: e.target.checked }))
                    }
                  />
                  Popular
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={stockForm.isBestSeller}
                    onChange={(e) =>
                      setStockForm((prev) => ({ ...prev, isBestSeller: e.target.checked }))
                    }
                  />
                  Best Seller
                </label>
              </div>

              <div className="mt-4 flex justify-end md:col-span-2">
                <Button
                  onClick={onAddStock}
                  disabled={isAddingStock}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  {isAddingStock ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding Stock...
                    </>
                  ) : (
                    "Add Product"
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
