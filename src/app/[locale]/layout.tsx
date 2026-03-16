import { Kantumruy_Pro, Work_Sans } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

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
  setRequestLocale(locale);
  const messages = await getMessages({ locale });
  const { children } = props;

  return (
    <div
      className={`${latin.variable} ${khmer.variable} ${
        locale === "km"
          ? "font-(family-name:--font-kantumruy-pro)"
          : "font-(family-name:--font-work-sans)"
      } antialiased`}
    >
      <NextIntlClientProvider locale={locale} messages={messages}>
        <main>{children}</main>
      </NextIntlClientProvider>
    </div>
  );
}
