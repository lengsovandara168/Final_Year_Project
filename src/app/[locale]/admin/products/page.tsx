"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AlertCircle, Loader2, Plus, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { locales } from "@/i18n/routing";
import { getSessionSnapshot } from "@/lib/auth-session";
import {
  getAddProductSubcategories,
  getProductTemplates,
  getProducts,
  type Product,
  type ProductTemplate,
} from "@/lib/api";
import { useTranslations } from "next-intl";

function getStockBadge(inStock: boolean) {
  return inStock ? "bg-black text-white" : "bg-red-600 text-white";
}

function toErrorMessage(error: unknown, defaultMessage: string = "Something went wrong.") {
  if (error && typeof error === "object" && "error" in error) {
    return String((error as { error?: unknown }).error ?? "Unknown error");
  }
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message ?? "Unknown error");
  }
  return defaultMessage;
}

function asNumberOrNull(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function templateLabel(template: ProductTemplate) {
  return `${template.name} (${template.storage}, ${template.color})`;
}

export default function ProductsPage() {
  const t = useTranslations("AdminProducts");
  const pathname = usePathname();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [templates, setTemplates] = useState<ProductTemplate[]>([]);
  const [subcategoryNameById, setSubcategoryNameById] = useState<
    Map<string, string>
  >(new Map());

  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      const [productsResponse, templatesResponse, subcategoriesResponse] =
        await Promise.all([
          getProducts(accessToken),
          getProductTemplates(accessToken),
          getAddProductSubcategories(accessToken),
        ]);

      setProducts(
        Array.isArray(productsResponse.data) ? productsResponse.data : [],
      );
      setTemplates(
        Array.isArray(templatesResponse.data) ? templatesResponse.data : [],
      );

      const names = new Map<string, string>();
      for (const category of ["phones", "tablets", "accessories"] as const) {
        for (const item of subcategoriesResponse.data[category] ?? []) {
          names.set(item.id, item.name);
        }
      }
      for (const template of templatesResponse.data ?? []) {
        if (template.subcategoryId && template.subcategoryName) {
          names.set(template.subcategoryId, template.subcategoryName);
        }
      }
      setSubcategoryNameById(names);
    } catch (loadError) {
      setError(toErrorMessage(loadError, t("loadErrorTitle")));
    } finally {
      setIsLoading(false);
    }
  }, [ensureAccessToken]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const templateById = useMemo(() => {
    return new Map(templates.map((template) => [template.id, template]));
  }, [templates]);

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products;

    return products.filter((product) => {
      const template = product.templateId
        ? templateById.get(product.templateId)
        : null;
      const subcategoryName =
        subcategoryNameById.get(product.subcategoryId) ?? "";

      return (
        product.name.toLowerCase().includes(normalized) ||
        product.imei.toLowerCase().includes(normalized) ||
        subcategoryName.toLowerCase().includes(normalized) ||
        template?.name.toLowerCase().includes(normalized)
      );
    });
  }, [products, query, subcategoryNameById, templateById]);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{t("title")}</h1>
          <p className="text-sm text-gray-500 md:text-base">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button asChild className="bg-black text-white hover:bg-gray-800">
            <Link href={`${adminBase}/templates`}>
              <Plus className="mr-2 h-4 w-4" /> {t("buildTemplate")}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`${adminBase}/add-stock`}>{t("addProduct")}</Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div className="flex-1">
            <p className="font-semibold text-red-900">{t("loadErrorTitle")}</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{t("inventory", { count: filteredProducts.length })}</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder={t("searchPlaceholder")}
                className="pl-8"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-gray-500">
              <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
              {t("loading")}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <p className="text-lg font-medium">{t("emptyTitle")}</p>
              <p className="text-sm">{t("emptySubtitle")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("name")}</TableHead>
                    <TableHead>{t("template")}</TableHead>
                    <TableHead>{t("imei")}</TableHead>
                    <TableHead>{t("price")}</TableHead>
                    <TableHead>{t("brand")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const template = product.templateId
                      ? templateById.get(product.templateId)
                      : null;
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell>
                          {template ? templateLabel(template) : "-"}
                        </TableCell>
                        <TableCell>{product.imei}</TableCell>
                        <TableCell className="font-medium">
                          {asNumberOrNull(product.price) !== null
                            ? `$${product.price.toFixed(2)}`
                            : "-"}
                        </TableCell>
                        <TableCell>{subcategoryNameById.get(product.subcategoryId) || t("unknown")}</TableCell>
                        <TableCell>
                          <Badge className={getStockBadge(Boolean(product.inStock))}>
                            {product.inStock ? t("inStock") : t("outOfStock")}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
