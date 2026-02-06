import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db, googleProvider } from "../firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null); // 'admin' | 'cashier'
    const [loading, setLoading] = useState(true);

    // Real Firebase Auth
    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const loginWithGoogle = () => {
        return signInWithPopup(auth, googleProvider);
    };

    const register = async (email, password) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // Create user document with default role
        // For the purpose of getting this 'admin' execution working, we'll default to admin if it's the specific admin email, else staff
        const role = email.includes('admin') ? 'admin' : 'staff';
        await setDoc(doc(db, "users", result.user.uid), {
            email: email,
            role: role,
            createdAt: new Date().toISOString()
        });
        return result;
    };

    const logout = () => {
        return signOut(auth);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Ensure admin@meerantimes.com is ALWAYS admin
                if (user.email === 'admin@meerantimes.com') {
                    const docRef = doc(db, "users", user.uid);
                    await setDoc(docRef, {
                        email: user.email,
                        role: 'admin',
                        lastLogin: new Date().toISOString()
                    }, { merge: true });
                    setUserRole('admin');
                } else {
                    // Fetch role for other users
                    const docRef = doc(db, "users", user.uid);
                    try {
                        const docSnap = await getDoc(docRef);
                        if (docSnap.exists()) {
                            setUserRole(docSnap.data().role);
                        } else {
                            console.log("No user document found");
                            setUserRole('staff'); // Default fallback
                        }
                    } catch (error) {
                        console.error("Error fetching user role:", error);
                    }
                }
            } else {
                setUserRole(null);
            }
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userRole,
        login,
        loginWithGoogle,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
