"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const SUPER_ADMIN_EMAILS = ["wordpressrisan@gmail.com"];

function getRoleForEmail(email: string): "admin" | "customer" {
    return SUPER_ADMIN_EMAILS.includes(email.toLowerCase()) ? "admin" : "customer";
}

interface UserData {
    uid: string;
    email: string;
    displayName: string;
    role: "admin" | "customer";
    createdAt: unknown;
    companyName?: string;
    jobTitle?: string;
    website?: string;
    professionalInterests?: string[];
    alertPreferences?: {
        industries: string[];
        locations: string[];
        enabled: boolean;
    };
}

interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    updateUserProfile: (data: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    async function fetchUserData(u: User) {
        const docRef = doc(db, "users", u.uid);
        const docSnap = await getDoc(docRef);
        const expectedRole = getRoleForEmail(u.email || "");
        if (docSnap.exists()) {
            const data = docSnap.data() as UserData;
            // Auto-promote superadmin if not already admin
            if (expectedRole === "admin" && data.role !== "admin") {
                await updateDoc(docRef, { role: "admin" });
                data.role = "admin";
            }
            setUserData(data);
        } else {
            // Create user doc if it doesn't exist (e.g. Google sign-in)
            const newUserData: UserData = {
                uid: u.uid,
                email: u.email || "",
                displayName: u.displayName || "",
                role: expectedRole,
                createdAt: serverTimestamp(),
            };
            await setDoc(docRef, newUserData);
            setUserData(newUserData);
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (u) => {
            setUser(u);
            if (u) {
                await fetchUserData(u);
            } else {
                setUserData(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    async function login(email: string, password: string) {
        await signInWithEmailAndPassword(auth, email, password);
    }

    async function register(email: string, password: string, name: string) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        const newUserData: UserData = {
            uid: cred.user.uid,
            email: cred.user.email || "",
            displayName: name,
            role: getRoleForEmail(cred.user.email || ""),
            createdAt: serverTimestamp(),
        };
        await setDoc(doc(db, "users", cred.user.uid), newUserData);
        setUserData(newUserData);
    }

    async function loginWithGoogle() {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    }

    async function logout() {
        await signOut(auth);
        setUserData(null);
    }

    async function updateUserProfile(data: Partial<UserData>) {
        if (!user) return;
        const docRef = doc(db, "users", user.uid);
        await updateDoc(docRef, data);
        setUserData(prev => prev ? { ...prev, ...data } : null);

        // Also update Firebase Auth profile if displayName is changed
        if (data.displayName) {
            await updateProfile(user, { displayName: data.displayName });
        }
    }

    const value = { user, userData, loading, login, register, loginWithGoogle, logout, updateUserProfile };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
