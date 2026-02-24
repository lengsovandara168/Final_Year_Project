"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ShoppingCart,
  Star,
  Package,
  Minus,
  Plus,
  Check,
  X,
  Truck,
  Shield,
  RotateCcw,
  Heart,
  Share2,
  Smartphone,
} from "lucide-react";

// Type definitions for products
interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image?: string;
  category: "phone" | "tablet" | "accessories" | "offer";
  subcategory: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isPopular?: boolean;
  isBestSeller?: boolean;
  description?: string;
  specifications?: { label: string; value: string }[];
}

// Mock products data - this should come from database/API
const allProducts: Product[] = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    price: 1199,
    originalPrice: 1299,
    image: "https://media.bakuelectronics.az/media/inventImages/Apple_iPhone_17_Pro_Max_SILVER_2_ELjaqL6.webp",
    category: "phone",
    subcategory: "Apple",
    rating: 4.8,
    reviewCount: 256,
    inStock: true,
    isPopular: true,
    isBestSeller: false,
    description: "The iPhone 15 Pro Max features a stunning 6.7-inch Super Retina XDR display with ProMotion technology. Powered by the A17 Pro chip, it delivers exceptional performance for gaming, photography, and everyday tasks. The titanium design makes it lighter and more durable than ever.",
    specifications: [
      { label: "Display", value: "6.7-inch Super Retina XDR" },
      { label: "Chip", value: "A17 Pro" },
      { label: "Camera", value: "48MP Main + 12MP Ultra Wide + 12MP Telephoto" },
      { label: "Storage", value: "256GB / 512GB / 1TB" },
      { label: "Battery", value: "Up to 29 hours video playback" },
      { label: "Water Resistance", value: "IP68" },
    ],
  },
  {
    id: 2,
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    price: 1299,
    originalPrice: 1399,
    image: "https://images.samsung.com/is/image/samsung/p6pim/levant/2401/gallery/levant-galaxy-s24-ultra-s928-sm-s928bztqmea-thumb-539573439",
    category: "phone",
    subcategory: "Samsung",
    rating: 4.7,
    reviewCount: 189,
    inStock: true,
    isPopular: true,
    description: "The Galaxy S24 Ultra features a built-in S Pen and Galaxy AI capabilities. With a 200MP camera and advanced AI photo editing, capture and enhance every moment. The titanium frame provides durability while maintaining a premium feel.",
    specifications: [
      { label: "Display", value: "6.8-inch Dynamic AMOLED 2X" },
      { label: "Processor", value: "Snapdragon 8 Gen 3" },
      { label: "Camera", value: "200MP Main + 12MP Ultra Wide + 50MP Telephoto" },
      { label: "Storage", value: "256GB / 512GB / 1TB" },
      { label: "Battery", value: "5000mAh" },
      { label: "S Pen", value: "Built-in" },
    ],
  },
];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    // Find product by ID - in real app, this would be an API call
    const productId = Number(params.id);
    const foundProduct = allProducts.find((p) => p.id === productId);
    setProduct(foundProduct || null);
  }, [params.id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const handleAddToCart = () => {
    if (product) {
      // Add to cart logic here
      console.log(`Added ${quantity} x ${product.name} to cart`);
      // You can integrate with your cart state management here
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-4">The product you're looking for doesn't exist.</p>
          <Button onClick={() => router.back()} variant="outline">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back Button & Logo */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-black">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold hidden sm:block">Final Shop</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsWishlisted(!isWishlisted)}
              >
                <Heart
                  className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`}
                />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
              <Button variant="outline" className="relative">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain p-8"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-32 w-32 text-gray-300" />
                </div>
              )}
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isPopular && (
                  <Badge className="bg-orange-500 text-white">Popular</Badge>
                )}
                {product.isBestSeller && (
                  <Badge className="bg-yellow-500 text-black">Best Seller</Badge>
                )}
                {product.originalPrice && (
                  <Badge className="bg-red-500 text-white">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                  </Badge>
                )}
              </div>
            </div>

            {/* Thumbnail Images (placeholder for multiple images) */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[0, 1, 2, 3].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden bg-white ${
                    selectedImage === idx ? "border-black" : "border-gray-200"
                  }`}
                >
                  {product.image && idx === 0 ? (
                    <img
                      src={product.image}
                      alt={`${product.name} view ${idx + 1}`}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <Package className="h-6 w-6 text-gray-300" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Brand & Name */}
            <div>
              <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <Badge className="bg-red-100 text-red-600">
                    Save {formatPrice(product.originalPrice - product.price)}
                  </Badge>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.inStock ? (
                <>
                  <div className="flex items-center gap-1 text-green-600">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">In Stock</span>
                  </div>
                  <span className="text-gray-500">- Ready to ship</span>
                </>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <X className="h-5 w-5" />
                  <span className="font-medium">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Quantity Selector */}
            {product.inStock && (
              <div>
                <h2 className="font-semibold text-gray-900 mb-3">Quantity</h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="rounded-r-none"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                      className="rounded-l-none"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-gray-500">
                    Total: <span className="font-bold text-black">{formatPrice(product.price * quantity)}</span>
                  </span>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-black text-white hover:bg-gray-800 h-12 text-lg"
                disabled={!product.inStock}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </Button>
              <Button
                variant="outline"
                className="h-12 px-6"
                onClick={() => setIsWishlisted(!isWishlisted)}
              >
                <Heart
                  className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`}
                />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Truck className="h-6 w-6 text-gray-600" />
                </div>
                <p className="text-sm font-medium">Free Shipping</p>
                <p className="text-xs text-gray-500">On orders $100+</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="h-6 w-6 text-gray-600" />
                </div>
                <p className="text-sm font-medium">1 Year Warranty</p>
                <p className="text-xs text-gray-500">Full coverage</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <RotateCcw className="h-6 w-6 text-gray-600" />
                </div>
                <p className="text-sm font-medium">30 Days Return</p>
                <p className="text-xs text-gray-500">Easy returns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications Section */}
        {product.specifications && product.specifications.length > 0 && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.specifications.map((spec, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between py-3 border-b last:border-0"
                  >
                    <span className="text-gray-600">{spec.label}</span>
                    <span className="font-medium text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Related Products Section */}
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {allProducts
              .filter((p) => p.id !== product.id)
              .slice(0, 4)
              .map((relatedProduct) => (
                <Card
                  key={relatedProduct.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/users/product/${relatedProduct.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                      {relatedProduct.image ? (
                        <img
                          src={relatedProduct.image}
                          alt={relatedProduct.name}
                          className="w-full h-full object-contain p-4"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-12 w-12 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-gray-500">{relatedProduct.brand}</p>
                      <h3 className="text-sm font-medium line-clamp-1">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-sm font-bold mt-1">
                        {formatPrice(relatedProduct.price)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </section>
      </main>

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-50">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-500">Total Price</p>
            <p className="text-xl font-bold">{formatPrice(product.price * quantity)}</p>
          </div>
          <Button
            className="flex-1 bg-black text-white hover:bg-gray-800 h-12"
            disabled={!product.inStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
