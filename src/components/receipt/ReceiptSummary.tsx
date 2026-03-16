import { type OrderSummaryV2 } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ReceiptSummaryProps = {
  orderSummary: OrderSummaryV2;
  formatPrice: (price: number) => string;
  itemsTitle?: string;
};

export function ReceiptSummary({
  orderSummary,
  formatPrice,
  itemsTitle = "Items",
}: ReceiptSummaryProps) {
  const createdAtDate = new Date(orderSummary.createdAt);
  const createdAtFormatted = createdAtDate.toLocaleDateString("en-GB");
  const createdAtTime = createdAtDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <section className="space-y-1 text-sm text-gray-700">
        <p>
          <span className="font-medium">Order Number:</span> {orderSummary.orderNumber}
        </p>
        <p>
          <span className="font-medium">Order Date:</span> {createdAtFormatted}
        </p>
        <p>
          <span className="font-medium">Order Time:</span> {createdAtTime}
        </p>
      </section>

      <section className="space-y-1 text-sm text-gray-700">
        <h2 className="mb-1 text-base font-semibold">Customer Information</h2>
        <p>
          <span className="font-medium">Name:</span> {orderSummary.shippingAddress.fullName}
        </p>
        <p>
          <span className="font-medium">Phone:</span> {orderSummary.shippingAddress.phone}
        </p>
        <p>
          <span className="font-medium">Shipping Address:</span> {orderSummary.shippingAddress.address},{" "}
          {orderSummary.shippingAddress.city} {orderSummary.shippingAddress.zipCode}
        </p>
      </section>

      <section className="space-y-1 text-sm text-gray-700">
        <h2 className="mb-1 text-base font-semibold">Financial Summary</h2>
        <p>
          <span className="font-medium">Subtotal:</span> {formatPrice(orderSummary.subtotal)}
        </p>
        <p>
          <span className="font-medium">Shipping:</span> {formatPrice(orderSummary.shipping)}
        </p>
        {orderSummary.tradeInTotal > 0 && (
          <p>
            <span className="font-medium">Trade-in Credit:</span> -
            {formatPrice(orderSummary.tradeInTotal)}
          </p>
        )}
        <p>
          <span className="font-medium">Grand Total:</span> {formatPrice(orderSummary.grandTotal)}
        </p>
        <p>
          <span className="font-medium">Amount Paid:</span> {formatPrice(orderSummary.amountPaid)}
        </p>
        <p>
          <span className="font-medium">Change Due:</span> {formatPrice(orderSummary.changeDue)}
        </p>
      </section>

      {orderSummary.tradeIns.length > 0 && (
        <section className="space-y-1 text-sm text-gray-700">
          <h2 className="mb-1 text-base font-semibold">Trade-in</h2>
          {orderSummary.tradeIns.map((tradeIn) => (
            <p key={tradeIn.id}>
              <span className="font-medium">{tradeIn.model}</span>
              {tradeIn.imei ? ` (IMEI: ${tradeIn.imei})` : ""} &mdash;{" "}
              <span className="text-green-700">-{formatPrice(tradeIn.offeredAmount)}</span>
            </p>
          ))}
        </section>
      )}

      <section className="space-y-1 text-sm text-gray-700">
        <h2 className="mb-1 text-base font-semibold">Payments</h2>
        {orderSummary.payments.map((line) => (
          <p key={line.id}>
            <span className="font-medium uppercase">{line.method}</span>: {formatPrice(line.amount)}
            {line.reference ? ` (${line.reference})` : ""}
          </p>
        ))}
      </section>

      <section className="text-sm text-gray-700">
        <h2 className="mb-2 text-base font-semibold">{itemsTitle}</h2>
        <div className="overflow-hidden rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Price / Unit</TableHead>
                <TableHead className="text-right">Total Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderSummary.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="max-w-55">
                    <div>
                      <span className="line-clamp-2 font-medium">{item.name}</span>
                      {item.imei && <p className="mt-1 text-xs text-gray-500">IMEI: {item.imei}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatPrice(item.price)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-3 flex justify-end text-sm font-semibold">
          <span className="mr-2">Order Total:</span>
          <span>{formatPrice(orderSummary.grandTotal)}</span>
        </div>
      </section>
    </>
  );
}
