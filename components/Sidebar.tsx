"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Pill,
  ShoppingCart,
  Package,
  BarChart3,
  Users,
  Truck,
  Database,
} from "lucide-react";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/medicines", label: "Shop Medicines", icon: Pill },
  { href: "/dashboard/cart", label: "Shopping Cart", icon: ShoppingCart },
  { href: "/dashboard/billing", label: "Billing History", icon: BarChart3 },
  { href: "/dashboard/stock", label: "Stock Management", icon: Package },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { href: "/dashboard/suppliers", label: "Suppliers", icon: Truck },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/data", label: "Data Management", icon: Database },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-sky-50 h-screen flex flex-col">
      <div className="p-6 border-b border-sky-200">
        <h2 className="text-xl font-bold text-sky-900">Pharmacy Menu</h2>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-sky-600 text-white shadow-md"
                  : "text-sky-700 hover:bg-sky-100"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sky-200">
        <p className="text-xs text-sky-600">© 2024 Real Pharmacy System</p>
      </div>
    </aside>
  );
}
