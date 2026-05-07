"use client";

import { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { firestoreService, Bill, Medicine } from "@/lib/firestoreService";
import { TrendingUp, Package, ShoppingCart, AlertTriangle } from "lucide-react";
import { useCurrency } from "@/lib/currencyContext";

// Lazy load heavy components
const ChartsContainer = dynamic(() => import("@/components/ChartsContainer"), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded" />,
  ssr: false,
});

export default function DashboardPage() {
  const { formatAmount } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [lowStockMeds, setLowStockMeds] = useState(0);
  const [expiringMeds, setExpiringMeds] = useState(0);
  const [chartsData, setChartsData] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load all data in parallel for better performance
      const [bills, medicines] = await Promise.all([
        firestoreService.bills.getAllBills(),
        firestoreService.medicines.getAllMedicines(),
      ]);

      // Calculate metrics
      const revenue = bills.reduce((sum, bill) => sum + (bill.total || 0), 0);
      setTotalRevenue(revenue);
      setTotalSales(bills.length);

      const lowStock = medicines.filter((m) => m.currentStock <= m.minStock).length;
      setLowStockMeds(lowStock);

      const expiring = medicines.filter((m) => {
        const expiryDate = new Date(m.expiryDate);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return expiryDate <= thirtyDaysFromNow;
      });
      setExpiringMeds(expiring.length);

      // Process charts data
      const salesByMonth: { [key: string]: number } = {};
      bills.forEach((bill) => {
        if (bill.createdAt) {
          const date = new Date(bill.createdAt);
          const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
          salesByMonth[monthKey] = (salesByMonth[monthKey] || 0) + (bill.total || 0);
        }
      });

      // Prepare charts data
      const monthlyData = Object.entries(salesByMonth).map(([month, amount]) => ({
        month,
        amount,
      }));

      const categoryStats: { [key: string]: number } = {};
      medicines.forEach((med) => {
        categoryStats[med.category] = (categoryStats[med.category] || 0) + med.currentStock;
      });

      const categoryChartData = Object.entries(categoryStats).map(([name, value]) => ({
        name,
        value,
      }));

      setChartsData({
        monthlyData,
        categoryChartData,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatAmount(totalRevenue)}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {totalSales}
              </p>
            </div>
            <ShoppingCart className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {lowStockMeds}
              </p>
            </div>
            <Package className="w-12 h-12 text-orange-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Expiring Soon</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {expiringMeds}
              </p>
            </div>
            <AlertTriangle className="w-12 h-12 text-red-600 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Charts - Lazy Loaded */}
      {chartsData && (
        <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded" />}>
          <ChartsContainer data={chartsData} />
        </Suspense>
      )}
    </div>
  );
}
