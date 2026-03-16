import type { OrderSummaryV2 } from "@/lib/api";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function generateReceiptPrintHtml(
  orderSummary: OrderSummaryV2,
  options?: {
    brandName?: string;
    title?: string;
  },
) {
  const brandName = options?.brandName ?? "LDHS";
  const title = options?.title ?? "Payment Receipt";

  const createdAt = new Date(orderSummary.createdAt).toLocaleString();
  const rows = orderSummary.items
    .map((item) => {
      const imei = item.imei
        ? `<div class=\"muted\">IMEI: ${escapeHtml(item.imei)}</div>`
        : "";
      return `
        <tr>
          <td>
            <div>${escapeHtml(item.name)}</div>
            ${imei}
          </td>
          <td>${item.quantity}</td>
          <td>${formatPrice(item.price)}</td>
          <td>${formatPrice(item.price * item.quantity)}</td>
        </tr>
      `;
    })
    .join("");

  return `
  <html>
    <head>
      <title>${escapeHtml(title)} ${escapeHtml(orderSummary.orderNumber)}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
        h1 { margin: 0 0 8px; font-size: 20px; }
        .muted { color: #666; font-size: 12px; margin-top: 2px; }
        .meta { margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { text-align: left; padding: 8px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
        th:nth-child(2), td:nth-child(2),
        th:nth-child(3), td:nth-child(3),
        th:nth-child(4), td:nth-child(4) { text-align: right; }
        .total { margin-top: 16px; text-align: right; font-size: 18px; font-weight: 700; }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(brandName)}</h1>
      <div class="meta">
        <div>${escapeHtml(title)}</div>
        <div class="muted">Order: ${escapeHtml(orderSummary.orderNumber)} • ${escapeHtml(createdAt)}</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="total">Grand Total: ${formatPrice(orderSummary.grandTotal)}</div>
    </body>
  </html>
`;
}

export function printReceiptHtml(html: string) {
  const printWindow = window.open("", "_blank", "width=760,height=900");
  if (!printWindow) return;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}
