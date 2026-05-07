"use client";

import { useState, useEffect } from "react";
import { Medicine, firestoreService } from "@/lib/firestoreService";
import { DataSyncService } from "@/lib/dataSync";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrency } from "@/lib/currencyContext";
import { X } from "lucide-react";

interface MedicineModalProps {
  isOpen: boolean;
  medicine: Medicine | null;
  onClose: () => void;
  onSave: () => void;
}

const CATEGORIES = ["Antibiotics", "Painkillers", "Vitamins", "Cold & Cough", "Digestive", "Skin Care", "Other"];
const UNITS = ["Tablets", "Capsules", "Syrups", "Injections", "Creams", "Drops", "Strips"];

export default function MedicineModal({
  isOpen,
  medicine,
  onClose,
  onSave,
}: MedicineModalProps) {
  const { currencySymbol } = useCurrency();
  const [formData, setFormData] = useState<Medicine>({
    name: "",
    genericName: "",
    sku: "",
    category: CATEGORIES[0],
    manufacturer: "",
    batchNumber: "",
    expiryDate: new Date(),
    currentStock: 0,
    minStock: 0,
    costPrice: 0,
    sellingPrice: 0,
    unit: UNITS[0],
    description: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (medicine) {
      setFormData(medicine);
    } else {
      setFormData({
        name: "",
        genericName: "",
        sku: "",
        category: CATEGORIES[0],
        manufacturer: "",
        batchNumber: "",
        expiryDate: new Date(),
        currentStock: 0,
        minStock: 0,
        costPrice: 0,
        sellingPrice: 0,
        unit: UNITS[0],
        description: "",
      });
    }
    setErrors({});
  }, [medicine, isOpen]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.genericName.trim()) newErrors.genericName = "Generic name is required";
    if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    if (!formData.manufacturer.trim()) newErrors.manufacturer = "Manufacturer is required";
    if (!formData.batchNumber.trim()) newErrors.batchNumber = "Batch number is required";
    if (formData.sellingPrice <= 0) newErrors.sellingPrice = "Selling price must be greater than 0";
    if (formData.costPrice < 0) newErrors.costPrice = "Cost price cannot be negative";
    if (formData.currentStock < 0) newErrors.currentStock = "Stock cannot be negative";
    if (formData.minStock < 0) newErrors.minStock = "Min stock cannot be negative";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (medicine && medicine.id) {
        // Update existing medicine in Firebase and sync
        await DataSyncService.updateMedicineAndSync(medicine.id, formData);
        console.log("[v0] Medicine updated and synced");
      } else {
        // Add new medicine to Firebase and sync
        await DataSyncService.addMedicineAndSync(formData);
        console.log("[v0] Medicine added and synced");
      }

      // Call onSave to refresh parent component
      onSave();
      onClose();
    } catch (error: any) {
      console.error("[v0] Error saving medicine:", error);
      
      // Extract Firebase error message
      let errorMessage = "Failed to save medicine. ";
      if (error?.code === "permission-denied" || error?.message?.includes("Missing or insufficient permissions")) {
        errorMessage += "Firebase permissions issue. Saving to local storage instead.";
        // Fallback to localStorage
        const currentData = JSON.parse(localStorage.getItem('medicines') || '[]');
        const newData = {
          id: medicine?.id || Date.now().toString(),
          ...formData,
          expiryDate: formData.expiryDate.toISOString(),
        };
        const updated = medicine 
          ? currentData.map((m: any) => m.id === medicine.id ? newData : m)
          : [...currentData, newData];
        localStorage.setItem('medicines', JSON.stringify(updated));
        console.log("[v0] Medicine saved to localStorage (Firebase unavailable)");
        // Still call onSave to refresh
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? 0 : parseFloat(value)) : value,
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      expiryDate: new Date(e.target.value),
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {medicine ? "Edit Medicine" : "Add Medicine"}
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
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medicine Name *
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Aspirin"
                disabled={loading}
              />
              {errors.name && (
                <p className="text-red-600 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Generic Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Generic Name *
              </label>
              <Input
                type="text"
                name="genericName"
                value={formData.genericName}
                onChange={handleChange}
                placeholder="e.g., Acetylsalicylic Acid"
                disabled={loading}
              />
              {errors.genericName && (
                <p className="text-red-600 text-xs mt-1">{errors.genericName}</p>
              )}
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU *
              </label>
              <Input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="e.g., ASP-001"
                disabled={loading}
              />
              {errors.sku && (
                <p className="text-red-600 text-xs mt-1">{errors.sku}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Manufacturer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manufacturer *
              </label>
              <Input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                placeholder="e.g., Pharma Ltd"
                disabled={loading}
              />
              {errors.manufacturer && (
                <p className="text-red-600 text-xs mt-1">{errors.manufacturer}</p>
              )}
            </div>

            {/* Batch Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Number *
              </label>
              <Input
                type="text"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleChange}
                placeholder="e.g., BATCH123"
                disabled={loading}
              />
              {errors.batchNumber && (
                <p className="text-red-600 text-xs mt-1">{errors.batchNumber}</p>
              )}
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <Input
                type="date"
                value={formData.expiryDate.toISOString().split("T")[0]}
                onChange={handleDateChange}
                disabled={loading}
              />
            </div>

            {/* Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                {UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            {/* Cost Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost Price ({currencySymbol})
              </label>
              <Input
                type="number"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                disabled={loading}
              />
              {errors.costPrice && (
                <p className="text-red-600 text-xs mt-1">{errors.costPrice}</p>
              )}
            </div>

            {/* Selling Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selling Price ({currencySymbol}) *
              </label>
              <Input
                type="number"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                disabled={loading}
              />
              {errors.sellingPrice && (
                <p className="text-red-600 text-xs mt-1">{errors.sellingPrice}</p>
              )}
            </div>

            {/* Current Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Stock
              </label>
              <Input
                type="number"
                name="currentStock"
                value={formData.currentStock}
                onChange={handleChange}
                placeholder="0"
                disabled={loading}
              />
              {errors.currentStock && (
                <p className="text-red-600 text-xs mt-1">{errors.currentStock}</p>
              )}
            </div>

            {/* Min Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Stock Level
              </label>
              <Input
                type="number"
                name="minStock"
                value={formData.minStock}
                onChange={handleChange}
                placeholder="0"
                disabled={loading}
              />
              {errors.minStock && (
                <p className="text-red-600 text-xs mt-1">{errors.minStock}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              placeholder="Enter any additional details..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
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
              {loading ? "Saving..." : "Save Medicine"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
