import {
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    updateDoc,
    where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserProfile, UserStatus } from '../types/user';

/**
 * User Management Service
 * Handles all user-related operations for admin panel
 */

export interface GetAllUsersOptions {
    includeDeleted?: boolean;
    statusFilter?: UserStatus;
    roleFilter?: string;
}

/**
 * Get all users from Firestore
 * @param options - Filter options (includeDeleted, statusFilter, roleFilter)
 * @returns Promise with success status and users array
 */
export const getAllUsers = async (
    options: GetAllUsersOptions = {}
): Promise<{ success: boolean; users?: UserProfile[]; error?: string }> => {
    try {
        const { includeDeleted = false, statusFilter, roleFilter } = options;

        let q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));

        // Exclude deleted users by default
        // Note: We do this client-side to avoid Firestore index error with orderBy('createdAt')
        // if (!includeDeleted) {
        //     q = query(q, where('isDeleted', '!=', true));
        // }

        // Filter by status if provided
        if (statusFilter) {
            q = query(q, where('status', '==', statusFilter));
        }

        // Filter by role if provided
        if (roleFilter && roleFilter !== 'all') {
            q = query(q, where('role', '==', roleFilter));
        }

        const querySnapshot = await getDocs(q);
        let users: UserProfile[] = [];

        querySnapshot.forEach((doc) => {
            users.push(doc.data() as UserProfile);
        });

        // Apply client-side filtering for deleted users
        if (!includeDeleted) {
            users = users.filter(user => user.isDeleted !== true);
        }

        return { success: true, users };
    } catch (error: any) {
        console.error('Get all users error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get a single user by ID
 * @param userId - User ID to fetch
 * @returns Promise with success status and user profile
 */
export const getUserById = async (
    userId: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { success: true, user: docSnap.data() as UserProfile };
        } else {
            return { success: false, error: 'User not found' };
        }
    } catch (error: any) {
        console.error('Get user by ID error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Update user profile
 * @param userId - User ID to update
 * @param updates - Partial user profile updates
 * @returns Promise with success status
 */
export const updateUser = async (
    userId: string,
    updates: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> => {
    try {
        const userRef = doc(db, 'users', userId);

        // Remove undefined fields to avoid Firestore error
        // Remove undefined fields to avoid Firestore error
        const sanitizedUpdates: any = {};
        Object.keys(updates).forEach((key) => {
            const value = (updates as any)[key];
            if (value !== undefined) {
                sanitizedUpdates[key] = value;
            }
        });

        await updateDoc(userRef, {
            ...sanitizedUpdates,
            updatedAt: new Date(),
        });

        return { success: true };
    } catch (error: any) {
        console.error('Update user error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Soft delete a user (mark as deleted)
 * @param userId - User ID to delete
 * @returns Promise with success status
 */
export const softDeleteUser = async (
    userId: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            isDeleted: true,
            deletedAt: new Date(),
            updatedAt: new Date(),
        });

        return { success: true };
    } catch (error: any) {
        console.error('Soft delete user error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Block a user
 * @param userId - User ID to block
 * @returns Promise with success status
 */
export const blockUser = async (
    userId: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            status: 'blocked',
            updatedAt: new Date(),
        });

        return { success: true };
    } catch (error: any) {
        console.error('Block user error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Unblock a user
 * @param userId - User ID to unblock
 * @returns Promise with success status
 */
export const unblockUser = async (
    userId: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            status: 'active',
            updatedAt: new Date(),
        });

        return { success: true };
    } catch (error: any) {
        console.error('Unblock user error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Update user status (helper function)
 * @param userId - User ID to update
 * @param status - New status (active or blocked)
 * @returns Promise with success status
 */
export const updateUserStatus = async (
    userId: string,
    status: UserStatus
): Promise<{ success: boolean; error?: string }> => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            status,
            updatedAt: new Date(),
        });

        return { success: true };
    } catch (error: any) {
        console.error('Update user status error:', error);
        return { success: false, error: error.message };
    }
};
