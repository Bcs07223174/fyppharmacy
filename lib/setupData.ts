import { db } from "./firebase";
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";

export const initializeDemoData = async (userId: string) => {
  try {
    // Check if demo data already exists
    const medicinesRef = collection(db, "medicines");
    const q = query(medicinesRef, where("createdBy", "==", userId));
    const existing = await getDocs(q);
    
    if (existing.size > 0) {
      return; // Demo data already exists
    }

    // Add sample medicines
    const sampleMedicines = [
      {
        name: "Paracetamol",
        genericName: "Acetaminophen",
        category: "Pain Relief",
        stock: 500,
        minStock: 50,
        costPrice: 5,
        sellingPrice: 10,
        expiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        batchNumber: "BATCH001",
        createdBy: userId,
        createdAt: new Date(),
      },
      {
        name: "Aspirin",
        genericName: "Acetylsalicylic Acid",
        category: "Pain Relief",
        stock: 300,
        minStock: 30,
        costPrice: 3,
        sellingPrice: 7,
        expiry: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        batchNumber: "BATCH002",
        createdBy: userId,
        createdAt: new Date(),
      },
      {
        name: "Amoxicillin",
        genericName: "Amoxicillin",
        category: "Antibiotics",
        stock: 200,
        minStock: 40,
        costPrice: 12,
        sellingPrice: 25,
        expiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        batchNumber: "BATCH003",
        createdBy: userId,
        createdAt: new Date(),
      },
    ];

    for (const medicine of sampleMedicines) {
      const docId = `${userId}_${medicine.name.replace(/\s+/g, "_")}`;
      await setDoc(doc(db, "medicines", docId), medicine);
    }

    // Add sample supplier
    const sampleSupplier = {
      name: "PharmaChem Supplies",
      contactPerson: "John Smith",
      email: "contact@pharmachem.com",
      phone: "+1234567890",
      address: "123 Medicine Street, City",
      paymentTerms: "Net 30",
      createdBy: userId,
      createdAt: new Date(),
    };
    await setDoc(doc(db, "suppliers", `${userId}_supplier1`), sampleSupplier);
  } catch (error) {
    console.error("Error initializing demo data:", error);
  }
};
