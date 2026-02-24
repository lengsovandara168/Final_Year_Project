"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { register, type ApiError } from "@/lib/api";
import { locales } from "@/i18n/routing";

function getLocalePrefix(pathname: string | null) {
  const segments = pathname?.split("/").filter(Boolean) ?? [];
  const firstSegment = segments[0];
  const hasLocale = firstSegment
    ? (locales as readonly string[]).includes(firstSegment)
    : false;
  return hasLocale ? `/${firstSegment}` : "/en";
}

export default function RegisterPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      setIsLoading(false);
      return;
    }

    try {
      await register({
        email: email.trim(),
        name: name.trim(),
      });

      localStorage.setItem("verifyEmail", email.trim());
      localStorage.setItem("verifyFlow", "register");

      const localePrefix = getLocalePrefix(pathname);
      router.push(`${localePrefix}/verify-otp?flow=register`);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>

        {error ? (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name
            </label>
            <Input
              id="name"
              type="text"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <Button type="submit" className="w-full mt-6" disabled={isLoading}>
            {isLoading ? "Registering..." : "Register"}
          </Button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/en/login" className="text-blue-600 hover:underline">
            Login here
          </Link>
        </p>
      </Card>
    </div>
  );
}
