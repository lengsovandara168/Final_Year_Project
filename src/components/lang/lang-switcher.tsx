"use client";

import { type ReactNode, useTransition } from "react";

import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/i18n/routing";
import { locales } from "@/i18n/routing";

type Props = {
  children: ReactNode;
  toggleLocale: string;
};

export default function LocaleSwitcherSelect({
  children,
  toggleLocale,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onToggleLocale() {
    startTransition(() => {
      const segments = pathname.split("/").filter(Boolean);
      const firstSegment = segments[0];
      const hasLocalePrefix = firstSegment
        ? (locales as readonly string[]).includes(firstSegment)
        : false;

      const normalizedPathname = hasLocalePrefix
        ? `/${segments.slice(1).join("/")}`
        : pathname;
      const queryString = searchParams.toString();
      const href = queryString
        ? `${normalizedPathname}?${queryString}`
        : normalizedPathname;

      router.replace(href, { locale: toggleLocale });
    });
  }

  return (
    <Button
      aria-label={`Switch to ${toggleLocale}`}
      type="button"
      variant={"outline"}
      size={"icon"}
      onClick={onToggleLocale}
      disabled={isPending}
    >
      {children}
    </Button>
  );
}
