import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, OAuthProvider, signOut, setPersistence, browserLocalPersistence, signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Enforce Local Persistence
        setPersistence(auth, browserLocalPersistence)
            .then(() => console.log("AuthContext: Persistence set to local"))
            .catch((error) => console.error("AuthContext: Failed to set persistence", error));

        console.log("AuthContext: Initializing onAuthStateChanged...");
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            console.log("AuthContext: Auth state changed", currentUser?.uid);
            try {
                setUser(currentUser);
                if (currentUser) {
                    const userDoc = doc(db, 'users', currentUser.uid);
                    const docSnap = await getDoc(userDoc);

                    if (docSnap.exists()) {
                        const profileData = docSnap.data();
                        const isAdminEmail = currentUser.email ? currentUser.email.toLowerCase() === 'wugi0525@gmail.com' : false;

                        if (isAdminEmail && profileData.role !== 'admin') {
                            const updatedProfile = { ...profileData, role: 'admin' };
                            await setDoc(userDoc, updatedProfile, { merge: true });
                            setUserProfile(updatedProfile);
                        } else {
                            setUserProfile(profileData);
                        }
                    } else {
                        const isAdminEmail = currentUser.email ? currentUser.email.toLowerCase() === 'wugi0525@gmail.com' : false;
                        const newProfile = {
                            uid: currentUser.uid,
                            email: currentUser.email || 'anonymous@guest.local',
                            displayName: currentUser.displayName || 'Guest User',
                            role: isAdminEmail ? 'admin' : 'patient',
                            isAnonymous: currentUser.isAnonymous || false,
                            currentWorksheet: 1,
                            subscriptionTier: 'free',
                            testPaywallInAdmin: false,
                            createdAt: new Date().toISOString()
                        };
                        await setDoc(userDoc, newProfile);
                        setUserProfile(newProfile);
                    }
                } else {
                    setUserProfile(null);
                }
            } catch (error) {
                console.error("AuthContext: Error in onAuthStateChanged", error);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("AuthContext: Failed to login with Google", error);
            setLoading(false);
            throw error;
        }
    };

    const loginWithApple = async () => {
        setLoading(true);
        try {
            const provider = new OAuthProvider('apple.com');
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("AuthContext: Failed to login with Apple", error);
            setLoading(false);
            throw error;
        }
    };

    const loginAnonymously = async () => {
        setLoading(true);
        try {
            await signInAnonymously(auth);
        } catch (error) {
            console.error("AuthContext: Failed to login anonymously", error);
            setLoading(false);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setUserProfile(null);
        } catch (error) {
            console.error("AuthContext: Logout failed", error);
        }
    };

    const updateProfile = async (updates) => {
        if (!user) return;
        const userDoc = doc(db, 'users', user.uid);
        await setDoc(userDoc, updates, { merge: true });
        setUserProfile(prev => ({ ...prev, ...updates }));
    };

    const value = {
        user,
        userProfile,
        loading,
        loginWithGoogle,
        loginWithApple,
        loginAnonymously,
        logout,
        updateProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

