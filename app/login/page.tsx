"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authService } from "@/lib/authService";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("[v0] Attempting login with email:", email);
      await authService.loginWithEmail(email, password);
      console.log("[v0] Login successful");
      router.push("/dashboard");
    } catch (err: any) {
      console.error("[v0] Login error:", err);
      const errorMessage = err.message || "Failed to login";
      if (errorMessage.includes("user-not-found")) {
        setError("Email not found. Please register first.");
      } else if (errorMessage.includes("wrong-password")) {
        setError("Incorrect password. Please try again.");
      } else if (errorMessage.includes("invalid-email")) {
        setError("Invalid email address. Please try again.");
      } else if (errorMessage.includes("Missing or insufficient permissions")) {
        setError("Firebase permissions issue. Try registering a new account first.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      await authService.loginWithGoogle();
      router.push("/dashboard");
    } catch (err: any) {
      if (err.code === "auth/popup-blocked" || err.code === "auth/operation-not-allowed") {
        setError("Google login is not available in this environment. Please use email/password login.");
      } else {
        setError(err.message || "Failed to login with Google");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-sky-50 p-4">
      <Card className="w-full max-w-md p-8 shadow-xl border-sky-100">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-sky-900 mb-2">Real Pharmacy</h1>
          <p className="text-sky-600">Professional Pharmacy Management</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-sky-900 mb-1">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
              className="border-sky-200 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sky-900 mb-1">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              className="border-sky-200 focus:ring-sky-500"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-sky-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-sky-600">Or continue with</span>
          </div>
        </div>

        <Button
          onClick={handleGoogleLogin}
          className="w-full border border-sky-200 text-sky-700 hover:bg-sky-50 font-medium"
          disabled={loading}
        >
          Sign in with Google
        </Button>

        <p className="mt-6 text-center text-sm text-sky-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-sky-600 hover:text-sky-700 font-semibold">
            Register here
          </Link>
        </p>
      </Card>
    </div>
  );
}
