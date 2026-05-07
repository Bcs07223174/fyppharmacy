"use client";

import { useState, useEffect } from "react";
import { Bill, BillItem, firestoreService, Medicine } from "@/lib/firestoreService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrency } from "@/lib/currencyContext";
import { X, Plus, Trash2 } from "lucide-react";

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function BillingModal({
  isOpen,
  onClose,
  onSave,
}: BillingModalProps) {
  const { formatAmount } = useCurrency();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [items, setItems] = useState<BillItem[]>([]);
  const [selectedMedicineId, setSelectedMedicineId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customerId, setCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "upi" | "other">("cash");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      loadMedicines();
      setItems([]);
      setSelectedMedicineId("");
      setQuantity(1);
      setNotes("");
      setErrors("");
    }
  }, [isOpen]);

  const loadMedicines = async () => {
    try {
      const data = await firestoreService.medicines.getAllMedicines();
      setMedicines(data.filter((m) => m.currentStock > 0));
    } catch (error) {
      console.error("Error loading medicines:", error);
    }
  };

  const handleAddItem = () => {
    if (!selectedMedicineId || quantity <= 0) {
      setErrors("Please select a medicine and enter a valid quantity");
      return;
    }

    const medicine = medicines.find((m) => m.id === selectedMedicineId);
    if (!medicine) {
      setErrors("Medicine not found");
      return;
    }

    if (quantity > medicine.currentStock) {
      setErrors(`Only ${medicine.currentStock} units available in stock`);
      return;
    }

    // Check if medicine already in bill
    const existingItem = items.find((item) => item.medicineId === selectedMedicineId);
    if (existingItem) {
      if (existingItem.quantity + quantity > medicine.currentStock) {
        setErrors(`Only ${medicine.currentStock} units available in stock`);
        return;
      }
      existingItem.quantity += quantity;
      existingItem.total = existingItem.quantity * existingItem.price;
    } else {
      const newItem: BillItem = {
        medicineId: selectedMedicineId,
        medicineName: medicine.name,
        quantity,
        price: medicine.sellingPrice,
        discount: 0,
        total: quantity * medicine.sellingPrice,
      };
      setItems([...items, newItem]);
    }

    setSelectedMedicineId("");
    setQuantity(1);
    setErrors("");
  };

  const handleRemoveItem = (medicineId: string) => {
    setItems(items.filter((item) => item.medicineId !== medicineId));
  };

  const handleItemChange = (medicineId: string, field: string, value: any) => {
    setItems(
      items.map((item) => {
        if (item.medicineId === medicineId) {
          const updated = { ...item, [field]: value };
          if (field === "quantity" || field === "discount") {
            updated.total = updated.quantity * updated.price - updated.discount;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      setErrors("Add at least one medicine to the bill");
      return;
    }

    setLoading(true);

    try {
      const bill: Bill = {
        billNumber: `BILL-${Date.now()}`,
        customerId,
        items,
        subtotal,
        tax,
        total,
        paymentMethod,
        status: "completed",
        notes,
        createdAt: new Date(),
      };

      await firestoreService.bills.addBill(bill);

      // Update stock for each item
      for (const item of items) {
        const medicine = medicines.find((m) => m.id === item.medicineId);
        if (medicine) {
          const newStock = medicine.currentStock - item.quantity;
          await firestoreService.medicines.updateMedicine(item.medicineId, {
            currentStock: newStock,
          });

          // Add stock transaction
          await firestoreService.stockTransactions.addTransaction({
            medicineId: item.medicineId,
            type: "sale",
            quantity: item.quantity,
            reference: bill.billNumber,
            notes: `Sale via bill`,
          });
        }
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Error creating bill:", error);
      setErrors("Failed to create bill. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Create New Bill</h2>
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
          {errors && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors}
            </div>
          )}

          {/* Medicine Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Add Medicines</h3>
            <div className="flex gap-2">
              <div className="flex-1">
                <select
                  value={selectedMedicineId}
                  onChange={(e) => setSelectedMedicineId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="">Select a medicine...</option>
                  {medicines.map((med) => (
                    <option key={med.id} value={med.id}>
                      {med.name} (Stock: {med.currentStock} {med.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  placeholder="Qty"
                  min="1"
                  disabled={loading}
                />
              </div>
              <Button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
          </div>

          {/* Items Table */}
          {items.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Bill Items</h3>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Medicine</th>
                      <th className="px-4 py-2 text-right text-sm font-semibold">Qty</th>
                      <th className="px-4 py-2 text-right text-sm font-semibold">Price</th>
                      <th className="px-4 py-2 text-right text-sm font-semibold">Discount</th>
                      <th className="px-4 py-2 text-right text-sm font-semibold">Total</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {items.map((item) => (
                      <tr key={item.medicineId}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.medicineName}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                item.medicineId,
                                "quantity",
                                parseInt(e.target.value) || 0
                              )
                            }
                            min="1"
                            className="w-16"
                            disabled={loading}
                          />
                        </td>
                        <td className="px-4 py-2 text-right text-sm text-gray-600">
                          {formatAmount(item.price)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <Input
                            type="number"
                            value={item.discount}
                            onChange={(e) =>
                              handleItemChange(
                                item.medicineId,
                                "discount",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            min="0"
                            step="0.01"
                            className="w-20"
                            disabled={loading}
                          />
                        </td>
                        <td className="px-4 py-2 text-right text-sm font-semibold text-gray-900">
                          {formatAmount(item.total)}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <Button
                            type="button"
                            onClick={() => handleRemoveItem(item.medicineId)}
                            className="p-2 text-red-600 hover:bg-red-50"
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bill Summary */}
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium text-gray-900">{formatAmount(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (5%):</span>
              <span className="font-medium text-gray-900">{formatAmount(tax)}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between">
              <span className="text-gray-900 font-semibold">Total:</span>
              <span className="text-lg font-bold text-gray-900">{formatAmount(total)}</span>
            </div>
          </div>

          {/* Customer and Payment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer ID (Optional)
              </label>
              <Input
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="CUS-001"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any notes..."
              rows={2}
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
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white"
              disabled={loading || items.length === 0}
            >
              {loading ? "Creating..." : "Create Bill"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
