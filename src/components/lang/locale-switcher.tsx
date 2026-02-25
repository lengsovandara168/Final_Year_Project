"use client";

import { usePathname } from "next/navigation";

import { enFlag, kmFlag } from "./lang-logo";
import LocaleSwitcherSelect from "./lang-switcher";
import { locales } from "@/i18n/routing";

export default function LocaleSwitcher() {
  const pathname = usePathname();
  const firstSegment = pathname?.split("/").filter(Boolean)[0];
  const currentLocale =
    firstSegment && (locales as readonly string[]).includes(firstSegment)
      ? firstSegment
      : "en";

  const toggleLocale = currentLocale === "km" ? "en" : "km";
  const flagIcon = currentLocale === "km" ? enFlag : kmFlag;

  return (
    <LocaleSwitcherSelect toggleLocale={toggleLocale}>
      {flagIcon}
    </LocaleSwitcherSelect>
  );
}
