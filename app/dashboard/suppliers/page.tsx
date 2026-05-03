"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { firestoreService, Supplier } from "@/lib/firestoreService";
import { LocalStorageManager } from "@/lib/localStorage";
import { Plus, Edit2, Trash2, Phone, Mail, MapPin } from "lucide-react";

const SupplierModal = lazy(() => import("@/components/SupplierModal"));

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setError("");
      setLoading(true);

      const cachedSuppliers = LocalStorageManager.getSuppliers();

      if (cachedSuppliers.length > 0) {
        setSuppliers(cachedSuppliers);
      }

      const data = await firestoreService.suppliers.getAllSuppliers();
      setSuppliers(data);
      LocalStorageManager.saveSuppliers(data);

      console.log("[v0] Suppliers loaded and cached");
    } catch (error: any) {
      console.error("[v0] Error loading suppliers:", error);

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
    setEditingSupplier(null);
    setShowModal(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      try {
        await firestoreService.suppliers.deleteSupplier(id);
        await loadSuppliers();
      } catch (error) {
        console.error("Error deleting supplier:", error);
      }
    }
  };

  const handleSave = async () => {
    try {
      await loadSuppliers();
      setShowModal(false);
      console.log("[v0] Suppliers list refreshed");
    } catch (error) {
      console.error("[v0] Error refreshing suppliers:", error);
    }
  };

  const filteredSuppliers = suppliers.filter((sup) => {
    const name = sup.name?.toLowerCase() || "";
    const email = sup.email?.toLowerCase() || "";
    const phone = sup.phone || "";
    const search = searchTerm.toLowerCase();

    return (
      name.includes(search) ||
      email.includes(search) ||
      phone.includes(searchTerm)
    );
  });

  if (loading && suppliers.length === 0) {
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
                  Suppliers
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage supplier information
                </p>
              </div>
            </div>

            <div className="mt-8 text-center text-gray-600">
              Loading suppliers...
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
        <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>

        <Button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-5 h-5" />
          Add Supplier
        </Button>
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

      {/* Suppliers Grid */}
      {filteredSuppliers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((supplier) => (
            <Card
              key={supplier.id}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {supplier.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {supplier.totalPurchases || 0} purchases
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(supplier)}
                    className="p-2 text-blue-600 hover:bg-blue-50"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>

                  <Button
                    onClick={() => supplier.id && handleDelete(supplier.id)}
                    className="p-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm break-all">
                    {supplier.email || "No email"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">
                    {supplier.phone || "No phone"}
                  </span>
                </div>

                <div className="flex items-start gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">
                    {[
                      supplier.address,
                      supplier.city,
                      supplier.state,
                      supplier.zipCode,
                    ]
                      .filter(Boolean)
                      .join(", ") || "No address"}
                  </span>
                </div>
              </div>

              {supplier.lastPurchaseDate && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Last purchase:{" "}
                    {new Date(
                      supplier.lastPurchaseDate
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No suppliers found. Add your first supplier!
          </p>
        </Card>
      )}

      {/* Supplier Modal */}
      {showModal && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          }
        >
          <SupplierModal
            isOpen={showModal}
            supplier={editingSupplier}
            onClose={() => setShowModal(false)}
            onSave={handleSave}
          />
        </Suspense>
      )}
    </div>
  );
}