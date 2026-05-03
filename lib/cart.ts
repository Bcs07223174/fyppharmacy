import { Medicine } from './firestoreService';

export interface CartItem {
  medicine: Medicine;
  quantity: number;
  totalPrice: number;
}

export class CartManager {
  private static readonly CART_KEY = 'pharmacy_cart';

  static addToCart(medicine: Medicine, quantity: number = 1) {
    const cart = this.getCart();
    const existingItem = cart.find(item => item.medicine.id === medicine.id);

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.totalPrice = existingItem.medicine.sellingPrice * existingItem.quantity;
    } else {
      cart.push({
        medicine,
        quantity,
        totalPrice: medicine.sellingPrice * quantity,
      });
    }

    localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
    return cart;
  }

  static removeFromCart(medicineId: string) {
    const cart = this.getCart();
    const filtered = cart.filter(item => item.medicine.id !== medicineId);
    localStorage.setItem(this.CART_KEY, JSON.stringify(filtered));
    return filtered;
  }

  static updateQuantity(medicineId: string, quantity: number) {
    const cart = this.getCart();
    const item = cart.find(item => item.medicine.id === medicineId);
    
    if (item) {
      if (quantity <= 0) {
        return this.removeFromCart(medicineId);
      }
      item.quantity = quantity;
      item.totalPrice = item.medicine.sellingPrice * quantity;
      localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
    }
    return cart;
  }

  static getCart(): CartItem[] {
    if (typeof window === 'undefined') return [];
    const cart = localStorage.getItem(this.CART_KEY);
    return cart ? JSON.parse(cart) : [];
  }

  static clearCart() {
    localStorage.removeItem(this.CART_KEY);
  }

  static getCartTotal() {
    const cart = this.getCart();
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  }

  static getCartCount() {
    const cart = this.getCart();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }
}
