"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && mounted) {
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/landing");
      }
    }
  }, [user, loading, router, mounted]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-sky-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mb-4"></div>
        <h1 className="text-2xl font-bold text-sky-900">Real Pharmacy System</h1>
        <p className="text-sky-600 mt-2">Loading...</p>
      </div>
    </div>
  );
}
