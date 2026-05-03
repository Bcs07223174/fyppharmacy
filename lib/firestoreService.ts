import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  Query,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "./firebase";

// Medicine interface
export interface Medicine {
  id?: string;
  name: string;
  genericName: string;
  sku: string;
  category: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate: Date;
  currentStock: number;
  minStock: number;
  costPrice: number;
  sellingPrice: number;
  unit: string;
  description?: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Stock transaction interface
export interface StockTransaction {
  id?: string;
  medicineId: string;
  type: "purchase" | "sale" | "adjustment";
  quantity: number;
  reference: string; // Invoice/Bill number
  notes?: string;
  createdAt?: Date;
  createdBy?: string;
}

// Bill/Sales interface
export interface Bill {
  id?: string;
  billNumber: string;
  customerId?: string;
  items: BillItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: "cash" | "card" | "upi" | "other";
  status: "completed" | "pending" | "cancelled";
  notes?: string;
  createdAt?: Date;
  createdBy?: string;
}

export interface BillItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
}

// Supplier interface
export interface Supplier {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  totalPurchases: number;
  lastPurchaseDate?: Date;
  createdAt?: Date;
}

// Customer interface
export interface Customer {
  id?: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  loyalty?: number;
  totalPurchases: number;
  lastPurchaseDate?: Date;
  createdAt?: Date;
}

// Firestore Service
export const firestoreService = {
  // Medicine operations
  medicines: {
    async addMedicine(medicine: Medicine) {
      const docRef = await addDoc(collection(db, "medicines"), {
        ...medicine,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return docRef.id;
    },

    async updateMedicine(id: string, medicine: Partial<Medicine>) {
      await updateDoc(doc(db, "medicines", id), {
        ...medicine,
        updatedAt: new Date(),
      });
    },

    async deleteMedicine(id: string) {
      await deleteDoc(doc(db, "medicines", id));
    },

    async getMedicine(id: string) {
      const doc_snapshot = await getDoc(doc(db, "medicines", id));
      return doc_snapshot.exists() ? { id: doc_snapshot.id, ...doc_snapshot.data() } : null;
    },

    async getAllMedicines(): Promise<Medicine[]> {
      const querySnapshot = await getDocs(collection(db, "medicines"));
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Medicine));
    },

    async searchMedicines(searchTerm: string): Promise<Medicine[]> {
      const allMedicines = await this.getAllMedicines();
      const lowerSearch = searchTerm.toLowerCase();
      return allMedicines.filter(
        (m) =>
          m.name.toLowerCase().includes(lowerSearch) ||
          m.genericName.toLowerCase().includes(lowerSearch) ||
          m.sku.toLowerCase().includes(lowerSearch)
      );
    },

    async getExpiringMedicines(daysFromNow: number = 30): Promise<Medicine[]> {
      const allMedicines = await this.getAllMedicines();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysFromNow);
      
      return allMedicines.filter((m) => {
        const expiryDate = new Date(m.expiryDate);
        return expiryDate <= futureDate && expiryDate > new Date();
      });
    },

    async getLowStockMedicines(): Promise<Medicine[]> {
      const allMedicines = await this.getAllMedicines();
      return allMedicines.filter((m) => m.currentStock <= m.minStock);
    },
  },

  // Stock transaction operations
  stockTransactions: {
    async addTransaction(transaction: StockTransaction) {
      const docRef = await addDoc(collection(db, "stockTransactions"), {
        ...transaction,
        createdAt: new Date(),
      });
      return docRef.id;
    },

    async getTransactionsByMedicine(medicineId: string): Promise<StockTransaction[]> {
      const q = query(
        collection(db, "stockTransactions"),
        where("medicineId", "==", medicineId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as StockTransaction));
    },

    async getAllTransactions(): Promise<StockTransaction[]> {
      const querySnapshot = await getDocs(collection(db, "stockTransactions"));
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as StockTransaction));
    },
  },

  // Bill/Sales operations
  bills: {
    async addBill(bill: Bill) {
      const docRef = await addDoc(collection(db, "bills"), {
        ...bill,
        createdAt: new Date(),
      });
      return docRef.id;
    },

    async getBill(id: string) {
      const doc_snapshot = await getDoc(doc(db, "bills", id));
      return doc_snapshot.exists() ? { id: doc_snapshot.id, ...doc_snapshot.data() } : null;
    },

    async getAllBills(): Promise<Bill[]> {
      const querySnapshot = await getDocs(collection(db, "bills"));
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Bill));
    },

    async getBillsByDate(startDate: Date, endDate: Date): Promise<Bill[]> {
      const allBills = await this.getAllBills();
      return allBills.filter((bill) => {
        const billDate = new Date(bill.createdAt || 0);
        return billDate >= startDate && billDate <= endDate;
      });
    },
  },

  // Supplier operations
  suppliers: {
    async addSupplier(supplier: Supplier) {
      const docRef = await addDoc(collection(db, "suppliers"), {
        ...supplier,
        createdAt: new Date(),
      });
      return docRef.id;
    },

    async updateSupplier(id: string, supplier: Partial<Supplier>) {
      await updateDoc(doc(db, "suppliers", id), supplier);
    },

    async deleteSupplier(id: string) {
      await deleteDoc(doc(db, "suppliers", id));
    },

    async getAllSuppliers(): Promise<Supplier[]> {
      const querySnapshot = await getDocs(collection(db, "suppliers"));
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Supplier));
    },
  },

  // Customer operations
  customers: {
    async addCustomer(customer: Customer) {
      const docRef = await addDoc(collection(db, "customers"), {
        ...customer,
        createdAt: new Date(),
      });
      return docRef.id;
    },

    async updateCustomer(id: string, customer: Partial<Customer>) {
      await updateDoc(doc(db, "customers", id), customer);
    },

    async deleteCustomer(id: string) {
      await deleteDoc(doc(db, "customers", id));
    },

    async getAllCustomers(): Promise<Customer[]> {
      const querySnapshot = await getDocs(collection(db, "customers"));
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Customer));
    },
  },
};
