"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronsUpDown,
  Download,
  Loader2,
  Plus,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

function toErrorMessage(
  error: unknown,
  defaultMessage: string = "Something went wrong.",
) {
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

type InventoryViewMode = "grouped" | "unit";
type SortDir = "asc" | "desc";
type GroupedSortKey = "name" | "amount" | "inStockAmount" | "outOfStockAmount";
type UnitSortKey = "name" | "price";

type GroupedInventoryItem = {
  key: string;
  name: string;
  templateText: string;
  brand: string;
  amount: number;
  inStockAmount: number;
  outOfStockAmount: number;
  sampleImei?: string;
};

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active)
    return <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-30" />;
  return dir === "asc" ? (
    <ArrowUp className="ml-1 inline h-3 w-3" />
  ) : (
    <ArrowDown className="ml-1 inline h-3 w-3" />
  );
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob(["\uFEFF" + content], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function resolveBrandName(
  product: Product,
  templateById: Map<string, ProductTemplate>,
  subcategoryNameById: Map<string, string>,
) {
  const fromTemplate = product.templateId
    ? templateById.get(product.templateId)?.subcategoryName
    : undefined;

  return (
    fromTemplate || subcategoryNameById.get(product.subcategoryId) || "Unknown"
  );
}

function buildGroupedInventory(
  products: Product[],
  templateById: Map<string, ProductTemplate>,
  subcategoryNameById: Map<string, string>,
): GroupedInventoryItem[] {
  const grouped = new Map<string, GroupedInventoryItem>();

  for (const product of products) {
    const template = product.templateId
      ? templateById.get(product.templateId)
      : null;
    const brand = resolveBrandName(product, templateById, subcategoryNameById);

    const groupKey = product.templateId
      ? `template:${product.templateId}`
      : `legacy:${product.subcategoryId}:${product.name}:${product.storage ?? ""}:${product.color ?? ""}`;

    const existing = grouped.get(groupKey);
    if (!existing) {
      grouped.set(groupKey, {
        key: groupKey,
        name: product.name,
        templateText: template ? templateLabel(template) : "-",
        brand,
        amount: 1,
        inStockAmount: product.inStock ? 1 : 0,
        outOfStockAmount: product.inStock ? 0 : 1,
        sampleImei: product.imei,
      });
      continue;
    }

    existing.amount += 1;
    if (product.inStock) {
      existing.inStockAmount += 1;
    } else {
      existing.outOfStockAmount += 1;
    }
  }

  return Array.from(grouped.values());
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
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [viewMode, setViewMode] = useState<InventoryViewMode>("grouped");
  const [groupedSortKey, setGroupedSortKey] = useState<GroupedSortKey>("name");
  const [groupedSortDir, setGroupedSortDir] = useState<SortDir>("asc");
  const [unitSortKey, setUnitSortKey] = useState<UnitSortKey>("name");
  const [unitSortDir, setUnitSortDir] = useState<SortDir>("asc");
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
    return products.filter((product) => {
      const template = product.templateId
        ? templateById.get(product.templateId)
        : null;
      const brand = resolveBrandName(
        product,
        templateById,
        subcategoryNameById,
      );

      const matchesBrand =
        selectedBrand === "all" || brand.toLowerCase() === selectedBrand;
      if (!matchesBrand) return false;

      if (!normalized) return true;

      return (
        product.name.toLowerCase().includes(normalized) ||
        product.imei.toLowerCase().includes(normalized) ||
        brand.toLowerCase().includes(normalized) ||
        template?.name.toLowerCase().includes(normalized)
      );
    });
  }, [products, query, selectedBrand, subcategoryNameById, templateById]);

  const groupedProducts = useMemo(() => {
    const items = buildGroupedInventory(
      filteredProducts,
      templateById,
      subcategoryNameById,
    );
    return items.sort((a, b) => {
      let cmp = 0;
      if (groupedSortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (groupedSortKey === "amount") cmp = a.amount - b.amount;
      else if (groupedSortKey === "inStockAmount")
        cmp = a.inStockAmount - b.inStockAmount;
      else cmp = a.outOfStockAmount - b.outOfStockAmount;
      return groupedSortDir === "asc" ? cmp : -cmp;
    });
  }, [
    filteredProducts,
    subcategoryNameById,
    templateById,
    groupedSortKey,
    groupedSortDir,
  ]);

  const brandOptions = useMemo(() => {
    const brands = new Set<string>();
    for (const product of products) {
      const brand = resolveBrandName(
        product,
        templateById,
        subcategoryNameById,
      );
      brands.add(brand);
    }
    return Array.from(brands).sort((a, b) => a.localeCompare(b));
  }, [products, subcategoryNameById, templateById]);

  const sortedUnitProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      let cmp = 0;
      if (unitSortKey === "name") cmp = a.name.localeCompare(b.name);
      else cmp = (a.price ?? 0) - (b.price ?? 0);
      return unitSortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredProducts, unitSortKey, unitSortDir]);

  const handleGroupedSort = useCallback(
    (key: GroupedSortKey) => {
      if (groupedSortKey === key) {
        setGroupedSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setGroupedSortKey(key);
        setGroupedSortDir("asc");
      }
    },
    [groupedSortKey],
  );

  const handleUnitSort = useCallback(
    (key: UnitSortKey) => {
      if (unitSortKey === key) {
        setUnitSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setUnitSortKey(key);
        setUnitSortDir("asc");
      }
    },
    [unitSortKey],
  );

  const handleExportCsv = useCallback(() => {
    const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    if (viewMode === "grouped") {
      const header = [
        "Name",
        "Brand",
        "Template",
        "Total",
        "In Stock",
        "Out of Stock",
        "Status",
      ]
        .map(escape)
        .join(",");
      const rows = groupedProducts.map((item) => {
        const status =
          item.outOfStockAmount === 0
            ? "In Stock"
            : item.inStockAmount === 0
              ? "Out of Stock"
              : "Partial Stock";
        return [
          item.name,
          item.brand,
          item.templateText,
          item.amount,
          item.inStockAmount,
          item.outOfStockAmount,
          status,
        ]
          .map(escape)
          .join(",");
      });
      downloadCsv(
        [header, ...rows].join("\n"),
        `inventory-grouped-${Date.now()}.csv`,
      );
    } else {
      const header = ["Name", "Brand", "Template", "IMEI", "Price", "Status"]
        .map(escape)
        .join(",");
      const rows = sortedUnitProducts.map((product) => {
        const template = product.templateId
          ? templateById.get(product.templateId)
          : null;
        const brand = resolveBrandName(
          product,
          templateById,
          subcategoryNameById,
        );
        const price =
          asNumberOrNull(product.price) !== null
            ? `$${(product.price as number).toFixed(2)}`
            : "-";
        return [
          product.name,
          brand,
          template ? templateLabel(template) : "-",
          product.imei,
          price,
          product.inStock ? "In Stock" : "Out of Stock",
        ]
          .map(escape)
          .join(",");
      });
      downloadCsv(
        [header, ...rows].join("\n"),
        `inventory-units-${Date.now()}.csv`,
      );
    }
  }, [
    viewMode,
    groupedProducts,
    sortedUnitProducts,
    templateById,
    subcategoryNameById,
  ]);

  const totalUnits = products.length;
  const totalInStockUnits = products.filter((p) => p.inStock).length;
  const totalOutOfStockUnits = totalUnits - totalInStockUnits;
  const filteredUnits = filteredProducts.length;

  const selectedBrandLabel =
    selectedBrand === "all"
      ? t("allBrands")
      : (brandOptions.find((brand) => brand.toLowerCase() === selectedBrand) ??
        t("unknown"));

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{t("title")}</h1>
          <p className="text-sm text-gray-500 md:text-base">{t("subtitle")}</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button asChild className="bg-black text-white hover:bg-gray-800">
            <Link href={`${adminBase}/templates`}>
              <Plus className="mr-2 h-4 w-4" /> {t("buildTemplate")}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`${adminBase}/add-stock`}>{t("checkin")}</Link>
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

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{t("totalUnits")}</p>
            <p className="text-2xl font-semibold">{totalUnits}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{t("inStockUnits")}</p>
            <p className="text-2xl font-semibold text-emerald-600">
              {totalInStockUnits}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              {t("outOfStockUnits")}
            </p>
            <p className="text-2xl font-semibold text-red-600">
              {totalOutOfStockUnits}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              {t("filteredUnits")}
            </p>
            <p className="text-2xl font-semibold">{filteredUnits}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>
                {t("inventory", {
                  count:
                    viewMode === "grouped"
                      ? groupedProducts.length
                      : filteredProducts.length,
                })}
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={viewMode === "grouped" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grouped")}
                >
                  {t("groupedView")}
                </Button>
                <Button
                  type="button"
                  variant={viewMode === "unit" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("unit")}
                >
                  {t("unitView")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleExportCsv}
                >
                  <Download className="mr-1.5 h-4 w-4" />
                  {t("exportCsv")}
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder={t("searchPlaceholder")}
                  className="pl-8"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="justify-between sm:w-56">
                    {t("brandFilter")}: {selectedBrandLabel}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="max-h-72 w-64 overflow-y-auto"
                >
                  <DropdownMenuItem onClick={() => setSelectedBrand("all")}>
                    <Check
                      className={`mr-2 h-4 w-4 ${selectedBrand === "all" ? "opacity-100" : "opacity-0"}`}
                    />
                    {t("allBrands")}
                  </DropdownMenuItem>
                  {brandOptions.map((brand) => {
                    const key = brand.toLowerCase();
                    return (
                      <DropdownMenuItem
                        key={brand}
                        onClick={() => setSelectedBrand(key)}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${selectedBrand === key ? "opacity-100" : "opacity-0"}`}
                        />
                        {brand}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {(query || selectedBrand !== "all") && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setQuery("");
                    setSelectedBrand("all");
                  }}
                >
                  {t("clearFilters")}
                </Button>
              )}
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
          ) : viewMode === "grouped" ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer select-none whitespace-nowrap"
                      onClick={() => handleGroupedSort("name")}
                    >
                      {t("name")}
                      <SortIcon
                        active={groupedSortKey === "name"}
                        dir={groupedSortDir}
                      />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none whitespace-nowrap"
                      onClick={() => handleGroupedSort("amount")}
                    >
                      {t("amount")}
                      <SortIcon
                        active={groupedSortKey === "amount"}
                        dir={groupedSortDir}
                      />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none whitespace-nowrap"
                      onClick={() => handleGroupedSort("inStockAmount")}
                    >
                      {t("inStockUnits")}
                      <SortIcon
                        active={groupedSortKey === "inStockAmount"}
                        dir={groupedSortDir}
                      />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none whitespace-nowrap"
                      onClick={() => handleGroupedSort("outOfStockAmount")}
                    >
                      {t("outOfStockUnits")}
                      <SortIcon
                        active={groupedSortKey === "outOfStockAmount"}
                        dir={groupedSortDir}
                      />
                    </TableHead>
                    <TableHead>{t("template")}</TableHead>
                    <TableHead>{t("price")}</TableHead>
                    <TableHead>{t("brand")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedProducts.map((item) => {
                    const statusLabel =
                      item.outOfStockAmount === 0
                        ? t("inStock")
                        : item.inStockAmount === 0
                          ? t("outOfStock")
                          : t("partialStock");

                    const statusClass =
                      item.outOfStockAmount === 0
                        ? "bg-black text-white"
                        : item.inStockAmount === 0
                          ? "bg-red-600 text-white"
                          : "bg-amber-500 text-white";

                    return (
                      <TableRow key={item.key}>
                        <TableCell className="font-medium">
                          <div>
                            <p>{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.sampleImei
                                ? `Sample IMEI: ${item.sampleImei}`
                                : "-"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {item.amount}
                        </TableCell>
                        <TableCell>{item.inStockAmount}</TableCell>
                        <TableCell>{item.outOfStockAmount}</TableCell>
                        <TableCell>{item.templateText}</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>{item.brand || t("unknown")}</TableCell>
                        <TableCell>
                          <Badge className={statusClass}>{statusLabel}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer select-none whitespace-nowrap"
                      onClick={() => handleUnitSort("name")}
                    >
                      {t("name")}
                      <SortIcon
                        active={unitSortKey === "name"}
                        dir={unitSortDir}
                      />
                    </TableHead>
                    <TableHead>{t("template")}</TableHead>
                    <TableHead>{t("imei")}</TableHead>
                    <TableHead
                      className="cursor-pointer select-none whitespace-nowrap"
                      onClick={() => handleUnitSort("price")}
                    >
                      {t("price")}
                      <SortIcon
                        active={unitSortKey === "price"}
                        dir={unitSortDir}
                      />
                    </TableHead>
                    <TableHead>{t("brand")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedUnitProducts.map((product) => {
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
                        <TableCell>
                          {resolveBrandName(
                            product,
                            templateById,
                            subcategoryNameById,
                          ) || t("unknown")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getStockBadge(Boolean(product.inStock))}
                          >
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
