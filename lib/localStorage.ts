// LocalStorage Manager with automatic syncing
export class LocalStorageManager {
  private static MEDICINES_KEY = 'pharmacy_medicines';
  private static BILLS_KEY = 'pharmacy_bills';
  private static SUPPLIERS_KEY = 'pharmacy_suppliers';
  private static CUSTOMERS_KEY = 'pharmacy_customers';
  private static LAST_SYNC = 'pharmacy_last_sync';

  // Check if localStorage is available
  static isAvailable(): boolean {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  // Save medicines to localStorage
  static saveMedicines(medicines: any[]): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.setItem(this.MEDICINES_KEY, JSON.stringify(medicines));
      localStorage.setItem(this.LAST_SYNC, new Date().toISOString());
    } catch (error) {
      console.error('[v0] Failed to save medicines to localStorage:', error);
    }
  }

  // Get medicines from localStorage
  static getMedicines(): any[] {
    if (!this.isAvailable()) return [];
    try {
      const data = localStorage.getItem(this.MEDICINES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[v0] Failed to load medicines from localStorage:', error);
      return [];
    }
  }

  // Save bills to localStorage
  static saveBills(bills: any[]): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.setItem(this.BILLS_KEY, JSON.stringify(bills));
    } catch (error) {
      console.error('[v0] Failed to save bills to localStorage:', error);
    }
  }

  // Get bills from localStorage
  static getBills(): any[] {
    if (!this.isAvailable()) return [];
    try {
      const data = localStorage.getItem(this.BILLS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[v0] Failed to load bills from localStorage:', error);
      return [];
    }
  }

  // Save suppliers to localStorage
  static saveSuppliers(suppliers: any[]): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.setItem(this.SUPPLIERS_KEY, JSON.stringify(suppliers));
    } catch (error) {
      console.error('[v0] Failed to save suppliers to localStorage:', error);
    }
  }

  // Get suppliers from localStorage
  static getSuppliers(): any[] {
    if (!this.isAvailable()) return [];
    try {
      const data = localStorage.getItem(this.SUPPLIERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[v0] Failed to load suppliers from localStorage:', error);
      return [];
    }
  }

  // Save customers to localStorage
  static saveCustomers(customers: any[]): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.setItem(this.CUSTOMERS_KEY, JSON.stringify(customers));
    } catch (error) {
      console.error('[v0] Failed to save customers to localStorage:', error);
    }
  }

  // Get customers from localStorage
  static getCustomers(): any[] {
    if (!this.isAvailable()) return [];
    try {
      const data = localStorage.getItem(this.CUSTOMERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[v0] Failed to load customers from localStorage:', error);
      return [];
    }
  }

  // Clear all data
  static clearAll(): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.removeItem(this.MEDICINES_KEY);
      localStorage.removeItem(this.BILLS_KEY);
      localStorage.removeItem(this.SUPPLIERS_KEY);
      localStorage.removeItem(this.CUSTOMERS_KEY);
      localStorage.removeItem(this.LAST_SYNC);
    } catch (error) {
      console.error('[v0] Failed to clear localStorage:', error);
    }
  }

  // Get last sync time
  static getLastSync(): Date | null {
    if (!this.isAvailable()) return null;
    try {
      const data = localStorage.getItem(this.LAST_SYNC);
      return data ? new Date(data) : null;
    } catch (error) {
      return null;
    }
  }

  // Get storage size estimate
  static getStorageSize(): number {
    if (!this.isAvailable()) return 0;
    try {
      let total = 0;
      const keys = [this.MEDICINES_KEY, this.BILLS_KEY, this.SUPPLIERS_KEY, this.CUSTOMERS_KEY];
      keys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) total += data.length;
      });
      return total;
    } catch {
      return 0;
    }
  }
}
