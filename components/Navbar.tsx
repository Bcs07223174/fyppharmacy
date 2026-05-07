"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { Button } from "./ui/button";
import { LogOut, User } from "lucide-react";
import CurrencySelector from "./CurrencySelector";

export default function Navbar() {
  const { userProfile, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <nav className="bg-sky-600 border-b border-sky-700 px-6 py-4 flex items-center justify-between shadow-md">
      <div>
        <h1 className="text-2xl font-bold text-white">Real Pharmacy System</h1>
      </div>

      <div className="flex items-center gap-4">
        <CurrencySelector />
        <div className="flex items-center gap-2 text-sky-100">
          <User className="w-5 h-5" />
          <span className="text-sm font-medium">{userProfile?.displayName || 'Pharmacist'}</span>
        </div>
        <Button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-medium"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </nav>
  );
}
