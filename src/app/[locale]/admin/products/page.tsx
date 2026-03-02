"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Loader2,
  Trash2,
  Search,
  ChevronDown,
  Star,
  Package,
  Edit2,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { getSessionSnapshot } from "@/lib/auth-session";
import { getProducts, deleteProduct, type Product } from "@/lib/api/products";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Toast notification hook
const useToast = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<"success" | "error" | "info">("info");

  const showToast = (
    msg: string,
    toastType: "success" | "error" | "info" = "info",
  ) => {
    setMessage(msg);
    setType(toastType);
    setTimeout(() => setMessage(null), 3000);
  };

  return { message, type, showToast };
};

// Delete confirmation dialog component
function DeleteConfirmDialog({
  isOpen,
  productName,
  onConfirm,
  onCancel,
  isLoading,
}: {
  isOpen: boolean;
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Delete Product
          </CardTitle>
          <CardDescription>This action cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900">{productName}</span>?
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Toast notification component
function Toast({
  message,
  type,
}: {
  message: string | null;
  type: "success" | "error" | "info";
}) {
  if (!message) return null;

  const bgColor =
    type === "success"
      ? "bg-green-50 border-green-200"
      : type === "error"
        ? "bg-red-50 border-red-200"
        : "bg-blue-50 border-blue-200";

  const textColor =
    type === "success"
      ? "text-green-800"
      : type === "error"
        ? "text-red-800"
        : "text-blue-800";

  const iconColor =
    type === "success"
      ? "text-green-600"
      : type === "error"
        ? "text-red-600"
        : "text-blue-600";

  return (
    <div
      className={`fixed right-4 top-4 z-100 max-w-sm rounded-md border ${bgColor} px-4 py-3 text-sm ${textColor} shadow-lg flex items-start gap-3`}
    >
      <AlertCircle className={`h-5 w-5 ${iconColor} mt-0.5 shrink-0`} />
      <p>{message}</p>
    </div>
  );
}

// Star rating display component
function RatingDisplay({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < fullStars
                ? "fill-amber-400 text-amber-400"
                : i === fullStars && hasHalfStar
                  ? "fill-amber-200 text-amber-400"
                  : "text-gray-300"
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-gray-600">{rating.toFixed(1)}</span>
    </div>
  );
}

// Stock status badge
function StockBadge({ inStock }: { inStock: boolean }) {
  return (
    <Badge
      className={`${
        inStock
          ? "bg-green-100 text-green-800 hover:bg-green-100"
          : "bg-red-100 text-red-800 hover:bg-red-100"
      }`}
    >
      {inStock ? "In Stock" : "Out of Stock"}
    </Badge>
  );
}

// Empty state component
function EmptyState() {
  return (
    <div className="text-center py-12">
      <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
      <p className="text-lg font-medium text-gray-900">No products found</p>
      <p className="text-sm text-gray-500 mt-1">
        Try adjusting your search or filters to find products
      </p>
    </div>
  );
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-16 bg-gray-200 rounded-md animate-pulse" />
      ))}
    </div>
  );
}

// Main products table component
function ProductsTable({
  products,
  onDelete,
  isDeleting,
}: {
  products: Product[];
  onDelete: (id: string, name: string) => void;
  isDeleting: string | null;
}) {
  if (products.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="overflow-x-auto border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Image</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-12 w-12 object-cover rounded"
                  />
                ) : (
                  <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium text-gray-900">
                {product.brand}
              </TableCell>
              <TableCell className="text-gray-700">{product.name}</TableCell>
              <TableCell className="text-gray-600">
                {product.subcategory}
              </TableCell>
              <TableCell className="text-right font-semibold text-gray-900">
                ${product.price.toFixed(2)}
              </TableCell>
              <TableCell>
                <StockBadge inStock={product.inStock} />
              </TableCell>
              <TableCell>
                <RatingDisplay rating={product.rating} />
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem disabled className="text-gray-500">
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit (Coming Soon)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(product.id, product.name)}
                      className="text-red-600 focus:bg-red-50 focus:text-red-600"
                      disabled={isDeleting === product.id}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Main page component
export default function ProductsPage() {
  const router = useRouter();
  const { message, type, showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [selectedProductName, setSelectedProductName] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Get unique brands from products
  const uniqueBrands = Array.from(new Set(products.map((p) => p.brand))).sort();

  // Get unique categories from products
  const uniqueCategories = Array.from(
    new Set(products.map((p) => p.subcategory)),
  ).sort();

  // Filter products based on search and filters
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || product.subcategory === selectedCategory;
    const matchesBrand = !selectedBrand || product.brand === selectedBrand;

    return matchesSearch && matchesCategory && matchesBrand;
  });

  // Fetch products
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const session = getSessionSnapshot();
        if (!session.accessToken) {
          router.push("/login");
          return;
        }

        // Fetch products
        const productsResult = await getProducts(session.accessToken);
        if (productsResult.ok && productsResult.data) {
          setProducts(productsResult.data);
        } else {
          setError("Failed to load products");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Handle delete confirmation
  const handleDeleteClick = (id: string, name: string) => {
    setSelectedProductId(id);
    setSelectedProductName(name);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!selectedProductId) return;

    try {
      setIsDeleting(selectedProductId);
      const session = getSessionSnapshot();

      if (!session.accessToken) {
        showToast("Authentication required", "error");
        router.push("/login");
        return;
      }

      const result = await deleteProduct(
        session.accessToken,
        selectedProductId,
      );

      if (result.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== selectedProductId));
        showToast(`${selectedProductName} deleted successfully`, "success");
      } else {
        showToast(result.error?.message || "Failed to delete product", "error");
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "An error occurred",
        "error",
      );
    } finally {
      setIsDeleting(null);
      setDeleteDialogOpen(false);
      setSelectedProductId(null);
      setSelectedProductName("");
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <p className="text-gray-600 mt-2">
          Manage your product catalog and inventory
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-red-900">
                Error loading products
              </p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by product name or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Brand
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Brands</option>
                {uniqueBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="text-sm text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </CardContent>
      </Card>

      {/* Products Table Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Products List</CardTitle>
          <CardDescription>
            {filteredProducts.length === 0 && !loading && !error
              ? "No products match your filters"
              : `Total: ${filteredProducts.length} products`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <ProductsTable
              products={filteredProducts}
              onDelete={handleDeleteClick}
              isDeleting={isDeleting}
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        productName={selectedProductName}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedProductId(null);
          setSelectedProductName("");
        }}
        isLoading={isDeleting === selectedProductId}
      />

      {/* Toast Notification */}
      <Toast message={message} type={type} />
    </div>
  );
}
