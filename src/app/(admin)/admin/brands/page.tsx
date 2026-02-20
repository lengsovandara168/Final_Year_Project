"use client";

import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Edit, Trash2, ImageIcon, Upload } from "lucide-react";
import Image from "next/image";

// Initial brands data - this would come from your backend/database
const initialBrands = [
  { id: "1", name: "Apple", slug: "apple", logo: "https://img.icons8.com/?size=100&id=30840&format=png&color=000000", description: "Think Different", productCount: 5 },
  { id: "2", name: "Samsung", slug: "samsung", logo: "https://img.icons8.com/?size=100&id=wGYgIlqPWdC2&format=png&color=000000", description: "Do What You Can't", productCount: 4 },
  { id: "3", name: "Google", slug: "google", logo: "https://img.icons8.com/?size=100&id=17949&format=png&color=000000", description: "Made by Google", productCount: 1 },
  { id: "4", name: "Huawei", slug: "huawei", logo: "https://img.icons8.com/?size=100&id=FzggIjJKPC03&format=png&color=000000", description: "Make It Possible", productCount: 0 },
  { id: "5", name: "Xiaomi", slug: "xiaomi", logo: "https://img.icons8.com/?size=100&id=WovKWSCrsTFO&format=png&color=000000", description: "Innovation for Everyone", productCount: 0 },
];

type Brand = {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  productCount: number;
};

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    logo: "",
  });

  const filteredBrands = brands.filter(
    (brand) =>
      brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddBrand = () => {
    const newBrand: Brand = {
      id: String(Date.now()),
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
      logo: formData.logo || `/brands/${formData.name.toLowerCase()}.png`,
      description: formData.description,
      productCount: 0,
    };
    setBrands([...brands, newBrand]);
    setFormData({ name: "", slug: "", description: "", logo: "" });
    setIsAddDialogOpen(false);
  };

  const handleEditBrand = () => {
    if (!editingBrand) return;
    setBrands(
      brands.map((b) =>
        b.id === editingBrand.id
          ? {
              ...b,
              name: formData.name,
              slug: formData.slug,
              description: formData.description,
              logo: formData.logo,
            }
          : b
      )
    );
    setEditingBrand(null);
    setFormData({ name: "", slug: "", description: "", logo: "" });
  };

  const handleDeleteBrand = (id: string) => {
    if (confirm("Are you sure you want to delete this brand?")) {
      setBrands(brands.filter((b) => b.id !== id));
    }
  };

  const openEditDialog = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      slug: brand.slug,
      description: brand.description,
      logo: brand.logo,
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Brands / Subcategories</h1>
          <p className="text-sm text-muted-foreground">
            Manage product brands and their logos
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Brand
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Brand</DialogTitle>
              <DialogDescription>
                Add a new brand/subcategory. Upload the logo to /public/brands/ folder.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Brand Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Apple"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL-friendly name)</Label>
                <Input
                  id="slug"
                  placeholder="e.g., apple"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description / Tagline</Label>
                <Input
                  id="description"
                  placeholder="e.g., Think Different"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">Logo Path</Label>
                <Input
                  id="logo"
                  placeholder="/brands/apple.png"
                  value={formData.logo}
                  onChange={(e) =>
                    setFormData({ ...formData, logo: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Upload your logo to: <code className="bg-muted px-1 rounded">public/brands/</code>
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddBrand} disabled={!formData.name}>
                Add Brand
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Logo Upload Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Upload className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">How to add brand logos</h3>
              <p className="text-sm text-blue-700 mt-1">
                1. Prepare your logo image (PNG recommended, 64x64 or larger)
                <br />
                2. Name it using the brand slug (e.g., <code className="bg-blue-100 px-1 rounded">apple.png</code>)
                <br />
                3. Upload to: <code className="bg-blue-100 px-1 rounded">public/brands/</code> folder
                <br />
                4. The logo path will be: <code className="bg-blue-100 px-1 rounded">/brands/apple.png</code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="py-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search brands..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Brands Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Brands ({filteredBrands.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Logo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Products</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBrands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>
                    <div className="relative h-10 w-10 rounded-md border bg-gray-50 overflow-hidden flex items-center justify-center">
                      <Image
                        src={brand.logo}
                        alt={`${brand.name} logo`}
                        width={40}
                        height={40}
                        className="object-contain p-1"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-400">
                        {brand.name.charAt(0)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1 rounded">
                      {brand.slug}
                    </code>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {brand.description}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={brand.productCount > 0 ? "default" : "secondary"}>
                      {brand.productCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog
                        open={editingBrand?.id === brand.id}
                        onOpenChange={(open) => !open && setEditingBrand(null)}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(brand)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Brand</DialogTitle>
                            <DialogDescription>
                              Update brand information
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-name">Brand Name</Label>
                              <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) =>
                                  setFormData({ ...formData, name: e.target.value })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-slug">Slug</Label>
                              <Input
                                id="edit-slug"
                                value={formData.slug}
                                onChange={(e) =>
                                  setFormData({ ...formData, slug: e.target.value })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-description">Description</Label>
                              <Input
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    description: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-logo">Logo Path</Label>
                              <Input
                                id="edit-logo"
                                value={formData.logo}
                                onChange={(e) =>
                                  setFormData({ ...formData, logo: e.target.value })
                                }
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setEditingBrand(null)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleEditBrand}>Save Changes</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteBrand(brand.id)}
                        disabled={brand.productCount > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
