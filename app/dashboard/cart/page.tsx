'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CartManager, CartItem } from '@/lib/cart';
import { firestoreService } from '@/lib/firestoreService';
import { useCurrency } from '@/lib/currencyContext';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { formatAmount } = useCurrency();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const items = CartManager.getCart();
    setCartItems(items);
  };

  const handleUpdateQuantity = (medicineId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      CartManager.updateQuantity(medicineId, newQuantity);
    } else {
      CartManager.removeFromCart(medicineId);
    }
    loadCart();
  };

  const handleRemoveItem = (medicineId: string) => {
    CartManager.removeFromCart(medicineId);
    loadCart();
  };

  const subtotal = CartManager.getCartTotal();
  const discountAmount = (subtotal * discount) / 100;
  const tax = (subtotal - discountAmount) * 0.18;
  const total = subtotal - discountAmount + tax;

  const handleCheckout = async () => {
    if (!customerName.trim()) {
      alert('Please enter customer name');
      return;
    }

    if (cartItems.length === 0) {
      alert('Cart is empty');
      return;
    }

    setLoading(true);
    try {
      const billData = {
        customerName,
        items: cartItems,
        subtotal,
        discountPercent: discount,
        discountAmount,
        tax,
        total,
        paymentMethod,
        createdAt: new Date(),
        status: 'completed',
      };

      await firestoreService.bills.createBill(billData);
      CartManager.clearCart();
      alert('Bill created successfully!');
      setCartItems([]);
      setCustomerName('');
      setDiscount(0);
    } catch (error) {
      console.error('[v0] Error creating bill:', error);
      alert('Failed to create bill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-50">
      <div className="bg-white border-b border-sky-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/medicines">
                <Button variant="outline" size="sm" className="border-sky-200 text-sky-600 hover:bg-sky-50">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Medicines
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-sky-900">Shopping Cart</h1>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sky-600 text-sm">Total Items</p>
              <p className="text-3xl font-bold text-sky-900">{cartItems.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {cartItems.length === 0 ? (
              <Card className="bg-white border-sky-100 p-12 text-center">
                <ShoppingCart className="w-16 h-16 text-sky-200 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-sky-900 mb-2">Your cart is empty</h3>
                <p className="text-sky-600 mb-6">Add some medicines to get started</p>
                <Link href="/dashboard/medicines">
                  <Button className="bg-sky-600 hover:bg-sky-700 text-white">
                    Continue Shopping
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.medicine.id} className="bg-white border-sky-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-6">
                      <div className="flex-1">
                        <h3 className="font-bold text-sky-900 text-lg">{item.medicine.name}</h3>
                        <p className="text-sm text-sky-600 mt-1">
                          {item.medicine.company} • {item.medicine.strength}
                        </p>
                        <p className="text-2xl font-bold text-sky-900 mt-2">{formatAmount(item.medicine.sellingPrice)}</p>
                      </div>

                      <div className="flex items-center gap-3 bg-sky-50 rounded-lg p-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.medicine.id, item.quantity - 1)}
                          className="p-2 hover:bg-sky-100 rounded text-sky-600"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateQuantity(item.medicine.id, parseInt(e.target.value) || 1)}
                          className="w-12 text-center font-semibold bg-transparent border-none outline-none text-sky-900"
                          min="1"
                        />
                        <button
                          onClick={() => handleUpdateQuantity(item.medicine.id, item.quantity + 1)}
                          className="p-2 hover:bg-sky-100 rounded text-sky-600"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right min-w-32">
                        <p className="text-sm text-sky-600 mb-2">Subtotal</p>
                        <p className="text-xl font-bold text-sky-900">{formatAmount(item.totalPrice)}</p>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.medicine.id)}
                        className="p-3 hover:bg-red-50 rounded-lg text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div>
              <Card className="bg-white border-sky-100 p-6 sticky top-24 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-sky-900 mb-4">Order Summary</h2>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-sky-900 mb-2">Customer Name</label>
                    <Input
                      type="text"
                      placeholder="Enter customer name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="border-sky-200 focus:border-sky-400"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-sky-900 mb-2">Discount (%)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={discount}
                      onChange={(e) => setDiscount(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                      className="border-sky-200 focus:border-sky-400"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-sky-900 mb-3">Payment Method</label>
                    <div className="space-y-2">
                      {['cash', 'card', 'upi'].map((method) => (
                        <label key={method} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="payment"
                            value={method}
                            checked={paymentMethod === method}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-4 h-4 text-sky-600"
                          />
                          <span className="text-sky-900 font-medium capitalize">{method}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-sky-100 pt-6 space-y-3">
                  <div className="flex justify-between text-sky-900">
                    <span>Subtotal</span>
                    <span className="font-semibold">{formatAmount(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount ({discount}%)</span>
                      <span className="font-semibold">-{formatAmount(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sky-900">
                    <span>Tax (18% GST)</span>
                    <span className="font-semibold">{formatAmount(tax)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-sky-900 pt-3 border-t border-sky-100">
                    <span>Total</span>
                    <span>{formatAmount(total)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={loading || cartItems.length === 0}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-3 text-lg"
                >
                  {loading ? 'Processing...' : 'Complete Purchase'}
                </Button>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
