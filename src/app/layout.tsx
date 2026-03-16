import { AuthProvider } from "@/contexts/auth-context";
import { QueryProvider } from "@/components/query-provider";
import "./globals.css";

export const metadata = {
  title: "PhoneShop POS",
  description: "Admin dashboard for PhoneShop POS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
