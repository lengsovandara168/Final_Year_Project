"use client";

import { type ReactNode, useTransition } from "react";

import { useParams, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/i18n/routing";

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
  const params = useParams();
  const searchParams = useSearchParams();
  const query = Object.fromEntries(searchParams.entries());

  function onToggleLocale() {
    startTransition(() => {
      // 1. Extract the current locale so it doesn't pollute the new URL
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { locale: _currentLocale, ...restParams } = params;

      router.replace(
        // 2. Use the cleaned restParams
        // @ts-expect-error -- TypeScript will validate matching segments
        { pathname, params: restParams, query },
        { locale: toggleLocale },
      );

      // router.refresh() is usually redundant here as router.replace
      // with a locale change triggers a full page update.
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
