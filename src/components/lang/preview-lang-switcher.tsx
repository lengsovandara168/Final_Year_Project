import { useTransition } from "react";

import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/routing";

import { Globe } from "lucide-react";
import { useLocale } from "next-intl";

export default function PreviewLangSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const toggleLocale = locale === "km" ? "en" : "km";

  function onToggleLocale() {
    const query = searchParams.toString();
    const pathWithQuery = query ? `${pathname}?${query}` : pathname;

    startTransition(() => {
      router.replace(pathWithQuery, { locale: toggleLocale });
    });
  }
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="hover:bg-none">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-base hover:bg-transparent"
            onClick={onToggleLocale}
            disabled={isPending}
          >
            {locale === "en" ? (
              <>
                <Globe />
                <span>English</span>
              </>
            ) : (
              <>
                <Globe />
                <span>ខ្មែរ</span>
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    </div>
  );
}
