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

function buildLogoUrl(logoUrl?: string) {
  if (logoUrl) return logoUrl;
  if (typeof window !== "undefined") {
    return new URL("/logo/logo.png", window.location.origin).toString();
  }
  return "/logo/logo.png";
}

export function generateReceiptPrintHtml(
  orderSummary: OrderSummaryV2,
  options?: {
    brandName?: string;
    title?: string;
    logoUrl?: string;
  },
) {
  const brandName = options?.brandName ?? process.env.MERCHANT_NAME ?? "Astrix";
  const title = options?.title ?? "Sales Receipt";
  const logoUrl = buildLogoUrl(options?.logoUrl);

  const createdAt = new Date(orderSummary.createdAt).toLocaleString();
  const items = Array.isArray(orderSummary.items) ? orderSummary.items : [];
  const payments = Array.isArray(orderSummary.payments) ? orderSummary.payments : [];
  const shippingAmount =
    typeof orderSummary.shipping === "number" ? orderSummary.shipping : 0;
  const subtotal =
    typeof orderSummary.subtotal === "number"
      ? orderSummary.subtotal
      : items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const grandTotal =
    typeof orderSummary.grandTotal === "number"
      ? orderSummary.grandTotal
      : subtotal + shippingAmount;
  const amountPaid =
    typeof orderSummary.amountPaid === "number"
      ? orderSummary.amountPaid
      : grandTotal;
  const changeDue =
    typeof orderSummary.changeDue === "number" ? orderSummary.changeDue : 0;
  const customerName =
    orderSummary.shippingAddress?.fullName?.trim() || "Walk-in Customer";
  const customerPhone = orderSummary.shippingAddress?.phone?.trim() || null;
  const customerAddress = [
    orderSummary.shippingAddress?.address?.trim(),
    orderSummary.shippingAddress?.city?.trim(),
    orderSummary.shippingAddress?.zipCode?.trim(),
  ]
    .filter(Boolean)
    .join(", ");

  const rows = orderSummary.items
    .map((item) => {
      const imei = item.imei
        ? `<div class="item-meta">IMEI: ${escapeHtml(item.imei)}</div>`
        : "";
      const image = item.image
        ? `
            <div class="item-thumb-wrap">
              <img class="item-thumb" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" />
            </div>
          `
        : "";
      return `
        <tr>
          <td class="item-cell">
            <div class="item-layout">
              ${image}
              <div class="item-copy">
                <div class="item-name">${escapeHtml(item.name)}</div>
                ${imei}
              </div>
            </div>
          </td>
          <td class="number-cell">${item.quantity}</td>
          <td class="number-cell">${formatPrice(item.price)}</td>
          <td class="number-cell total-cell">${formatPrice(item.price * item.quantity)}</td>
        </tr>
      `;
    })
    .join("");
  const paymentRows =
    payments.length > 0
      ? payments
          .map((payment) => {
            const reference = payment.reference
              ? ` <span class="detail-inline">(${escapeHtml(payment.reference)})</span>`
              : "";
            return `
              <div class="detail-row">
                <span>${escapeHtml(payment.method.toUpperCase())}${reference}</span>
                <strong>${formatPrice(payment.amount)}</strong>
              </div>
            `;
          })
          .join("")
      : `
        <div class="detail-row">
          <span>Payment</span>
          <strong>${formatPrice(amountPaid)}</strong>
        </div>
      `;
  const customerMeta = [
    `<div class="meta-pill"><span>Customer</span><strong>${escapeHtml(customerName)}</strong></div>`,
    customerPhone
      ? `<div class="meta-pill"><span>Phone</span><strong>${escapeHtml(customerPhone)}</strong></div>`
      : "",
    `<div class="meta-pill"><span>Order</span><strong>${escapeHtml(orderSummary.orderNumber)}</strong></div>`,
    `<div class="meta-pill"><span>Date</span><strong>${escapeHtml(createdAt)}</strong></div>`,
  ]
    .filter(Boolean)
    .join("");
  const customerAddressBlock = customerAddress
    ? `<div class="customer-note">${escapeHtml(customerAddress)}</div>`
    : "";

  return `
  <html>
    <head>
      <title>${escapeHtml(title)} ${escapeHtml(orderSummary.orderNumber)}</title>
      <style>
        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: "Inter", "Segoe UI", Arial, sans-serif;
          background: #f5f7fb;
          color: #111827;
          padding: 32px 18px;
        }
        .sheet {
          max-width: 820px;
          margin: 0 auto;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
        }
        .hero {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          align-items: center;
          padding: 28px 32px 22px;
          background:
            radial-gradient(circle at top right, rgba(239, 68, 68, 0.10), transparent 28%),
            linear-gradient(135deg, #0f172a 0%, #111827 52%, #1f2937 100%);
          color: #f8fafc;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .brand-mark {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 72px;
          height: 72px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.92);
          padding: 10px;
        }
        .brand-mark img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .brand-text h1 {
          margin: 0;
          font-size: 28px;
          line-height: 1.05;
          letter-spacing: -0.03em;
        }
        .brand-text p {
          margin: 6px 0 0;
          font-size: 13px;
          color: rgba(248, 250, 252, 0.78);
        }
        .receipt-tag {
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 999px;
          padding: 10px 16px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          background: rgba(255, 255, 255, 0.08);
          white-space: nowrap;
        }
        .content {
          padding: 28px 32px 32px;
        }
        .meta-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 22px;
        }
        .meta-pill {
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 14px 16px;
          background: #f8fafc;
        }
        .meta-pill span {
          display: block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 6px;
        }
        .meta-pill strong {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
        }
        .customer-note {
          margin-top: -6px;
          margin-bottom: 22px;
          color: #64748b;
          font-size: 13px;
        }
        .section-title {
          margin: 0 0 12px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #64748b;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          overflow: hidden;
        }
        thead th {
          background: #f8fafc;
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        th, td {
          text-align: left;
          padding: 14px 16px;
          border-bottom: 1px solid #e5e7eb;
          vertical-align: top;
        }
        tbody tr:last-child td {
          border-bottom: none;
        }
        .number-cell {
          text-align: right;
          white-space: nowrap;
        }
        .item-name {
          font-weight: 600;
          color: #0f172a;
        }
        .item-layout {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .item-copy {
          min-width: 0;
        }
        .item-thumb-wrap {
          width: 48px;
          height: 48px;
          flex: 0 0 48px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          background: #f8fafc;
        }
        .item-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .item-meta {
          margin-top: 4px;
          color: #64748b;
          font-size: 12px;
        }
        .totals {
          margin-top: 22px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 280px;
          gap: 20px;
        }
        .totals-card,
        .payments-card {
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          padding: 18px 18px 16px;
          background: #ffffff;
        }
        .totals-card {
          background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
        }
        .detail-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 12px;
          padding: 8px 0;
          font-size: 14px;
          border-bottom: 1px solid #eef2f7;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-inline {
          color: #64748b;
          font-size: 12px;
        }
        .grand-total {
          margin-top: 12px;
          padding-top: 14px;
          border-top: 1px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
        }
        .footer {
          margin-top: 22px;
          padding-top: 18px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          gap: 16px;
          color: #64748b;
          font-size: 12px;
        }
        @media print {
          body {
            padding: 0;
            background: #ffffff;
          }
          .sheet {
            max-width: none;
            border: none;
            border-radius: 0;
            box-shadow: none;
          }
        }
      </style>
    </head>
    <body>
      <main class="sheet">
        <section class="hero">
          <div class="brand">
            <div class="brand-mark">
              <img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(brandName)} logo" />
            </div>
            <div class="brand-text">
              <h1>${escapeHtml(brandName)}</h1>
              <p>Official point-of-sale receipt</p>
            </div>
          </div>
          <div class="receipt-tag">${escapeHtml(title)}</div>
        </section>

        <section class="content">
          <div class="meta-grid">${customerMeta}</div>
          ${customerAddressBlock}

          <h2 class="section-title">Purchased Items</h2>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th class="number-cell">Qty</th>
                <th class="number-cell">Unit</th>
                <th class="number-cell">Amount</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          <div class="totals">
            <div class="payments-card">
              <h2 class="section-title">Payment</h2>
              ${paymentRows}
            </div>
            <div class="totals-card">
              <h2 class="section-title">Summary</h2>
              <div class="detail-row">
                <span>Subtotal</span>
                <strong>${formatPrice(subtotal)}</strong>
              </div>
              <div class="detail-row">
                <span>Shipping</span>
                <strong>${formatPrice(shippingAmount)}</strong>
              </div>
              <div class="detail-row">
                <span>Amount Paid</span>
                <strong>${formatPrice(amountPaid)}</strong>
              </div>
              <div class="detail-row">
                <span>Change Due</span>
                <strong>${formatPrice(changeDue)}</strong>
              </div>
              <div class="grand-total">
                <span>Grand Total</span>
                <span>${formatPrice(grandTotal)}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <span>Order ${escapeHtml(orderSummary.orderNumber)}</span>
            <span>Thank you for shopping with ${escapeHtml(brandName)}</span>
          </div>
        </section>
      </main>
    </body>
  </html>
`;
}

export function openReceiptPrintWindow() {
  const printWindow = window.open("", "_blank", "width=760,height=900");
  if (!printWindow) return;

  printWindow.document.open();
  printWindow.document.write(`
    <html>
      <head>
        <title>Preparing receipt...</title>
        <style>
          body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 24px;
            font-family: "Inter", "Segoe UI", Arial, sans-serif;
            background: #f5f7fb;
            color: #111827;
          }
          .card {
            max-width: 420px;
            padding: 24px;
            border: 1px solid #e5e7eb;
            border-radius: 20px;
            background: #ffffff;
            box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
            text-align: center;
          }
          h1 {
            margin: 0 0 12px;
            font-size: 20px;
          }
          p {
            margin: 0;
            line-height: 1.6;
            color: #4b5563;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Receipt is being prepared</h1>
          <p>Leave this tab open. The printable receipt will appear once payment is confirmed.</p>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  return printWindow;
}

export function printReceiptHtml(html: string, targetWindow?: Window | null) {
  const printWindow =
    targetWindow && !targetWindow.closed
      ? targetWindow
      : window.open("", "_blank", "width=760,height=900");
  if (!printWindow) return;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}
