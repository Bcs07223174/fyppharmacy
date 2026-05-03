"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { firestoreService, Medicine, Bill } from "@/lib/firestoreService";
import {
  exportMedicinesCSV,
  exportMedicinesPrint,
  exportBillsCSV,
  exportDataJSON,
  saveMedicinesToLocalStorage,
  getMedicinesFromLocalStorage,
  clearAllCache,
} from "@/lib/dataExport";
import { Download, Printer, Trash2, RefreshCw, Database, HardDrive } from "lucide-react";

export default function DataManagementPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [localCacheStatus, setLocalCacheStatus] = useState("");

  useEffect(() => {
    loadAllData();
    checkLocalCache();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [allMedicines, allBills] = await Promise.all([
        firestoreService.medicines.getAllMedicines(),
        firestoreService.bills.getAllBills(),
      ]);
      setMedicines(allMedicines);
      setBills(allBills);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkLocalCache = () => {
    const cached = getMedicinesFromLocalStorage();
    if (cached) {
      setLocalCacheStatus(`${cached.length} medicines cached locally`);
    } else {
      setLocalCacheStatus("No local cache available");
    }
  };

  const handleSyncToCache = async () => {
    saveMedicinesToLocalStorage(medicines);
    setLocalCacheStatus(`${medicines.length} medicines synced to local cache`);
    setTimeout(() => setLocalCacheStatus(`${medicines.length} medicines cached locally`), 3000);
  };

  const handleClearCache = () => {
    if (confirm("Clear all local data cache? You can sync again anytime.")) {
      clearAllCache();
      setLocalCacheStatus("Local cache cleared");
    }
  };

  const handleExportMedicinesCSV = () => {
    exportMedicinesCSV(medicines);
  };

  const handlePrintMedicines = () => {
    exportMedicinesPrint(medicines);
  };

  const handleExportBillsCSV = () => {
    exportBillsCSV(bills);
  };

  const handleExportFullBackup = () => {
    exportDataJSON({ medicines, bills });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
          <p className="mt-4 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Data Management</h1>

      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 border-sky-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Medicines</p>
              <p className="text-3xl font-bold text-sky-600 mt-2">{medicines.length}</p>
            </div>
            <Database className="w-12 h-12 text-sky-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 border-sky-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Bills</p>
              <p className="text-3xl font-bold text-sky-600 mt-2">{bills.length}</p>
            </div>
            <HardDrive className="w-12 h-12 text-sky-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 border-sky-200">
          <div>
            <p className="text-gray-600 text-sm font-medium">Local Cache Status</p>
            <p className="text-sm font-semibold text-sky-600 mt-2">{localCacheStatus}</p>
          </div>
        </Card>
      </div>

      {/* Firebase Data Management */}
      <Card className="p-6 border-sky-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-sky-600" />
          Firebase Cloud Storage
        </h2>

        <p className="text-gray-600 text-sm mb-4">
          Download all your medicines and bills data from Firebase Cloud for backup or analysis.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            onClick={handleExportMedicinesCSV}
            disabled={medicines.length === 0}
            className="bg-sky-600 hover:bg-sky-700 text-white font-semibold flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export Medicines as CSV
          </Button>

          <Button
            onClick={handlePrintMedicines}
            disabled={medicines.length === 0}
            className="bg-sky-600 hover:bg-sky-700 text-white font-semibold flex items-center gap-2"
          >
            <Printer className="w-5 h-5" />
            Print All Medicines List
          </Button>

          <Button
            onClick={handleExportBillsCSV}
            disabled={bills.length === 0}
            className="bg-sky-600 hover:bg-sky-700 text-white font-semibold flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export Bills History (CSV)
          </Button>

          <Button
            onClick={handleExportFullBackup}
            className="bg-sky-600 hover:bg-sky-700 text-white font-semibold flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Full Backup (JSON)
          </Button>
        </div>
      </Card>

      {/* Local Storage Cache Management */}
      <Card className="p-6 border-sky-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-sky-600" />
          Local Cache Storage
        </h2>

        <p className="text-gray-600 text-sm mb-4">
          Save medicines data locally in your browser for offline access and faster searching. The cache will automatically sync when needed.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            onClick={handleSyncToCache}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Sync to Local Cache
          </Button>

          <Button
            onClick={handleClearCache}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 font-semibold flex items-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Clear Local Cache
          </Button>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            <strong>How it works:</strong> When you sync to local cache, your medicines are stored in browser's local storage. This makes medicine search instant without Firebase calls. Perfect for offline or slow internet scenarios.
          </p>
        </div>
      </Card>

      {/* How to Use */}
      <Card className="p-6 border-sky-200 bg-sky-50">
        <h2 className="text-xl font-bold text-gray-900 mb-4">How to Use This System</h2>

        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold text-gray-900">For Daily Use:</h3>
            <p className="text-gray-700 mt-1">• Sync medicines to local cache when starting your day</p>
            <p className="text-gray-700">• Use the app normally - searching and billing will be instant</p>
            <p className="text-gray-700">• All new medicines and bills auto-sync to Firebase</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">For Backups:</h3>
            <p className="text-gray-700 mt-1">• Export CSV or JSON backup weekly to keep safe copies</p>
            <p className="text-gray-700">• Print medicines list for physical records</p>
            <p className="text-gray-700">• Share CSV files with management or accountant</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">For Reports:</h3>
            <p className="text-gray-700 mt-1">• Use CSV exports to create reports in Excel/Google Sheets</p>
            <p className="text-gray-700">• Track medicine stock and expiry dates easily</p>
            <p className="text-gray-700">• Analyze sales trends and profit margins</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
