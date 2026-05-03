import { LocalStorageManager } from './localStorage';
import { firestoreService } from './firestoreService';

/**
 * Data Sync Service
 * Manages syncing between Firebase and localStorage
 * Ensures data persistence across both storage methods
 */
export class DataSyncService {
  private static syncInProgress = false;

  /**
   * Sync all data types between Firebase and localStorage
   */
  static async syncAllData() {
    if (this.syncInProgress) return;
    this.syncInProgress = true;

    try {
      await Promise.all([
        this.syncMedicines(),
        this.syncCustomers(),
        this.syncSuppliers(),
        this.syncBills(),
      ]);
      console.log('[v0] All data synced successfully');
    } catch (error) {
      console.error('[v0] Error syncing data:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Sync medicines between Firebase and localStorage
   */
  static async syncMedicines() {
    try {
      const firebaseData = await firestoreService.medicines.getAllMedicines();
      LocalStorageManager.saveMedicines(firebaseData);
      console.log('[v0] Medicines synced:', firebaseData.length);
      return firebaseData;
    } catch (error) {
      console.error('[v0] Error syncing medicines:', error);
      return LocalStorageManager.getMedicines();
    }
  }

  /**
   * Sync customers between Firebase and localStorage
   */
  static async syncCustomers() {
    try {
      const firebaseData = await firestoreService.customers.getAllCustomers();
      LocalStorageManager.saveCustomers(firebaseData);
      console.log('[v0] Customers synced:', firebaseData.length);
      return firebaseData;
    } catch (error) {
      console.error('[v0] Error syncing customers:', error);
      return LocalStorageManager.getCustomers();
    }
  }

  /**
   * Sync suppliers between Firebase and localStorage
   */
  static async syncSuppliers() {
    try {
      const firebaseData = await firestoreService.suppliers.getAllSuppliers();
      LocalStorageManager.saveSuppliers(firebaseData);
      console.log('[v0] Suppliers synced:', firebaseData.length);
      return firebaseData;
    } catch (error) {
      console.error('[v0] Error syncing suppliers:', error);
      return LocalStorageManager.getSuppliers();
    }
  }

  /**
   * Sync bills between Firebase and localStorage
   */
  static async syncBills() {
    try {
      const firebaseData = await firestoreService.bills.getAllBills();
      LocalStorageManager.saveBills(firebaseData);
      console.log('[v0] Bills synced:', firebaseData.length);
      return firebaseData;
    } catch (error) {
      console.error('[v0] Error syncing bills:', error);
      return LocalStorageManager.getBills();
    }
  }

  /**
   * Add medicine and sync
   */
  static async addMedicineAndSync(medicine: any) {
    try {
      const id = await firestoreService.medicines.addMedicine(medicine);
      console.log('[v0] Medicine added with ID:', id);
      await this.syncMedicines();
      return id;
    } catch (error) {
      console.error('[v0] Error adding medicine:', error);
      throw error;
    }
  }

  /**
   * Update medicine and sync
   */
  static async updateMedicineAndSync(id: string, medicine: any) {
    try {
      await firestoreService.medicines.updateMedicine(id, medicine);
      console.log('[v0] Medicine updated:', id);
      await this.syncMedicines();
    } catch (error) {
      console.error('[v0] Error updating medicine:', error);
      throw error;
    }
  }

  /**
   * Add customer and sync
   */
  static async addCustomerAndSync(customer: any) {
    try {
      const id = await firestoreService.customers.addCustomer(customer);
      console.log('[v0] Customer added with ID:', id);
      await this.syncCustomers();
      return id;
    } catch (error) {
      console.error('[v0] Error adding customer:', error);
      throw error;
    }
  }

  /**
   * Update customer and sync
   */
  static async updateCustomerAndSync(id: string, customer: any) {
    try {
      await firestoreService.customers.updateCustomer(id, customer);
      console.log('[v0] Customer updated:', id);
      await this.syncCustomers();
    } catch (error) {
      console.error('[v0] Error updating customer:', error);
      throw error;
    }
  }

  /**
   * Add supplier and sync
   */
  static async addSupplierAndSync(supplier: any) {
    try {
      const id = await firestoreService.suppliers.addSupplier(supplier);
      console.log('[v0] Supplier added with ID:', id);
      await this.syncSuppliers();
      return id;
    } catch (error) {
      console.error('[v0] Error adding supplier:', error);
      throw error;
    }
  }

  /**
   * Update supplier and sync
   */
  static async updateSupplierAndSync(id: string, supplier: any) {
    try {
      await firestoreService.suppliers.updateSupplier(id, supplier);
      console.log('[v0] Supplier updated:', id);
      await this.syncSuppliers();
    } catch (error) {
      console.error('[v0] Error updating supplier:', error);
      throw error;
    }
  }

  /**
   * Get medicines from cache first, then sync
   */
  static getMedicinesWithSync() {
    return {
      cached: LocalStorageManager.getMedicines(),
      sync: () => this.syncMedicines(),
    };
  }

  /**
   * Get customers from cache first, then sync
   */
  static getCustomersWithSync() {
    return {
      cached: LocalStorageManager.getCustomers(),
      sync: () => this.syncCustomers(),
    };
  }

  /**
   * Get suppliers from cache first, then sync
   */
  static getSuppliersWithSync() {
    return {
      cached: LocalStorageManager.getSuppliers(),
      sync: () => this.syncSuppliers(),
    };
  }
}
