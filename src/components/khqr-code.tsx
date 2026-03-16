"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type KhqrCodeProps = {
  value: string;
  size?: number;
  className?: string;
};

export function KhqrCode({
  value,
  size = 280,
  className,
}: KhqrCodeProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    setSrc(null);

    QRCode.toDataURL(value, {
      width: size,
      margin: 2,
      errorCorrectionLevel: "M",
      color: {
        dark: "#111827",
        light: "#ffffff",
      },
    })
      .then((dataUrl: string) => {
        if (!isActive) {
          return;
        }

        setSrc(dataUrl);
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setSrc(null);
      });

    return () => {
      isActive = false;
    };
  }, [size, value]);

  if (!src) {
    return (
      <div
        className={className}
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
    );
  }

  return (
    <img
      src={src}
      alt="Bakong KHQR"
      width={size}
      height={size}
      className={className}
    />
  );
}
