import { AuthProvider } from "@/contexts/auth-context";
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
      <body>
        <AuthProvider> {children}</AuthProvider>
      </body>
    </html>
  );
}
