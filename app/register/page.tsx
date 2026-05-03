"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authService } from "@/lib/authService";

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      console.log("[v0] Attempting registration with email:", email);
      await authService.registerWithEmail(email, password, displayName, "pharmacist");
      console.log("[v0] Registration successful");
      router.push("/dashboard");
    } catch (err: any) {
      console.error("[v0] Registration error:", err);
      const errorMessage = err.message || "Failed to register";
      if (errorMessage.includes("email-already-in-use")) {
        setError("Email already registered. Please login instead.");
      } else if (errorMessage.includes("weak-password")) {
        setError("Password is too weak. Use a stronger password.");
      } else if (errorMessage.includes("invalid-email")) {
        setError("Invalid email address. Please check and try again.");
      } else if (errorMessage.includes("Missing or insufficient permissions")) {
        setError("Firebase permissions issue. Check console for details.");
      } else {
        setError(errorMessage);
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
          <p className="text-sky-600">Create Your Account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-sky-900 mb-1">
              Full Name
            </label>
            <Input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="John Doe"
              required
              disabled={loading}
              className="border-sky-200 focus:ring-sky-500"
            />
          </div>

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

          <div>
            <label className="block text-sm font-medium text-sky-900 mb-1">
              Confirm Password
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? "Creating account..." : "Register"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-sky-600">
          Already have an account?{" "}
          <Link href="/login" className="text-sky-600 hover:text-sky-700 font-semibold">
            Login here
          </Link>
        </p>
      </Card>
    </div>
  );
}
