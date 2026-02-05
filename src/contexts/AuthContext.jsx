import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null); // 'admin' | 'cashier'
    const [loading, setLoading] = useState(true);

    // Mock Login for UI Development (Remove in Production)
    const mockLogin = async (email, password) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        if (email === "admin@meerantimes.com" && password === "admin") {
            const user = { uid: "admin1", email, displayName: "Admin User" };
            setCurrentUser(user);
            setUserRole("admin");
            localStorage.setItem("mockUser", JSON.stringify({ user, role: "admin" }));
            return user;
        }
        if (email === "cashier@meerantimes.com" && password === "cashier") {
            const user = { uid: "cashier1", email, displayName: "Cashier 1" };
            setCurrentUser(user);
            setUserRole("cashier");
            localStorage.setItem("mockUser", JSON.stringify({ user, role: "cashier" }));
            return user;
        }
        if (email === "sales@meerantimes.com" && password === "password") {
            const user = { uid: "sales1", email, displayName: "Rahul Sharma" };
            setCurrentUser(user);
            setUserRole("salesman");
            localStorage.setItem("mockUser", JSON.stringify({ user, role: "salesman" }));
            return user;
        }
        throw new Error("Invalid credentials");
    };

    const login = (email, password) => {
        // UNCOMMENT THIS FOR REAL FIREBASE AUTH
        // return signInWithEmailAndPassword(auth, email, password);
        return mockLogin(email, password);
    };

    const logout = () => {
        // return signOut(auth);
        setCurrentUser(null);
        setUserRole(null);
        localStorage.removeItem("mockUser");
    };

    useEffect(() => {
        // Check for mock session
        const stored = localStorage.getItem("mockUser");
        if (stored) {
            const { user, role } = JSON.parse(stored);
            setCurrentUser(user);
            setUserRole(role);
        }
        setLoading(false);

        // REAL FIREBASE LISTENER (Uncomment when config is ready)
        /*
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            // Fetch role from Firestore
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setUserRole(docSnap.data().role);
            }
          }
          setCurrentUser(user);
          setLoading(false);
        });
        return unsubscribe;
        */
    }, []);

    const value = {
        currentUser,
        userRole,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
