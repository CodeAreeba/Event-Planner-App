import { onAuthStateChanged, User } from 'firebase/auth';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { getUserProfile } from '../firebase/auth';
import { auth } from '../firebase/config';
import { UserProfile, UserRole } from '../types/user';
import { canAccessAdminPanel, isAdmin, isProvider } from '../utils/permissions';

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    userRole: UserRole | null;
    loading: boolean;
    isAdmin: boolean;
    isProvider: boolean;
    canAccessAdminPanel: boolean;
    setUserProfile: (profile: UserProfile | null) => void;
    refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Computed values based on role
    const isAdminUser = userRole ? isAdmin(userRole) : false;
    const isProviderUser = userRole ? isProvider(userRole) : false;
    const canAccessAdmin = userRole ? canAccessAdminPanel(userRole) : false;

    const refreshUserProfile = async () => {
        if (user) {
            try {
                const { success, profile } = await getUserProfile(user.uid);
                if (success && profile) {
                    setUserProfile(profile);
                    setUserRole(profile.role);
                }
            } catch (error: any) {
                // Handle offline errors gracefully
                if (error.code === 'unavailable' || error.message?.includes('offline')) {
                    console.log('Device is offline, using cached data');
                } else {
                    console.error('Error refreshing user profile:', error);
                }
            }
        }
    };

    useEffect(() => {
        // Listen to authentication state changes
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                // Fetch user profile from Firestore with offline handling
                try {
                    const { success, profile } = await getUserProfile(firebaseUser.uid);
                    if (success && profile) {
                        setUserProfile(profile);
                        setUserRole(profile.role);
                    }
                } catch (error: any) {
                    // Handle offline errors gracefully
                    if (error.code === 'unavailable' || error.message?.includes('offline')) {
                        console.log('Device is offline, will retry when online');
                        // Set default user role to prevent blocking
                        setUserRole('user');
                    } else {
                        console.error('Get user profile error:', error);
                    }
                }
            } else {
                setUserProfile(null);
                setUserRole(null);
            }

            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const value: AuthContextType = {
        user,
        userProfile,
        userRole,
        loading,
        isAdmin: isAdminUser,
        isProvider: isProviderUser,
        canAccessAdminPanel: canAccessAdmin,
        setUserProfile,
        refreshUserProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use the Auth context
 */
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
