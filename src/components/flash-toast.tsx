"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

function readCookie(name: string) {
  const prefix = `${name}=`;
  const cookie = document.cookie
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(prefix));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.slice(prefix.length));
}

function clearCookie(name: string) {
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function FlashToast() {
  const pathname = usePathname();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const flash = readCookie("flash_toast");
    if (!flash) {
      return;
    }

    setMessage(flash);
    clearCookie("flash_toast");

    const timeout = window.setTimeout(() => {
      setMessage(null);
    }, 3500);

    return () => window.clearTimeout(timeout);
  }, [pathname]);

  if (!message) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-100 max-w-sm rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-lg">
      {message}
    </div>
  );
}
