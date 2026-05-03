'use client';

import { useEffect, useState, lazy, Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { firestoreService, Medicine } from '@/lib/firestoreService';
import { LocalStorageManager } from '@/lib/localStorage';
import { CartManager } from '@/lib/cart';
import { Plus, Edit2, Trash2, Search, ShoppingCart, Eye, X } from 'lucide-react';
import Link from 'next/link';

const MedicineModal = lazy(() => import('@/components/MedicineModal'));

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMedicines();
    updateCartCount();
    setIsAdmin(true);
  }, []);

  const loadMedicines = async () => {
    try {
      setError('');
      setLoading(true);
      const cachedMedicines = LocalStorageManager.getMedicines();
      if (cachedMedicines.length > 0) {
        setMedicines(cachedMedicines);
      }
      
      const firebaseData = await firestoreService.medicines.getAllMedicines();
      setMedicines(firebaseData);
      LocalStorageManager.saveMedicines(firebaseData);
    } catch (error: any) {
      console.error('[v0] Error loading medicines:', error);
      if (error?.message?.includes('Missing or insufficient permissions')) {
        setError('Note: Using local data only. Firebase permissions need to be configured.');
      } else {
        setError('Failed to load from Firebase, showing cached data.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingMedicine(null);
    setShowModal(true);
  };

  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (typeof window !== 'undefined' && window.confirm('Delete this medicine?')) {
      try {
        await firestoreService.medicines.deleteMedicine(id);
        loadMedicines();
      } catch (error) {
        console.error('[v0] Error deleting medicine:', error);
      }
    }
  };

  const handleAddToCart = (medicine: Medicine) => {
    CartManager.addToCart(medicine, 1);
    updateCartCount();
  };

  const updateCartCount = () => {
    const count = CartManager.getCartCount();
    setCartCount(count);
  };

  const handleSave = async () => {
    await loadMedicines();
    setShowModal(false);
  };

  const filteredMedicines = medicines.filter((med) =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && medicines.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mb-4"></div>
          <p className="text-sky-600 font-medium">Loading medicines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-50">
      {/* Header */}
      <div className="bg-white border-b border-sky-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {error && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
              {error}
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-sky-900">Pharmacy Medicines</h1>
              <p className="text-sky-600 mt-1">Browse and manage medicines</p>
            </div>
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Button
                  onClick={handleAddNew}
                  className="bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-2 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Add Medicine
                </Button>
              )}
              <Link href="/dashboard/billing">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 font-medium relative">
                  <ShoppingCart className="w-5 h-5" />
                  Cart
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6 relative">
            <Search className="absolute left-3 top-3.5 text-sky-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search medicines by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-sky-50 border-sky-200 focus:border-sky-400 focus:ring-sky-400"
            />
          </div>
        </div>
      </div>

      {/* Medicines Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredMedicines.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-sky-200 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-sky-900 mb-2">No medicines found</h3>
            <p className="text-sky-600">Try adjusting your search or add new medicines</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMedicines.map((medicine) => (
              <Card
                key={medicine.id}
                className="bg-white hover:shadow-lg transition-all duration-300 border-sky-100 overflow-hidden flex flex-col group"
              >
                {/* Medicine Header */}
                <div className="bg-gradient-to-r from-sky-50 to-sky-100 p-4 border-b border-sky-100">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-sky-900 text-lg line-clamp-2">{medicine.name}</h3>
                      <p className="text-xs text-sky-600 mt-1">{medicine.company}</p>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(medicine)}
                          className="p-2 hover:bg-sky-200 rounded-lg text-sky-600"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(medicine.id)}
                          className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Medicine Details */}
                <div className="flex-1 p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-sky-50 rounded-lg p-3">
                      <p className="text-sky-600 text-xs font-semibold uppercase">Type</p>
                      <p className="text-sky-900 font-semibold">{medicine.category}</p>
                    </div>
                    <div className="bg-sky-50 rounded-lg p-3">
                      <p className="text-sky-600 text-xs font-semibold uppercase">Strength</p>
                      <p className="text-sky-900 font-semibold">{medicine.strength}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-3">
                      <p className="text-emerald-600 text-xs font-semibold uppercase">Stock</p>
                      <p className="text-emerald-900 font-semibold">{medicine.currentStock}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-orange-600 text-xs font-semibold uppercase">Expiry</p>
                      <p className="text-orange-900 font-semibold text-xs">
                        {new Date(medicine.expiryDate).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-sky-100 pt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-sky-900">₹{medicine.sellingPrice}</span>
                      <span className="text-sm text-sky-500 line-through">₹{medicine.costPrice}</span>
                      <span className="text-xs font-semibold text-emerald-600 ml-auto">
                        {Math.round(((medicine.costPrice - medicine.sellingPrice) / medicine.costPrice) * 100)}% off
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-sky-100 p-4 flex gap-2">
                  <button
                    onClick={() => handleAddToCart(medicine)}
                    disabled={medicine.currentStock <= 0}
                    className="flex-1 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {medicine.currentStock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50" />}>
          <MedicineModal
            isOpen={showModal}
            medicine={editingMedicine}
            onClose={() => setShowModal(false)}
            onSave={handleSave}
          />
        </Suspense>
      )}
    </div>
  );
}
