import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Search, Edit, AlertCircle } from "lucide-react";
import { getProducts } from "@/lib/api/products";
import { cookies } from "next/headers";

const getStockBadge = (inStock: boolean) => {
  return inStock ? "bg-black text-white" : "bg-red-600 text-white";
};

export default async function ProductsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value || "";

  interface Product {
    id: string;
    brand: string;
    name: string;
    price: number;
    subcategory: string;
    rating: number;
    reviewCount: number;
    inStock: boolean;
  }

  let products: Product[] = [];
  let error: string | null = null;

  if (!accessToken) {
    error = "No access token found. Please log in.";
  } else {
    try {
      const response = await getProducts(accessToken);
      products = response.data;
    } catch (err) {
      console.error("Failed to fetch products:", err);
      error =
        err && typeof err === "object" && "message" in err
          ? String(err.message)
          : "Failed to load products";
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">
            Products & Inventory
          </h1>
          <p className="text-sm text-gray-500 md:text-base">
            Manage your phone inventory
          </p>
        </div>
        <Button className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-red-900">Error loading products</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Product List ({products.length})</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input placeholder="Search products..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm">Add your first product to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Brand</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.brand}
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell className="font-medium">
                        ${product.price.toFixed(2)}
                      </TableCell>
                      <TableCell>{product.subcategory}</TableCell>
                      <TableCell>
                        <span className="text-yellow-500">★</span>{" "}
                        {product.rating.toFixed(1)} ({product.reviewCount})
                      </TableCell>
                      <TableCell>
                        <Badge className={getStockBadge(product.inStock)}>
                          {product.inStock ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
