"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "./firebase";
import { authService, User } from "./authService";
import { initializeDemoData } from "./setupData";

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("[v0] Auth state changed, user:", firebaseUser?.email);
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          console.log("[v0] Fetching user profile for:", firebaseUser.uid);
          const profile = await authService.getCurrentUser(firebaseUser.uid);
          setUserProfile(profile);
          console.log("[v0] User profile loaded");
          // Initialize demo data for new users
          await initializeDemoData(firebaseUser.uid);
        } catch (err: any) {
          console.error("[v0] Failed to fetch user profile:", err);
          if (err?.message?.includes('Missing or insufficient permissions')) {
            setError("Firebase permissions issue - profile data unavailable");
          } else {
            setError("Failed to fetch user profile");
          }
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setUserProfile(null);
    } catch (err) {
      setError("Failed to logout");
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, error, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
