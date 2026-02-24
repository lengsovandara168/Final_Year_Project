"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { register } from "@/lib/api";
import type { ApiError } from "@/lib/api";

interface ErrorDetails {
  issues?: Array<{ message: string }>;
  errors?: Array<{ message?: string } | string>;
  message?: string;
}

interface ValidationIssue {
  message: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validation
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }

    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters");
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    try {
      // Register with backend
      const response = await register({
        email: formData.email,
        name: formData.username,
        password: formData.password,
      });

      console.log("Registration successful:", response);

      // Store email for OTP verification
      localStorage.setItem("verifyEmail", formData.email);

      // Redirect to OTP verification page
      router.push("/en/verify-otp");
    } catch (err) {
      console.error("Registration error (raw):", err);
      console.error("Error type:", typeof err);
      console.error("Error keys:", err ? Object.keys(err) : "null");

      const apiError = err as ApiError;

      // Show detailed validation errors if available
      let errorMessage = "Registration failed. Please try again.";

      if (apiError && apiError.message) {
        errorMessage = apiError.message;

        if (apiError.details && typeof apiError.details === "object") {
          const details = apiError.details as ErrorDetails;
          // Handle backend validation issues
          if (details.issues && Array.isArray(details.issues)) {
            errorMessage = details.issues
              .map((issue: ValidationIssue) => issue.message)
              .join(". ");
          } else if (details.errors && Array.isArray(details.errors)) {
            errorMessage = details.errors
              .map((e: { message?: string } | string) => (typeof e === "string" ? e : e.message || "Unknown error"))
              .join(", ");
          } else if (details.message) {
            errorMessage = details.message;
          }
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium mb-1"
            >
              Username
            </label>
            <Input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Confirm Password Input */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium mb-1"
            >
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full mt-6" disabled={isLoading}>
            {isLoading ? "Registering..." : "Register"}
          </Button>
        </form>

        {/* Login Link */}
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
