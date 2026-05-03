"use client";

import { useEffect, useState } from "react";
import { Customer, firestoreService } from "@/lib/firestoreService";
import { DataSyncService } from "@/lib/dataSync";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface CustomerModalProps {
  isOpen: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSave: () => void;
}

export default function CustomerModal({
  isOpen,
  customer,
  onClose,
  onSave,
}: CustomerModalProps) {
  const [formData, setFormData] = useState<Customer>({
    name: "",
    email: "",
    phone: "",
    address: "",
    loyalty: 0,
    totalPurchases: 0,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData(customer);
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        loyalty: 0,
        totalPurchases: 0,
      });
    }
    setErrors({});
  }, [customer, isOpen]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (customer && customer.id) {
        await DataSyncService.updateCustomerAndSync(customer.id, formData);
        console.log("[v0] Customer updated and synced");
      } else {
        await DataSyncService.addCustomerAndSync(formData);
        console.log("[v0] Customer added and synced");
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error("[v0] Error saving customer:", error);
      
      let errorMessage = "Failed to save customer. ";
      if (error?.code === "permission-denied" || error?.message?.includes("Missing or insufficient permissions")) {
        errorMessage = "Firebase permissions issue. Saving to local storage instead.";
        const currentData = JSON.parse(localStorage.getItem('customers') || '[]');
        const newData = {
          id: customer?.id || Date.now().toString(),
          ...formData,
        };
        const updated = customer 
          ? currentData.map((c: any) => c.id === customer.id ? newData : c)
          : [...currentData, newData];
        localStorage.setItem('customers', JSON.stringify(updated));
        console.log("[v0] Customer saved to localStorage (Firebase unavailable)");
        onSave();
        onClose();
      } else {
        errorMessage += "Please check your connection and try again.";
        setErrors({ submit: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "loyalty" ? parseInt(value) || 0 : value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {customer ? "Edit Customer" : "Add Customer"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., John Doe"
                disabled={loading}
              />
              {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
                disabled={loading}
              />
              {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                placeholder="customer@example.com"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loyalty Points
              </label>
              <Input
                type="number"
                name="loyalty"
                value={formData.loyalty || 0}
                onChange={handleChange}
                placeholder="0"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              placeholder="Street address, city, state"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {customer && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total Purchases</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {customer.totalPurchases}
                  </p>
                </div>
                {customer.lastPurchaseDate && (
                  <div>
                    <p className="text-gray-600">Last Purchase</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(customer.lastPurchaseDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Customer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
