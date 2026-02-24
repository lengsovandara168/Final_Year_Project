import { Kantumruy_Pro, Work_Sans } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import LocaleSwitcher from "@/components/lang/locale-switcher";

const latin = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
});

const khmer = Kantumruy_Pro({
  subsets: ["khmer"],
  variable: "--font-kantumruy-pro",
});

export default async function Localelayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const messages = await getMessages();
  const { children } = props;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`
          ${latin.variable} 
          ${khmer.variable} 
          ${locale === "km" ? "font-[family-name:var(--font-kantumruy-pro)]" : "font-[family-name:var(--font-work-sans)]"} 
          antialiased
        `}
      >
        <NextIntlClientProvider messages={messages}>
          <header></header>
          <main>{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
