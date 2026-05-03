"use client";

import { Bill } from "@/lib/firestoreService";
import { X } from "lucide-react";
import { useRef } from "react";

interface BillPreviewProps {
  bill: Bill;
  isOpen: boolean;
  onClose: () => void;
}

export default function BillPreview({ bill, isOpen, onClose }: BillPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Bill Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Bill Content */}
        <div className="p-8" ref={printRef}>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">PharmaCare</h1>
            <p className="text-gray-600 mt-1">Professional Pharmacy Management</p>
            <p className="text-sm text-gray-500 mt-2">
              Address: 123 Main St | Phone: +1-800-PHARM | Email: info@pharmacare.com
            </p>
          </div>

          {/* Bill Details */}
          <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-300">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">BILL DETAILS</h3>
              <p className="text-sm text-gray-900">
                <span className="font-semibold">Bill Number:</span> {bill.billNumber}
              </p>
              <p className="text-sm text-gray-900">
                <span className="font-semibold">Date:</span>{" "}
                {bill.createdAt
                  ? new Date(bill.createdAt).toLocaleDateString()
                  : "-"}
              </p>
              <p className="text-sm text-gray-900">
                <span className="font-semibold">Time:</span>{" "}
                {bill.createdAt
                  ? new Date(bill.createdAt).toLocaleTimeString()
                  : "-"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">PAYMENT DETAILS</h3>
              <p className="text-sm text-gray-900">
                <span className="font-semibold">Payment Method:</span> {bill.paymentMethod.toUpperCase()}
              </p>
              <p className="text-sm text-gray-900">
                <span className="font-semibold">Status:</span>{" "}
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    bill.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {bill.status.toUpperCase()}
                </span>
              </p>
              {bill.customerId && (
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">Customer ID:</span> {bill.customerId}
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left text-sm font-semibold text-gray-900 py-2">
                    Medicine Name
                  </th>
                  <th className="text-right text-sm font-semibold text-gray-900 py-2">
                    Qty
                  </th>
                  <th className="text-right text-sm font-semibold text-gray-900 py-2">
                    Price
                  </th>
                  <th className="text-right text-sm font-semibold text-gray-900 py-2">
                    Discount
                  </th>
                  <th className="text-right text-sm font-semibold text-gray-900 py-2">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bill.items.map((item) => (
                  <tr key={item.medicineId}>
                    <td className="text-sm text-gray-900 py-3">
                      {item.medicineName}
                    </td>
                    <td className="text-right text-sm text-gray-900 py-3">
                      {item.quantity}
                    </td>
                    <td className="text-right text-sm text-gray-900 py-3">
                      ₹{item.price.toFixed(2)}
                    </td>
                    <td className="text-right text-sm text-gray-900 py-3">
                      ₹{item.discount.toFixed(2)}
                    </td>
                    <td className="text-right text-sm font-semibold text-gray-900 py-3">
                      ₹{item.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-900">₹{bill.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-3 pb-3 border-b-2 border-gray-300">
                <span className="text-gray-600">Tax (5%):</span>
                <span className="text-gray-900">₹{bill.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-900">Total Amount:</span>
                <span className="text-gray-900">₹{bill.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {bill.notes && (
            <div className="mb-8 pb-8 border-b border-gray-300">
              <p className="text-sm font-semibold text-gray-600 mb-2">NOTES</p>
              <p className="text-sm text-gray-900">{bill.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 pt-8">
            <p>Thank you for your purchase!</p>
            <p className="mt-2">This is a computer generated bill and doesn't require a signature.</p>
          </div>
        </div>

        {/* Print Button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3 print:hidden">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
          >
            Print Bill
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-md text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
