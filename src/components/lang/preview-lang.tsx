"use client";

import { type ReactNode, useTransition } from "react";

import { useParams, useSearchParams } from "next/navigation";

import { usePathname, useRouter } from "@/i18n/routing";

import { useLocale } from "next-intl";

import { enFlag, kmFlag } from "./lang-logo";

type Props = {
  children: ReactNode;
  toggleLocale: string;
};
function ButtonLocaleSwitch({ children, toggleLocale }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const query = Object.fromEntries(searchParams.entries());

  function onToggleLocale() {
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        { pathname, params, query },
        { locale: toggleLocale },
      );
      router.refresh();
    });
  }

  return (
    <button
      aria-label={`Switch to ${toggleLocale}`}
      type="button"
      className={`relative shrink-0 rounded-sm px-2 ${isPending ? "opacity-30" : ""}`}
      onClick={onToggleLocale}
      disabled={isPending}
    >
      {children}
    </button>
  );
}

export default function PreviewLangSwitch() {
  const locale = useLocale();
  const toggleLocale = locale === "km" ? "en" : "km";
  const flagIcon = locale === "km" ? enFlag : kmFlag;

  return (
    <ButtonLocaleSwitch toggleLocale={toggleLocale}>
      {flagIcon}
    </ButtonLocaleSwitch>
  );
}
