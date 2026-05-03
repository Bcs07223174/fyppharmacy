"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { firestoreService, Customer } from "@/lib/firestoreService";
import { LocalStorageManager } from "@/lib/localStorage";
import { Plus, Edit2, Trash2, Phone, Mail, User } from "lucide-react";

const CustomerModal = lazy(() => import("@/components/CustomerModal"));

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setError("");
      setLoading(true);

      const cachedCustomers = LocalStorageManager.getCustomers();

      if (cachedCustomers.length > 0) {
        setCustomers(cachedCustomers);
      }

      const data = await firestoreService.customers.getAllCustomers();
      setCustomers(data);
      LocalStorageManager.saveCustomers(data);

      console.log("[v0] Customers loaded and cached");
    } catch (error: any) {
      console.error("[v0] Error loading customers:", error);

      if (error?.message?.includes("Missing or insufficient permissions")) {
        setError(
          "Note: Using local data only. Firebase permissions need to be configured."
        );
      } else {
        setError("Failed to load from Firebase, showing cached data.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingCustomer(null);
    setShowModal(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      try {
        await firestoreService.customers.deleteCustomer(id);
        await loadCustomers();
      } catch (error) {
        console.error("Error deleting customer:", error);
      }
    }
  };

  const handleSave = async () => {
    try {
      await loadCustomers();
      setShowModal(false);
      console.log("[v0] Customers list refreshed");
    } catch (error) {
      console.error("[v0] Error refreshing customers:", error);
    }
  };

  const filteredCustomers = customers.filter((cust) => {
    const name = cust.name?.toLowerCase() || "";
    const email = cust.email?.toLowerCase() || "";
    const phone = cust.phone || "";
    const search = searchTerm.toLowerCase();

    return (
      name.includes(search) ||
      email.includes(search) ||
      phone.includes(searchTerm)
    );
  });

  if (loading && customers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {error && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Customers
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage customer information
                </p>
              </div>
            </div>

            <div className="mt-8 text-center text-gray-600">
              Loading customers...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>

        <Button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-5 h-5" />
          Add Customer
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Customers</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {customers.length}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Purchases</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {customers.reduce((sum, c) => sum + (c.totalPurchases || 0), 0)}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-gray-600">Avg Purchases/Customer</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {customers.length > 0
              ? (
                  customers.reduce(
                    (sum, c) => sum + (c.totalPurchases || 0),
                    0
                  ) / customers.length
                ).toFixed(1)
              : 0}
          </p>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <Input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      {/* Customers Table */}
      <Card className="overflow-hidden">
        {filteredCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Total Purchases
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Last Purchase
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {customer.name}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {customer.phone}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {customer.email ? (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <a
                            href={`mailto:${customer.email}`}
                            className="text-blue-600 hover:underline"
                          >
                            {customer.email}
                          </a>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                      {customer.totalPurchases || 0}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {customer.lastPurchaseDate
                        ? new Date(
                            customer.lastPurchaseDate
                          ).toLocaleDateString()
                        : "Never"}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEdit(customer)}
                          className="p-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>

                        <Button
                          onClick={() =>
                            customer.id && handleDelete(customer.id)
                          }
                          className="p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No customers found. Add your first customer!
            </p>
          </div>
        )}
      </Card>

      {/* Customer Modal */}
      {showModal && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          }
        >
          <CustomerModal
            isOpen={showModal}
            customer={editingCustomer}
            onClose={() => setShowModal(false)}
            onSave={handleSave}
          />
        </Suspense>
      )}
    </div>
  );
}