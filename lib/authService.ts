import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: "admin" | "pharmacist";
  createdAt: Date;
}

export const authService = {
  // Register with email and password
  async registerWithEmail(email: string, password: string, displayName: string, role: "admin" | "pharmacist" = "pharmacist") {
    try {
      console.log("[v0] Setting persistence for registration");
      await setPersistence(auth, browserLocalPersistence);
      console.log("[v0] Creating user with email:", email);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log("[v0] User created successfully");
      
      // Create user document in Firestore
      const userDoc: User = {
        uid: result.user.uid,
        email,
        displayName,
        role,
        createdAt: new Date(),
      };
      
      console.log("[v0] Saving user profile to Firestore");
      await setDoc(doc(db, "users", result.user.uid), userDoc);
      console.log("[v0] User profile saved successfully");
      return result.user;
    } catch (error: any) {
      console.error("[v0] Registration error:", error.code, error.message);
      throw error;
    }
  },

  // Login with email and password
  async loginWithEmail(email: string, password: string) {
    try {
      console.log("[v0] Setting persistence and attempting login");
      await setPersistence(auth, browserLocalPersistence);
      console.log("[v0] Calling signInWithEmailAndPassword");
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("[v0] Login successful, user:", result.user.email);
      return result.user;
    } catch (error: any) {
      console.error("[v0] Auth service login error:", error.code, error.message);
      throw error;
    }
  },

  // Login with Google
  async loginWithGoogle() {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user exists, if not create user document
      const userDocRef = doc(db, "users", result.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        const newUserDoc: User = {
          uid: result.user.uid,
          email: result.user.email || "",
          displayName: result.user.displayName || "User",
          role: "pharmacist",
          createdAt: new Date(),
        };
        await setDoc(userDocRef, newUserDoc);
      }
      
      return result.user;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  },

  // Get current user from Firestore
  async getCurrentUser(uid: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      return userDoc.exists() ? (userDoc.data() as User) : null;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  },
};
