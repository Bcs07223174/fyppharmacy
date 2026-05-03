"use client";

import { useState } from "react";
import { Medicine, firestoreService, StockTransaction } from "@/lib/firestoreService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface StockAdjustmentModalProps {
  isOpen: boolean;
  medicine: Medicine;
  onClose: () => void;
  onSave: () => void;
}

export default function StockAdjustmentModal({
  isOpen,
  medicine,
  onClose,
  onSave,
}: StockAdjustmentModalProps) {
  const [adjustmentType, setAdjustmentType] = useState<"purchase" | "adjustment">("purchase");
  const [quantity, setQuantity] = useState(0);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (quantity <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }

    if (!reference.trim()) {
      setError("Reference is required");
      return;
    }

    setLoading(true);

    try {
      const newStock = medicine.currentStock + quantity;

      // Update medicine stock
      await firestoreService.medicines.updateMedicine(medicine.id!, {
        currentStock: newStock,
      });

      // Create stock transaction
      const transaction: StockTransaction = {
        medicineId: medicine.id!,
        type: adjustmentType,
        quantity,
        reference,
        notes,
        createdAt: new Date(),
      };

      await firestoreService.stockTransactions.addTransaction(transaction);

      onSave();
      onClose();
    } catch (err) {
      console.error("Error adjusting stock:", err);
      setError("Failed to adjust stock. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Adjust Stock - {medicine.name}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Current Stock Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Current Stock:</span>
              <span className="text-lg font-bold text-blue-600">
                {medicine.currentStock} {medicine.unit}
              </span>
            </div>
          </div>

          {/* Adjustment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Type
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAdjustmentType("purchase")}
                className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                  adjustmentType === "purchase"
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                }`}
                disabled={loading}
              >
                Purchase
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType("adjustment")}
                className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                  adjustmentType === "adjustment"
                    ? "border-green-600 bg-green-50 text-green-600"
                    : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                }`}
                disabled={loading}
              >
                Adjustment
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              placeholder="0"
              min="1"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              New stock will be: {medicine.currentStock + quantity} {medicine.unit}
            </p>
          </div>

          {/* Reference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference *
            </label>
            <Input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={
                adjustmentType === "purchase"
                  ? "e.g., PO-2024-001"
                  : "e.g., COUNT-2024-001"
              }
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {adjustmentType === "purchase"
                ? "Purchase Order number"
                : "Inventory count reference"}
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Adjustment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
