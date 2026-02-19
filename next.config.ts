import { NextConfig } from "next";

const backendOrigin =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://final-year.agritechkh.com";
const normalizedBackendOrigin = backendOrigin.endsWith("/")
  ? backendOrigin.slice(0, -1)
  : backendOrigin;

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${normalizedBackendOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;
