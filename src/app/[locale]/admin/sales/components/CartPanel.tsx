import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CartItemList, CartItem } from "./CartItemList";
import { ShoppingCart, LoaderCircle, QrCode, Banknote } from "lucide-react";
interface CartPanelProps {
  cartItems: CartItem[];
  cartSubtotal: number;
  isProcessingCheckout: boolean;
  onUpdateQuantity: (id: string, q: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  checkoutLabel: string;
  onCashCheckout: () => void;
}

export function CartPanel({
  cartItems,
  cartSubtotal,
  isProcessingCheckout,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  checkoutLabel,
  onCashCheckout,
}: CartPanelProps) {
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Card className="flex flex-col h-[calc(100vh-160px)] lg:max-h-[800px] shadow-md border-primary/10">
      <CardHeader className="bg-muted/30 pb-4 border-b">
        <CardTitle className="flex items-center justify-between text-xl">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Current Order
          </div>
          <span className="text-sm font-normal text-muted-foreground bg-secondary px-2 py-1 rounded-md">
            {totalItems} items
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden relative">
        <ScrollArea className="h-full w-full absolute inset-0">
          <div className="p-4">
            <CartItemList
              items={cartItems}
              onRemove={onRemoveItem}
              onQuantityChange={onUpdateQuantity}
            />
          </div>
        </ScrollArea>
      </CardContent>

      <div className="bg-muted/30 mt-auto">
        <Separator />
        <div className="bg-muted/30 mt-auto p-4 md:p-6 border-t">
          <div className="flex items-center justify-between w-full text-lg mb-6">
            <span className="font-medium text-muted-foreground">Total</span>
            <span className="text-3xl font-bold text-primary">
              ${cartSubtotal.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Button
              size="lg"
              className="h-14 text-lg gap-2 shadow-md"
              disabled={cartItems.length === 0 || isProcessingCheckout}
              onClick={onCheckout}
            >
              <QrCode className="h-5 w-5" /> Pay with Bakong
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="h-14 text-lg gap-2 border-primary/20 text-primary hover:bg-primary/5"
              disabled={cartItems.length === 0 || isProcessingCheckout}
              onClick={onCashCheckout}
            >
              <Banknote className="h-5 w-5" /> Pay with Cash
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
