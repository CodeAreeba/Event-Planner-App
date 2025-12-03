import {
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    User,
    UserCredential,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { UserProfile, UserRole } from '../types/user';
import { auth, db } from './config';

/**
 * Get user-friendly error message from Firebase error code
 */
const getAuthErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
            return 'Invalid email or password. Please try again.';
        case 'auth/email-already-in-use':
            return 'This email is already registered. Please login instead.';
        case 'auth/weak-password':
            return 'Password is too weak. Please use at least 6 characters.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/user-disabled':
            return 'This account has been disabled. Please contact support.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please try again later.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your connection.';
        case 'auth/operation-not-allowed':
            return 'This operation is not allowed. Please contact support.';
        default:
            return 'An error occurred. Please try again.';
    }
};

/**
 * Sign up a new user with email and password
 * Note: User will be logged out after signup and must login manually
 */
export const signup = async (
    email: string,
    password: string,
    name: string
): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
        console.log('🔐 Creating user account...');
        const userCredential: UserCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );
        const user = userCredential.user;
        const userId = user.uid;
        console.log('✅ User account created:', userId);

        // Logout user IMMEDIATELY to prevent brief authenticated state
        console.log('🚪 Logging out user immediately...');
        await signOut(auth);
        console.log('✅ User logged out');

        // Create user profile in Firestore AFTER logout
        // This works because Firestore rules allow users to create their own profile
        const userProfile: UserProfile = {
            uid: userId,
            email: user.email || email,
            name,
            role: 'user', // Default role for new signups
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        try {
            console.log('💾 Creating user profile in Firestore...');
            await setDoc(doc(db, 'users', userId), userProfile);
            console.log('✅ User profile created in Firestore');
        } catch (firestoreError: any) {
            console.error('❌ Firestore profile creation failed:', firestoreError);
            console.error('   Error code:', firestoreError.code);
            console.error('   Error message:', firestoreError.message);
            // Profile creation failed, but user account exists
            // They can still login, and AuthContext will create the profile
        }

        return { success: true, user };
    } catch (error: any) {
        console.error('❌ Signup error:', error);
        console.error('   Error code:', error.code);
        const errorMessage = getAuthErrorMessage(error.code);
        return { success: false, error: errorMessage };
    }
};

/**
 * Login user with email and password
 */
export const login = async (
    email: string,
    password: string
): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
        const userCredential: UserCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );
        return { success: true, user: userCredential.user };
    } catch (error: any) {
        console.error('Login error:', error);
        const errorMessage = getAuthErrorMessage(error.code);
        return { success: false, error: errorMessage };
    }
};

/**
 * Logout current user
 */
export const logout = async (): Promise<{ success: boolean; error?: string }> => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error: any) {
        console.error('Logout error:', error);
        const errorMessage = getAuthErrorMessage(error.code);
        return { success: false, error: errorMessage };
    }
};

/**
 * Send password reset email
 */
export const resetPassword = async (
    email: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error: any) {
        console.error('Password reset error:', error);
        const errorMessage = getAuthErrorMessage(error.code);
        return { success: false, error: errorMessage };
    }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = (): User | null => {
    return auth.currentUser;
};

/**
 * Get user profile from Firestore with retry logic for offline errors
 */
export const getUserProfile = async (
    uid: string,
    retries: number = 3
): Promise<{ success: boolean; profile?: UserProfile; error?: string }> => {
    let lastError: any;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`📖 Fetching user profile for uid: ${uid} (attempt ${attempt}/${retries})`);
            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                console.log('✅ User profile found:', docSnap.data());
                return { success: true, profile: docSnap.data() as UserProfile };
            } else {
                console.warn('⚠️ User profile not found in Firestore for uid:', uid);
                return { success: false, error: 'User profile not found' };
            }
        } catch (error: any) {
            lastError = error;
            const isOfflineError = error.code === 'unavailable' ||
                error.message?.includes('offline') ||
                error.message?.includes('network');

            console.error(`❌ Get user profile error (attempt ${attempt}/${retries}):`, error);
            console.error('   Error code:', error.code);
            console.error('   Error message:', error.message);

            // If it's an offline error and we have retries left, wait and retry
            if (isOfflineError && attempt < retries) {
                const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
                console.log(`⏳ Retrying in ${waitTime}ms...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }

            // If not an offline error or out of retries, return error
            if (attempt === retries) {
                console.error('❌ All retry attempts exhausted');
                return {
                    success: false,
                    error: isOfflineError
                        ? 'Unable to connect. Please check your internet connection and try again.'
                        : error.message
                };
            }
        }
    }

    return { success: false, error: lastError?.message || 'Failed to fetch user profile' };
};

/**
 * Get user role from Firestore
 */
export const getUserRole = async (
    uid: string
): Promise<{ success: boolean; role?: UserRole; error?: string }> => {
    try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const userData = docSnap.data() as UserProfile;
            return { success: true, role: userData.role };
        } else {
            return { success: false, error: 'User not found' };
        }
    } catch (error: any) {
        console.error('Get user role error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Update user profile in Firestore
 */
export const updateUserProfile = async (
    uid: string,
    updates: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> => {
    try {
        const docRef = doc(db, 'users', uid);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: new Date(),
        });
        return { success: true };
    } catch (error: any) {
        console.error('Update user profile error:', error);
        return { success: false, error: error.message };
    }
};
