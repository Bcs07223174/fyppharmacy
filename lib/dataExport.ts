import { Medicine, Bill } from './firestoreService';

// Export medicines to CSV
export function exportMedicinesCSV(medicines: Medicine[]): void {
  const headers = ['Name', 'Category', 'Type/Strength', 'Company', 'Batch #', 'Expiry Date', 'Purchase Price', 'Selling Price', 'Stock', 'Description'];
  const rows = medicines.map(med => [
    med.name,
    med.category,
    med.strength || 'N/A',
    med.company,
    med.batchNumber,
    med.expiryDate,
    med.purchasePrice.toString(),
    med.sellingPrice.toString(),
    med.currentStock.toString(),
    med.description || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  downloadCSV(csvContent, 'medicines-list.csv');
}

// Export medicines to printable table
export function exportMedicinesPrint(medicines: Medicine[]): void {
  const headers = ['Name', 'Category', 'Type/Strength', 'Company', 'Expiry', 'Price', 'Stock'];
  
  let html = `
    <html>
      <head>
        <title>Pharmacy Medicines List</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { color: #0369a1; margin: 0; }
          table { width: 100%; border-collapse: collapse; }
          th { background-color: #0369a1; color: white; padding: 10px; text-align: left; }
          td { padding: 8px; border-bottom: 1px solid #ddd; }
          tr:nth-child(even) { background-color: #f0f9ff; }
          .footer { margin-top: 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Real Pharmacy System</h1>
          <p>Medicines List - ${new Date().toLocaleDateString()}</p>
        </div>
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${medicines.map(med => `
              <tr>
                <td>${med.name}</td>
                <td>${med.category}</td>
                <td>${med.strength || 'N/A'}</td>
                <td>${med.company}</td>
                <td>${med.expiryDate}</td>
                <td>₹${med.sellingPrice.toFixed(2)}</td>
                <td>${med.currentStock}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>Total Medicines: ${medicines.length}</p>
          <p>Generated: ${new Date().toLocaleString()}</p>
        </div>
      </body>
    </html>
  `;

  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(html);
    newWindow.document.close();
    setTimeout(() => newWindow.print(), 250);
  }
}

// Export bills to CSV
export function exportBillsCSV(bills: Bill[]): void {
  const headers = ['Bill Number', 'Customer Name', 'Date', 'Items Count', 'Subtotal', 'Discount', 'Tax', 'Grand Total'];
  const rows = bills.map(bill => [
    bill.billNumber,
    bill.customerName || 'N/A',
    new Date(bill.createdAt).toLocaleDateString(),
    bill.items.length.toString(),
    bill.subtotal.toFixed(2),
    bill.discount.toFixed(2),
    bill.tax.toFixed(2),
    bill.grandTotal.toFixed(2),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  downloadCSV(csvContent, 'bills-history.csv');
}

// Export to JSON for backup
export function exportDataJSON(data: { medicines: Medicine[], bills: Bill[] }): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `pharmacy-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Helper function to download CSV
function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Save medicines to localStorage cache
export function saveMedicinesToLocalStorage(medicines: Medicine[]): void {
  try {
    localStorage.setItem('pharmacy_medicines_cache', JSON.stringify(medicines));
    localStorage.setItem('pharmacy_cache_timestamp', new Date().toISOString());
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

// Load medicines from localStorage cache
export function getMedicinesFromLocalStorage(): Medicine[] | null {
  try {
    const cached = localStorage.getItem('pharmacy_medicines_cache');
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
}

// Save cart to localStorage
export function saveCartToLocalStorage(cartItems: any[]): void {
  try {
    localStorage.setItem('pharmacy_cart', JSON.stringify(cartItems));
  } catch (error) {
    console.error('Error saving cart:', error);
  }
}

// Load cart from localStorage
export function getCartFromLocalStorage(): any[] {
  try {
    const cart = localStorage.getItem('pharmacy_cart');
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error loading cart:', error);
    return [];
  }
}

// Clear all cache
export function clearAllCache(): void {
  localStorage.removeItem('pharmacy_medicines_cache');
  localStorage.removeItem('pharmacy_cache_timestamp');
  localStorage.removeItem('pharmacy_cart');
}
