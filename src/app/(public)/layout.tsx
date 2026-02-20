import { ShopProvider } from "@/contexts/shop-context";
import { ShopHeader, CartDrawer, ShopSidebar } from "@/components/shop";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ShopProvider>
      <SidebarProvider>
        <ShopSidebar />
        <SidebarInset>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header with sidebar trigger */}
            <header className="sticky top-0 z-50 w-full border-b bg-white">
              <div className="flex h-14 items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <ShopHeader />
              </div>
            </header>

            <main className="flex-1">{children}</main>
        
            {/* Footer */}
            <footer className="bg-black text-white py-12">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {/* Brand */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-black font-bold">
                        PS
                      </div>
                      <span className="text-xl font-bold">PhoneShop</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Your trusted destination for the latest smartphones, tablets, and accessories.
                    </p>
                  </div>

                  {/* Quick Links */}
                  <div>
                    <h4 className="font-semibold mb-4">Quick Links</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li><a href="/" className="hover:text-white">Home</a></li>
                      <li><a href="/products?category=phones" className="hover:text-white">Phones</a></li>
                      <li><a href="/products?category=tablets" className="hover:text-white">Tablets</a></li>
                      <li><a href="/products?category=accessories" className="hover:text-white">Accessories</a></li>
                    </ul>
                  </div>

                  {/* Customer Service */}
                  <div>
                    <h4 className="font-semibold mb-4">Customer Service</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li><a href="#" className="hover:text-white">Contact Us</a></li>
                      <li><a href="#" className="hover:text-white">Shipping Info</a></li>
                      <li><a href="#" className="hover:text-white">Returns & Exchanges</a></li>
                      <li><a href="#" className="hover:text-white">FAQ</a></li>
                    </ul>
                  </div>

                  {/* Contact */}
                  <div>
                    <h4 className="font-semibold mb-4">Contact Us</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li>📞 +1 (555) 123-4567</li>
                      <li>✉️ support@phoneshop.com</li>
                      <li>📍 123 Tech Street, Silicon Valley, CA</li>
                    </ul>
                  </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
                  <p>&copy; 2026 PhoneShop. All rights reserved.</p>
                </div>
              </div>
            </footer>

            {/* Global Modals */}
            <CartDrawer />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ShopProvider>
  );
}
