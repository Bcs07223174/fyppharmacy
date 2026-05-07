"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { firestoreService, Bill } from "@/lib/firestoreService";
import { useCurrency } from "@/lib/currencyContext";
import { Plus, Eye, Trash2, Printer, FileText } from "lucide-react";

const BillingModalEnhanced = lazy(() => import("@/components/BillingModalEnhanced"));
const BillPreview = lazy(() => import("@/components/BillPreview"));

export default function BillingPage() {
  const { formatAmount } = useCurrency();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      setLoading(true);
      const data = await firestoreService.bills.getAllBills();
      setBills(
        data.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        })
      );
    } catch (error) {
      console.error("Error loading bills:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setShowModal(true);
  };

  const handleSave = async (billData: any) => {
    try {
      setLoading(true);
      await firestoreService.bills.createBill(billData);
      await loadBills();
      setShowModal(false);
    } catch (error) {
      console.error("Error saving bill:", error);
      alert("Failed to create bill");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (billId: string) => {
    if (confirm("Are you sure you want to delete this bill?")) {
      try {
        await firestoreService.bills.deleteBill(billId);
        await loadBills();
      } catch (error) {
        console.error("Error deleting bill:", error);
      }
    }
  };

  const handlePreview = (bill: Bill) => {
    setSelectedBill(bill);
    setShowPreview(true);
  };

  const filteredBills = bills.filter(
    (bill) =>
      bill.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bill.customerName && bill.customerName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const tabs = [
    { id: "create", label: "Create New Bill", icon: Plus },
    { id: "history", label: `Bill History (${bills.length})`, icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Billing & Sales</h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-sky-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors border-b-2 ${
                isActive
                  ? "border-sky-600 text-sky-600"
                  : "border-transparent text-gray-600 hover:text-sky-600"
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Create New Bill Tab */}
      {activeTab === "create" && (
        <Card className="p-6 border-sky-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Create New Bill</h2>
            <Button
              onClick={handleAddNew}
              className="bg-black hover:bg-gray-800 text-white font-semibold flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Bill
            </Button>
          </div>
          <p className="text-gray-600">
            Click the "Create Bill" button to search medicines, add them to cart, and generate a new bill with instant printing options.
          </p>
        </Card>
      )}

      {/* Bill History Tab */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {/* Search */}
          <div>
            <Input
              placeholder="Search by bill number or customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-sky-200"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
                <p className="mt-4 text-gray-600">Loading bills...</p>
              </div>
            </div>
          ) : filteredBills.length === 0 ? (
            <Card className="p-8 text-center border-sky-200">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchQuery ? "No bills match your search" : "No bills yet. Create your first bill to get started."}
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredBills.map((bill) => (
                <Card key={bill.id} className="p-4 border-sky-100 hover:border-sky-300 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-semibold text-gray-900">Bill #{bill.billNumber}</p>
                          <p className="text-sm text-gray-600">
                            {bill.customerName || "Walk-in Customer"} • {new Date(bill.createdAt || 0).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right mr-4">
                      <p className="font-bold text-sky-600">{formatAmount(bill.grandTotal)}</p>
                      <p className="text-xs text-gray-500">{bill.items.length} items</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handlePreview(bill)}
                        className="bg-sky-600 hover:bg-sky-700 text-white"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-300 text-gray-600 hover:bg-gray-50"
                        onClick={() => {
                          const newWindow = window.open("", "_blank");
                          if (newWindow) {
                            newWindow.document.write(`
                              <html>
                                <head>
                                  <title>Bill #${bill.billNumber}</title>
                                  <style>
                                    body { font-family: Arial; padding: 20px; }
                                    .header { text-align: center; margin-bottom: 20px; }
                                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                                    th { background-color: #0369a1; color: white; }
                                    .total { text-align: right; font-weight: bold; }
                                  </style>
                                </head>
                                <body>
                                  <div class="header">
                                    <h1>Real Pharmacy System</h1>
                                    <p>Bill #${bill.billNumber} | ${new Date(bill.createdAt || 0).toLocaleString()}</p>
                                  </div>
                                  <p><strong>Customer:</strong> ${bill.customerName || "Walk-in Customer"}</p>
                                  <table>
                                    <thead>
                                      <tr>
                                        <th>Medicine</th>
                                        <th>Qty</th>
                                        <th>Price</th>
                                        <th>Total</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      ${bill.items.map((item: any) => `<tr><td>${item.medicineName}</td><td>${item.quantity}</td><td>${formatAmount(item.unitPrice)}</td><td>${formatAmount(item.total)}</td></tr>`).join("")}
                                    </tbody>
                                  </table>
                                  <div class="total">Subtotal: ${formatAmount(bill.subtotal)}</div>
                                  ${bill.discount > 0 ? `<div class="total">Discount: -${formatAmount(bill.discount)}</div>` : ""}
                                  ${bill.tax > 0 ? `<div class="total">Tax (${bill.tax}%): ${formatAmount((bill.subtotal * bill.tax) / 100)}</div>` : ""}
                                  <div class="total" style="font-size: 18px; margin-top: 20px;">Grand Total: ${formatAmount(bill.grandTotal)}</div>
                                </body>
                              </html>
                            `);
                            newWindow.document.close();
                            setTimeout(() => newWindow.print(), 250);
                          }
                        }}
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(bill.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Billing Modal Enhanced */}
      {showModal && (
        <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50" />}>
          <BillingModalEnhanced
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSave={handleSave}
          />
        </Suspense>
      )}

      {/* Bill Preview */}
      {selectedBill && showPreview && (
        <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50" />}>
          <BillPreview
            bill={selectedBill}
            isOpen={showPreview}
            onClose={() => setShowPreview(false)}
          />
        </Suspense>
      )}
    </div>
  );
}
