"use client";

import { useRouter } from "@/i18n/routing";
import { useWishlist } from "@/contexts/wishlist-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Heart, Package, Star, Trash2 } from "lucide-react";

export default function WishlistPage() {
  const router = useRouter();
  const { items, removeFromWishlist, clearWishlist } = useWishlist();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/users")}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Wishlist</h1>
            <Badge variant="secondary">{items.length}</Badge>
          </div>
          {items.length > 0 && (
            <Button variant="outline" onClick={clearWishlist}>
              Clear Wishlist
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items.length === 0 ? (
          <Card>
            <CardContent className="py-12 flex flex-col items-center justify-center text-center">
              <Heart className="h-12 w-12 text-gray-300 mb-3" />
              <h2 className="text-lg font-semibold mb-1">No favorite products yet</h2>
              <p className="text-sm text-gray-500 mb-4">
                Add products to wishlist to see them here.
              </p>
              <Button onClick={() => router.push("/users")}>Browse products</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((product) => (
              <Card
                key={product.id}
                className="group h-full cursor-pointer gap-0 py-0 hover:shadow-lg"
                onClick={() => router.push(`/users/product/${product.id}`)}
              >
                <CardContent className="p-0 h-full flex flex-col">
                  <div className="relative aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover object-center scale-110 -translate-y-4 group-hover:scale-[1.14] transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-16 w-16 text-gray-300" />
                      </div>
                    )}
                    <Button
                      size="icon-sm"
                      variant="secondary"
                      className="absolute top-2 right-2"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeFromWishlist(product.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="min-h-10 font-medium text-sm line-clamp-2">{product.name}</h3>
                    <p className="min-h-4 text-xs text-gray-500">
                      {[product.storage, product.color].filter(Boolean).join(" • ") || (
                        <span className="invisible">-</span>
                      )}
                    </p>
                    <div className="mt-auto pt-2">
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            className={`h-3 w-3 ${
                              index < Math.floor(product.rating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-gray-500">({product.reviewCount})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{formatPrice(product.price)}</span>
                        {product.originalPrice ? (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
