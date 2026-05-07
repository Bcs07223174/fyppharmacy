"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { firestoreService, Bill, Medicine } from "@/lib/firestoreService";
import { useCurrency } from "@/lib/currencyContext";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Download, Calendar } from "lucide-react";

export default function ReportsPage() {
  const { formatAmount } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [salesData, setSalesData] = useState<any[]>([]);
  const [topMedicines, setTopMedicines] = useState<any[]>([]);
  const [categoryRevenue, setCategoryRevenue] = useState<any[]>([]);
  const [monthlySalesData, setMonthlySalesData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    setDefaultDates();
  }, []);

  const setDefaultDates = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const allBills = await firestoreService.bills.getAllBills();
      const allMedicines = await firestoreService.medicines.getAllMedicines();

      setBills(allBills);
      setMedicines(allMedicines);

      generateReports(allBills, allMedicines);
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateReports = (allBills: Bill[], allMedicines: Medicine[]) => {
    // Daily sales data
    const salesByDate: { [key: string]: number } = {};
    allBills.forEach((bill) => {
      if (bill.createdAt) {
        const date = new Date(bill.createdAt).toLocaleDateString();
        salesByDate[date] = (salesByDate[date] || 0) + (bill.total || 0);
      }
    });

    const dailySales = Object.entries(salesByDate)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setSalesData(dailySales);

    // Top medicines by quantity sold
    const medicinesCount: { [key: string]: { name: string; quantity: number } } = {};
    allBills.forEach((bill) => {
      bill.items.forEach((item) => {
        if (medicinesCount[item.medicineId]) {
          medicinesCount[item.medicineId].quantity += item.quantity;
        } else {
          medicinesCount[item.medicineId] = {
            name: item.medicineName,
            quantity: item.quantity,
          };
        }
      });
    });

    const topMeds = Object.values(medicinesCount)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    setTopMedicines(topMeds);

    // Category revenue
    const categoryRevs: { [key: string]: number } = {};
    allMedicines.forEach((med) => {
      categoryRevs[med.category] = (categoryRevs[med.category] || 0) + med.currentStock * med.sellingPrice;
    });

    const categoryData = Object.entries(categoryRevs).map(([name, value]) => ({
      name,
      value,
    }));
    setCategoryRevenue(categoryData);

    // Monthly sales
    const monthlySales: { [key: string]: number } = {};
    allBills.forEach((bill) => {
      if (bill.createdAt) {
        const date = new Date(bill.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        monthlySales[monthKey] = (monthlySales[monthKey] || 0) + (bill.total || 0);
      }
    });

    const monthlyData = Object.entries(monthlySales)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));
    setMonthlySalesData(monthlyData);
  };

  const handleDateFilter = async () => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const filtered = bills.filter((bill) => {
      const billDate = new Date(bill.createdAt || 0);
      return billDate >= start && billDate <= end;
    });

    generateReports(filtered, medicines);
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const totalRevenue = bills.reduce((sum, bill) => sum + (bill.total || 0), 0);
  const totalBills = bills.length;
  const avgBillValue = totalBills > 0 ? totalRevenue / totalBills : 0;

  if (loading && bills.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>

      {/* Date Filter */}
      <Card className="p-4">
        <div className="flex gap-4 items-end flex-wrap">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button
            onClick={handleDateFilter}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
          >
            <Calendar className="w-4 h-4" />
            Filter
          </Button>
          <Button
            onClick={loadData}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white ml-auto"
            disabled={loading}
          >
            <Download className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatAmount(totalRevenue)}</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm font-medium">Total Bills</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{totalBills}</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm font-medium">Avg Bill Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatAmount(avgBillValue)}</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm font-medium">Total Medicines</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{medicines.length}</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Sales Trend</h2>
          {salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatAmount(Number(value))} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#0088FE"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-8">No sales data</p>
          )}
        </Card>

        {/* Monthly Sales */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Sales</h2>
          {monthlySalesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatAmount(Number(value))} />
                <Bar dataKey="amount" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-8">No sales data</p>
          )}
        </Card>

        {/* Top Medicines */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Medicines (by quantity)</h2>
          {topMedicines.length > 0 ? (
            <div className="space-y-3">
              {topMedicines.map((med, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{med.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(med.quantity / topMedicines[0].quantity) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                      {med.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No data</p>
          )}
        </Card>

        {/* Category Revenue */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Category</h2>
          {categoryRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryRevenue}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${formatAmount(Number(value))}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryRevenue.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatAmount(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-8">No category data</p>
          )}
        </Card>
      </div>
    </div>
  );
}
