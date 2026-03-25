import { useState, useMemo } from "react";
import { LoaderCircle, PackageOpen, ChevronLeft, Hash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface QuickSelectGridProps {
  products: any[];
  loading: boolean;
  onAddProduct: (product: any) => void;
}

export function QuickSelectGrid({
  products,
  loading,
  onAddProduct,
}: QuickSelectGridProps) {
  const [selectedModelName, setSelectedModelName] = useState<string | null>(
    null,
  );

  // --- Grouping Logic: Groups individual units by their product name ---
  const groupedProducts = useMemo(() => {
    const groups: Record<string, any[]> = {};
    products.forEach((p) => {
      if (!p.inStock) return;
      if (!groups[p.name]) groups[p.name] = [];
      groups[p.name].push(p);
    });
    return groups;
  }, [products]);

  const modelNames = Object.keys(groupedProducts);

  if (loading)
    return (
      <div className="p-12 text-center">
        <LoaderCircle className="animate-spin mx-auto h-8 w-8 text-primary" />
      </div>
    );

  // --- VIEW 2: Select specific IMEI unit for the chosen model ---
  if (selectedModelName) {
    const units = groupedProducts[selectedModelName] || [];
    return (
      <Card className="flex h-full min-h-[420px] flex-col overflow-hidden border-primary/10 lg:min-h-[calc(100vh-320px)]">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSelectedModelName(null)}
            >
              <ChevronLeft />
            </Button>
            <CardTitle className="text-lg">
              Select IMEI: {selectedModelName}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="relative flex-1 p-0">
          <ScrollArea className="absolute inset-0 h-full w-full">
            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {units.map((unit) => (
                <Button
                  key={unit.id}
                  variant="outline"
                  className="flex h-full min-h-[132px] flex-col items-start p-4 text-left transition-all hover:border-primary hover:bg-primary/5"
                  onClick={() => {
                    onAddProduct(unit);
                    setSelectedModelName(null);
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1.5 text-muted-foreground uppercase text-[10px] font-bold tracking-tight">
                    <Hash className="h-3 w-3" /> IMEI Number
                  </div>
                  <span className="font-mono text-sm font-semibold mb-2">
                    {unit.imei || "Serial Item"}
                  </span>
                  <div className="w-full pt-2 border-t border-dashed flex justify-between items-center mt-auto">
                    <span className="text-xs text-muted-foreground">Price</span>
                    <span className="font-bold text-primary">
                      ${unit.price.toFixed(2)}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  // --- VIEW 1: Main Product Selection ---
  return (
    <Card className="flex h-full min-h-[420px] flex-col overflow-hidden border-primary/10 lg:min-h-[calc(100vh-320px)]">
      <CardHeader className="border-b bg-muted/20">
        <CardTitle className="flex items-center gap-2 text-lg">
          <PackageOpen className="h-5 w-5" /> Quick Select
        </CardTitle>
      </CardHeader>
      <CardContent className="relative flex-1 p-0">
        <ScrollArea className="absolute inset-0 h-full w-full">
          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {modelNames.length === 0 ? (
              <div className="col-span-full py-20 text-center text-muted-foreground">
                No products in stock.
              </div>
            ) : (
              modelNames.map((name) => {
                const group = groupedProducts[name];
                const firstItem = group[0];
                const image =
                  firstItem.image || (firstItem.images && firstItem.images[0]);

                return (
                  <Button
                    key={name}
                    variant="outline"
                    className="group flex min-h-[180px] flex-col items-center p-2 text-center transition-all hover:border-primary hover:bg-primary/5"
                    onClick={() => setSelectedModelName(name)}
                  >
                    <div className="w-full aspect-square bg-muted rounded-md overflow-hidden relative mb-2">
                      {image ? (
                        <img
                          src={image}
                          alt={name}
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform"
                        />
                      ) : (
                        <span className="text-muted-foreground text-xs font-bold uppercase">
                          {name.slice(0, 2)}
                        </span>
                      )}
                      {/* ✅ Correct Stock Count Badge */}
                      <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                        {group.length}
                      </div>
                    </div>
                    <span className="text-xs font-semibold line-clamp-1 h-4 w-full">
                      {name}
                    </span>
                    <span className="text-sm font-bold text-primary mt-1">
                      ${firstItem.price.toFixed(2)}
                    </span>
                  </Button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
