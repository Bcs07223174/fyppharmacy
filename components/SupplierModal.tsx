"use client";

import { useEffect, useState } from "react";
import { Supplier, firestoreService } from "@/lib/firestoreService";
import { DataSyncService } from "@/lib/dataSync";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface SupplierModalProps {
  isOpen: boolean;
  supplier: Supplier | null;
  onClose: () => void;
  onSave: () => void;
}

export default function SupplierModal({
  isOpen,
  supplier,
  onClose,
  onSave,
}: SupplierModalProps) {
  const [formData, setFormData] = useState<Supplier>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    totalPurchases: 0,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (supplier) {
      setFormData(supplier);
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        totalPurchases: 0,
      });
    }
    setErrors({});
  }, [supplier, isOpen]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.zipCode.trim()) newErrors.zipCode = "Zip code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (supplier && supplier.id) {
        await DataSyncService.updateSupplierAndSync(supplier.id, formData);
        console.log("[v0] Supplier updated and synced");
      } else {
        await DataSyncService.addSupplierAndSync(formData);
        console.log("[v0] Supplier added and synced");
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error("[v0] Error saving supplier:", error);
      
      let errorMessage = "Failed to save supplier. ";
      if (error?.code === "permission-denied" || error?.message?.includes("Missing or insufficient permissions")) {
        errorMessage = "Firebase permissions issue. Saving to local storage instead.";
        const currentData = JSON.parse(localStorage.getItem('suppliers') || '[]');
        const newData = {
          id: supplier?.id || Date.now().toString(),
          ...formData,
        };
        const updated = supplier 
          ? currentData.map((s: any) => s.id === supplier.id ? newData : s)
          : [...currentData, newData];
        localStorage.setItem('suppliers', JSON.stringify(updated));
        console.log("[v0] Supplier saved to localStorage (Firebase unavailable)");
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {supplier ? "Edit Supplier" : "Add Supplier"}
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
                Supplier Name *
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., ABC Pharma Ltd"
                disabled={loading}
              />
              {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="supplier@example.com"
                disabled={loading}
              />
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
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
                City *
              </label>
              <Input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g., Mumbai"
                disabled={loading}
              />
              {errors.city && <p className="text-red-600 text-xs mt-1">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <Input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g., Maharashtra"
                disabled={loading}
              />
              {errors.state && <p className="text-red-600 text-xs mt-1">{errors.state}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zip Code *
              </label>
              <Input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="e.g., 400001"
                disabled={loading}
              />
              {errors.zipCode && (
                <p className="text-red-600 text-xs mt-1">{errors.zipCode}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <Input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address"
              disabled={loading}
            />
            {errors.address && <p className="text-red-600 text-xs mt-1">{errors.address}</p>}
          </div>

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
              {loading ? "Saving..." : "Save Supplier"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
