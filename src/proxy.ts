import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Updated matcher to only include en and km
  matcher: ["/", "/(en|km)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
