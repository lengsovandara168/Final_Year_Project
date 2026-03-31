type OrderDisplayInput = {
  orderNumber?: string | null;
  receiptNumber?: string | null;
};

export function formatOrderDisplayId(value?: string | null) {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed;
}

export function getOrderDisplayId(order: OrderDisplayInput) {
  return (
    formatOrderDisplayId(order.orderNumber) ||
    formatOrderDisplayId(order.receiptNumber)
  );
}
