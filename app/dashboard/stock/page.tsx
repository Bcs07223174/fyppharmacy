"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { firestoreService, Medicine, StockTransaction } from "@/lib/firestoreService";
import { AlertTriangle, TrendingDown, Calendar, Edit2 } from "lucide-react";

const StockAdjustmentModal = lazy(() => import("@/components/StockAdjustmentModal"));

export default function StockPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [lowStockMeds, setLowStockMeds] = useState<Medicine[]>([]);
  const [expiringMeds, setExpiringMeds] = useState<Medicine[]>([]);
  const [allTransactions, setAllTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "lowstock" | "expiring" | "transactions">("overview");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load all medicines
      const allMeds = await firestoreService.medicines.getAllMedicines();
      setMedicines(allMeds);

      // Load low stock medicines
      const lowStockMeds = await firestoreService.medicines.getLowStockMedicines();
      setLowStockMeds(lowStockMeds);

      // Load expiring medicines
      const expiringMeds = await firestoreService.medicines.getExpiringMedicines(30);
      setExpiringMeds(expiringMeds);

      // Load all transactions
      const transactions = await firestoreService.stockTransactions.getAllTransactions();
      setAllTransactions(transactions.slice(0, 20).reverse()); // Last 20 transactions
    } catch (error) {
      console.error("Error loading stock data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setShowAdjustmentModal(true);
  };

  const handleSaveAdjustment = async () => {
    loadData();
    setShowAdjustmentModal(false);
  };

  if (loading && medicines.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading stock data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Low Stock Items</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{lowStockMeds.length}</p>
            </div>
            <TrendingDown className="w-12 h-12 text-red-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Expiring Soon (30 days)</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{expiringMeds.length}</p>
            </div>
            <Calendar className="w-12 h-12 text-orange-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Medicines</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{medicines.length}</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="p-0 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {[
            { id: "overview", label: "Overview" },
            { id: "lowstock", label: "Low Stock Items" },
            { id: "expiring", label: "Expiring Soon" },
            { id: "transactions", label: "Transactions" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Medicine Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Stock Level
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Min Stock
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {medicines.slice(0, 10).map((med) => (
                      <tr key={med.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{med.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {med.currentStock} {med.unit}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{med.minStock}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              med.currentStock <= med.minStock
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {med.currentStock <= med.minStock ? "Low Stock" : "Good"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Button
                            onClick={() => handleAdjustStock(med)}
                            className="flex items-center gap-2 text-blue-600 hover:bg-blue-50"
                          >
                            <Edit2 className="w-4 h-4" />
                            Adjust
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Low Stock Tab */}
          {activeTab === "lowstock" && (
            <div className="space-y-4">
              {lowStockMeds.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Medicine Name
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Current Stock
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Min Stock
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Needed
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {lowStockMeds.map((med) => (
                        <tr key={med.id} className="hover:bg-gray-50 bg-red-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {med.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-red-600 font-semibold">
                            {med.currentStock} {med.unit}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{med.minStock}</td>
                          <td className="px-6 py-4 text-sm text-red-600 font-semibold">
                            {med.minStock - med.currentStock} {med.unit}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <Button
                              onClick={() => handleAdjustStock(med)}
                              className="flex items-center gap-2 text-blue-600 hover:bg-blue-50"
                            >
                              <Edit2 className="w-4 h-4" />
                              Adjust
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">All medicines have sufficient stock!</p>
              )}
            </div>
          )}

          {/* Expiring Tab */}
          {activeTab === "expiring" && (
            <div className="space-y-4">
              {expiringMeds.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Medicine Name
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Batch
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Expiry Date
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Days Left
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Stock
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {expiringMeds.map((med) => {
                        const daysLeft = Math.floor(
                          (new Date(med.expiryDate).getTime() - new Date().getTime()) /
                            (1000 * 60 * 60 * 24)
                        );
                        return (
                          <tr key={med.id} className="hover:bg-gray-50 bg-orange-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {med.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {med.batchNumber}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {new Date(med.expiryDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                {daysLeft} days
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {med.currentStock} {med.unit}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No medicines expiring in the next 30 days!</p>
              )}
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === "transactions" && (
            <div className="space-y-4">
              {allTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Reference
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {allTransactions.map((trans) => (
                        <tr key={trans.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {trans.createdAt
                              ? new Date(trans.createdAt).toLocaleString()
                              : "-"}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                trans.type === "sale"
                                  ? "bg-red-100 text-red-800"
                                  : trans.type === "purchase"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {trans.type.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                            {trans.type === "sale" ? "-" : "+"}{trans.quantity}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {trans.reference}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {trans.notes || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No transactions yet</p>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Stock Adjustment Modal */}
      {selectedMedicine && showAdjustmentModal && (
        <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50" />}>
          <StockAdjustmentModal
            isOpen={showAdjustmentModal}
            medicine={selectedMedicine}
            onClose={() => setShowAdjustmentModal(false)}
            onSave={handleSaveAdjustment}
          />
        </Suspense>
      )}
    </div>
  );
}
