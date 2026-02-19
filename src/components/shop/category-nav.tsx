"use client";

import Link from "next/link";
import { categories } from "@/lib/shop-data";
import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, Tablet, Headphones, Watch, ShieldCheck } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  smartphone: <Smartphone className="h-8 w-8" />,
  tablet: <Tablet className="h-8 w-8" />,
  headphones: <Headphones className="h-8 w-8" />,
  watch: <Watch className="h-8 w-8" />,
  shield: <ShieldCheck className="h-8 w-8" />,
};

export function CategoryNav() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
      {categories.map((category) => (
        <Link key={category.id} href={`/products?category=${category.slug}`}>
          <Card className="group hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-600 group-hover:bg-black group-hover:text-white transition-colors">
                {iconMap[category.icon] || <Smartphone className="h-8 w-8" />}
              </div>
              <h3 className="font-semibold text-sm">{category.name}</h3>
              <p className="text-xs text-gray-500">{category.productCount} items</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export function CategorySidebar({ activeSlug }: { activeSlug?: string }) {
  return (
    <nav className="space-y-1">
      <Link
        href="/products"
        className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
          !activeSlug
            ? "bg-black text-white"
            : "hover:bg-gray-100"
        }`}
      >
        All Products
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/products?category=${category.slug}`}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
            activeSlug === category.slug
              ? "bg-black text-white"
              : "hover:bg-gray-100"
          }`}
        >
          <span className="flex h-6 w-6 items-center justify-center">
            {iconMap[category.icon]}
          </span>
          <span>{category.name}</span>
          <span className="ml-auto text-xs text-gray-400">{category.productCount}</span>
        </Link>
      ))}
    </nav>
  );
}
