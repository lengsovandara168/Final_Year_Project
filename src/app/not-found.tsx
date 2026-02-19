"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-200">404</h1>
          <div className="relative -mt-16">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-black text-white mx-auto">
              <Search className="h-10 w-10" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-8">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been
          moved or doesn&apos;t exist.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="w-full sm:w-auto">
              <Home className="h-4 w-4 mr-2" />
              Go to Home
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => typeof window !== "undefined" && window.history.back()}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>

        <div className="mt-12 pt-8 border-t text-sm text-gray-400">
          <p>
            Need help?{" "}
            <Link href="/" className="text-black underline">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
