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
        const adminEmails = ['admin@meerantimes.com', 'abubackerraiyn@gmail.com'];
        const role = (email.toLowerCase().includes('admin') || adminEmails.includes(email.toLowerCase())) ? 'admin' : 'staff';
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
                // Ensure specific emails are ALWAYS admin
                const adminEmails = ['admin@meerantimes.com', 'abubackerraiyn@gmail.com'];
                if (adminEmails.includes(user.email.toLowerCase())) {
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
                            // First time login for this user (e.g. Google Auth)
                            console.log("Creating new user document for", user.email);
                            const defaultRole = 'staff';
                            await setDoc(docRef, {
                                email: user.email,
                                role: defaultRole,
                                createdAt: new Date().toISOString(),
                                authProvider: 'google' // or generic
                            });
                            setUserRole(defaultRole);
                        }
                    } catch (error) {
                        console.error("Error fetching/creating user role:", error);
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
        logout,
        loading // Export loading state just in case
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading ? children : (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    width: '100vw',
                    backgroundColor: '#121212',
                    color: '#fff'
                }}>
                    Loading...
                </div>
            )}
        </AuthContext.Provider>
    );
}
