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
import { Plus, Search, Edit } from "lucide-react";

// Dummy product data
const products = [
  {
    id: 1,
    brand: "Apple",
    model: "iPhone 15 Pro Max",
    modelNumber: "A2848",
    price: "$1,199",
    category: "Flagship",
    stock: 45,
    status: "In Stock",
  },
  {
    id: 2,
    brand: "Samsung",
    model: "Galaxy S24 Ultra",
    modelNumber: "SM-S928",
    price: "$1,299",
    category: "Flagship",
    stock: 32,
    status: "In Stock",
  },
  {
    id: 3,
    brand: "Apple",
    model: "iPhone 14",
    modelNumber: "A2649",
    price: "$799",
    category: "Mid-Range",
    stock: 0,
    status: "Out of Stock",
  },
  {
    id: 4,
    brand: "Samsung",
    model: "Galaxy A54",
    modelNumber: "SM-A546",
    price: "$449",
    category: "Mid-Range",
    stock: 67,
    status: "In Stock",
  },
  {
    id: 5,
    brand: "Apple",
    model: "iPhone 15",
    modelNumber: "A2846",
    price: "$999",
    category: "Flagship",
    stock: 28,
    status: "In Stock",
  },
  {
    id: 6,
    brand: "Samsung",
    model: "Galaxy Z Fold 5",
    modelNumber: "SM-F946",
    price: "$1,799",
    category: "Premium",
    stock: 15,
    status: "In Stock",
  },
  {
    id: 7,
    brand: "Apple",
    model: "iPhone 13 Pro",
    modelNumber: "A2483",
    price: "$899",
    category: "Mid-Range",
    stock: 8,
    status: "Low Stock",
  },
  {
    id: 8,
    brand: "Samsung",
    model: "Galaxy S23",
    modelNumber: "SM-S911",
    price: "$799",
    category: "Mid-Range",
    stock: 42,
    status: "In Stock",
  },
];

const getStockBadge = (status: string) => {
  switch (status) {
    case "In Stock":
      return "bg-black text-white";
    case "Out of Stock":
      return "bg-red-600 text-white";
    case "Low Stock":
      return "bg-orange-500 text-white";
    default:
      return "bg-gray-200";
  }
};

export default function ProductsPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Products & Inventory</h1>
          <p className="text-sm text-gray-500 md:text-base">Manage your phone inventory</p>
        </div>
        <Button className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Product List</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input placeholder="Search products..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Model Number</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.brand}</TableCell>
                  <TableCell>{product.model}</TableCell>
                  <TableCell className="text-gray-500">{product.modelNumber}</TableCell>
                  <TableCell className="font-medium">{product.price}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Badge className={getStockBadge(product.status)}>
                      {product.status}
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
          </Table>          </div>        </CardContent>
      </Card>
    </div>
  );
}
