"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { firestoreService, Medicine } from "@/lib/firestoreService";
import { Search, X, Plus, Minus } from "lucide-react";

interface BillItem {
  medicineId: string;
  medicineName: string;
  category: string;
  strength: string;
  company: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface BillingModalEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bill: any) => Promise<void>;
}

export default function BillingModalEnhanced({
  isOpen,
  onClose,
  onSave,
}: BillingModalEnhancedProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<BillItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showMedicineSearch, setShowMedicineSearch] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMedicines();
    }
  }, [isOpen]);

  const loadMedicines = async () => {
    try {
      const allMedicines = await firestoreService.medicines.getAllMedicines();
      setMedicines(allMedicines || []);
    } catch (error) {
      console.error("Error loading medicines:", error);
      setMedicines([]);
    }
  };

  const filteredMedicines = medicines.filter((med) => {
    const query = searchQuery.toLowerCase();

    const name = med.name?.toLowerCase() || "";
    const category = med.category?.toLowerCase() || "";
    const company = med.company?.toLowerCase() || "";
    const strength = med.strength?.toLowerCase() || "";

    return (
      name.includes(query) ||
      category.includes(query) ||
      company.includes(query) ||
      strength.includes(query)
    );
  });

  const addToCart = (medicine: Medicine) => {
    if (!medicine.id) {
      alert("This medicine has no ID. Please check medicine data.");
      return;
    }

    const currentStock = medicine.currentStock || 0;
    const sellingPrice = medicine.sellingPrice || 0;

    const existingItem = cartItems.find(
      (item) => item.medicineId === medicine.id
    );

    if (existingItem) {
      if (existingItem.quantity < currentStock) {
        updateQuantity(medicine.id, existingItem.quantity + 1);
      } else {
        alert("Not enough stock available.");
      }
    } else {
      if (currentStock <= 0) {
        alert("This medicine is out of stock.");
        return;
      }

      const newItem: BillItem = {
        medicineId: medicine.id,
        medicineName: medicine.name || "Unnamed Medicine",
        category: medicine.category || "N/A",
        strength: medicine.strength || "N/A",
        company: medicine.company || "N/A",
        quantity: 1,
        unitPrice: sellingPrice,
        total: sellingPrice,
      };

      setCartItems([...cartItems, newItem]);
    }

    setShowMedicineSearch(false);
  };

  const updateQuantity = (medicineId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(medicineId);
      return;
    }

    const medicine = medicines.find((m) => m.id === medicineId);
    const currentStock = medicine?.currentStock || 0;

    if (medicine && newQuantity > currentStock) {
      alert("Not enough stock available.");
      return;
    }

    setCartItems(
      cartItems.map((item) =>
        item.medicineId === medicineId
          ? {
              ...item,
              quantity: newQuantity,
              total: newQuantity * item.unitPrice,
            }
          : item
      )
    );
  };

  const removeFromCart = (medicineId: string) => {
    setCartItems(cartItems.filter((item) => item.medicineId !== medicineId));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal * tax) / 100;
  const grandTotal = subtotal - discount + taxAmount;

  const handleSave = async () => {
    if (cartItems.length === 0) {
      alert("Please add medicines to cart");
      return;
    }

    setLoading(true);

    try {
      const billData = {
        customerName: customerName || "Walk-in Customer",
        items: cartItems,
        subtotal,
        discount,
        tax,
        taxAmount,
        grandTotal,
        paymentMethod: "cash",
      };

      await onSave(billData);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error saving bill:", error);
      alert("Failed to generate bill");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCartItems([]);
    setCustomerName("");
    setDiscount(0);
    setTax(0);
    setSearchQuery("");
    setShowMedicineSearch(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-sky-600">
            Create New Bill
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Name */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Customer Name (Optional)
            </label>
            <Input
              placeholder="Enter customer name or leave blank for walk-in"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-2"
            />
          </div>

          {/* Medicine Search */}
          <div className="relative">
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Search & Add Medicines
            </label>

            <div className="relative">
              <Input
                placeholder="Search by name, category, type, company, strength..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowMedicineSearch(true)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            </div>

            {/* Medicine Search Results */}
            {showMedicineSearch && searchQuery && (
              <Card className="absolute top-20 left-0 right-0 max-h-64 overflow-y-auto z-50 border-sky-300 bg-white">
                {filteredMedicines.length > 0 ? (
                  <div className="p-2 space-y-2">
                    {filteredMedicines.map((medicine) => (
                      <button
                        key={medicine.id}
                        type="button"
                        onClick={() => addToCart(medicine)}
                        className="w-full text-left p-3 hover:bg-sky-50 rounded border border-sky-100 flex justify-between items-center transition"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {medicine.name || "Unnamed Medicine"}
                          </p>

                          <p className="text-xs text-gray-600">
                            Type: {medicine.category || "N/A"} | Strength:{" "}
                            {medicine.strength || "N/A"} | Company:{" "}
                            {medicine.company || "N/A"}
                          </p>

                          <p className="text-xs text-gray-500">
                            Stock: {medicine.currentStock || 0} | Price: ₹
                            {(medicine.sellingPrice || 0).toFixed(2)}
                          </p>
                        </div>

                        <Button
                          type="button"
                          size="sm"
                          className="bg-sky-600 hover:bg-sky-700 text-white"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No medicines found
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Cart Items */}
          {cartItems.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Cart Items
              </h3>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cartItems.map((item) => (
                  <Card
                    key={item.medicineId}
                    className="p-3 border-sky-100 flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {item.medicineName}
                      </p>

                      <p className="text-xs text-gray-600">
                        {item.category} | {item.strength} | {item.company}
                      </p>

                      <p className="text-sm text-gray-700 mt-1">
                        ₹{item.unitPrice.toFixed(2)} × {item.quantity} = ₹
                        {item.total.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateQuantity(item.medicineId, item.quantity - 1)
                        }
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>

                      <span className="w-8 text-center font-semibold">
                        {item.quantity}
                      </span>

                      <Button
                        type="button"
                        size="sm"
                        className="h-8 w-8 p-0 bg-sky-600 hover:bg-sky-700 text-white"
                        onClick={() =>
                          updateQuantity(item.medicineId, item.quantity + 1)
                        }
                      >
                        <Plus className="w-4 h-4" />
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeFromCart(item.medicineId)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Billing Details */}
          {cartItems.length > 0 && (
            <div className="space-y-3 bg-sky-50 p-4 rounded-lg border border-sky-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-semibold text-gray-900">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">Discount (₹):</span>
                <Input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) =>
                    setDiscount(Math.max(0, parseFloat(e.target.value) || 0))
                  }
                  className="w-24"
                />
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">Tax (%):</span>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={tax}
                  onChange={(e) =>
                    setTax(Math.max(0, parseFloat(e.target.value) || 0))
                  }
                  className="w-24"
                />
              </div>

              <div className="border-t border-sky-300 pt-3 flex justify-between">
                <span className="font-bold text-gray-900">Grand Total:</span>
                <span className="font-bold text-xl text-sky-600">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {cartItems.length === 0 && (
            <Card className="p-8 text-center border-sky-200">
              <p className="text-gray-500">
                No items in cart. Search and add medicines to create a bill.
              </p>
            </Card>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-sky-300 text-sky-600"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={cartItems.length === 0 || loading}
            className="bg-sky-600 hover:bg-sky-700 text-white font-semibold"
          >
            {loading ? "Generating Bill..." : "Generate Bill"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}