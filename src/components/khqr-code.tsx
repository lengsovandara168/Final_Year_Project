"use client";

import QRCode from "react-qr-code";

type KhqrCodeProps = {
  value: string;
  size?: number;
  className?: string;
  receiverName?: string;
  amountLabel?: string;
};

export function KhqrCode({
  value,
  size = 280,
  className,
  receiverName = process.env.MERCHANT_NAME || "Astrix",
  amountLabel = "Scan to pay",
}: KhqrCodeProps) {
  const qrSize = Math.max(size - 120, 180);

  return (
    <div
      className={[
        "overflow-hidden rounded-[28px] border border-slate-200 bg-[#fcfcfd] shadow-[0_24px_50px_-28px_rgba(15,23,42,0.16)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ width: "100%", maxWidth: size }}
    >
      <div className="bg-[#ee1c25] px-6 py-5 text-center text-white">
        <p className="text-[14px] font-semibold tracking-[0.3em]">KHQR</p>
      </div>

      <div className="relative bg-white px-7 pb-6 pt-8">
        <div className="absolute right-0 top-0 h-16 w-16 bg-[#ee1c25] [clip-path:polygon(100%_0,0_0,100%_100%)]" />

        <div className="relative z-10">
          <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-slate-800">
            {process.env.MERCHANT_NAME || "Astrix"}
          </p>
          <p className="mt-2 text-[34px] font-semibold leading-none text-black">
            {amountLabel}
          </p>
        </div>
      </div>

      <div className="border-t border-dashed border-slate-200" />

      <div className="bg-white px-7 pb-8 pt-7">
        <div className="relative mx-auto w-full max-w-[240px]">
          <div className="rounded-[18px] bg-white p-1.5">
            <QRCode
              value={value}
              size={qrSize}
              bgColor="#FFFFFF"
              fgColor="#111111"
              className="h-auto w-full"
            />
          </div>

          <div className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[5px] border-white bg-[#ee1c25] text-[10px] font-bold tracking-[0.12em] text-white shadow-md">
            KH
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400">
            Bakong Compatible
          </p>
        </div>
      </div>
    </div>
  );
}
