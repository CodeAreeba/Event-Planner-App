import {
    collection,
    deleteDoc,
    doc,
    DocumentSnapshot,
    getDocs,
    limit,
    orderBy,
    query,
    startAfter,
    updateDoc,
    where
} from 'firebase/firestore';
import { Booking } from '../types/booking';
import { Service, ServiceStatus } from '../types/service';
import { UserProfile, UserRole } from '../types/user';
import { db } from './config';

/**
 * Admin-only Firebase operations
 * These functions should only be called by users with admin role
 */

// ============================================
// USER MANAGEMENT
// ============================================

export interface PaginatedUsers {
    users: UserProfile[];
    lastDoc: DocumentSnapshot | null;
    hasMore: boolean;
}

/**
 * Get all users with pagination
 */
export const getAllUsers = async (
    pageSize: number = 20,
    lastDocument?: DocumentSnapshot
): Promise<{ success: boolean; data?: PaginatedUsers; error?: string }> => {
    try {
        let q = query(
            collection(db, 'users'),
            orderBy('createdAt', 'desc'),
            limit(pageSize)
        );

        if (lastDocument) {
            q = query(q, startAfter(lastDocument));
        }

        const querySnapshot = await getDocs(q);
        const users: UserProfile[] = [];

        querySnapshot.forEach((doc) => {
            users.push(doc.data() as UserProfile);
        });

        const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
        const hasMore = querySnapshot.docs.length === pageSize;

        return {
            success: true,
            data: { users, lastDoc, hasMore },
        };
    } catch (error: any) {
        console.error('Get all users error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get users by role
 * Includes fallback for missing Firestore index
 */
export const getUsersByRole = async (
    role: UserRole
): Promise<{ success: boolean; users?: UserProfile[]; error?: string }> => {
    try {
        // Try optimized query with index
        const q = query(
            collection(db, 'users'),
            where('role', '==', role),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const users: UserProfile[] = [];

        querySnapshot.forEach((doc) => {
            users.push(doc.data() as UserProfile);
        });

        return { success: true, users };
    } catch (error: any) {
        // If index is missing, use fallback query without orderBy
        if (error.code === 'failed-precondition' || error.message?.includes('index')) {
            console.log('Index not available for getUsersByRole, using fallback query...');
            try {
                const fallbackQuery = query(
                    collection(db, 'users'),
                    where('role', '==', role)
                );
                const querySnapshot = await getDocs(fallbackQuery);
                let users: UserProfile[] = [];

                querySnapshot.forEach((doc) => {
                    users.push(doc.data() as UserProfile);
                });

                // Sort client-side
                users.sort((a, b) => {
                    const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
                    const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
                    return dateB.getTime() - dateA.getTime();
                });

                return { success: true, users };
            } catch (fallbackError: any) {
                console.error('Fallback query error:', fallbackError);
                return { success: false, error: fallbackError.message };
            }
        }

        console.error('Get users by role error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Update user role (admin only)
 */
export const updateUserRole = async (
    userId: string,
    newRole: UserRole
): Promise<{ success: boolean; error?: string }> => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            role: newRole,
            updatedAt: new Date(),
        });

        return { success: true };
    } catch (error: any) {
        console.error('Update user role error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Delete user account (admin only)
 */
export const deleteUser = async (
    userId: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        // Delete user document
        await deleteDoc(doc(db, 'users', userId));

        // Note: This only deletes the Firestore document
        // Firebase Auth user deletion requires admin SDK or Firebase Functions
        // For now, we'll just delete the profile

        return { success: true };
    } catch (error: any) {
        console.error('Delete user error:', error);
        return { success: false, error: error.message };
    }
};

// ============================================
// SERVICE MANAGEMENT
// ============================================

/**
 * Get all services including unapproved (admin only)
 */
export const getAllServices = async (
    statusFilter?: ServiceStatus
): Promise<{ success: boolean; services?: Service[]; error?: string }> => {
    try {
        let q;

        if (statusFilter) {
            q = query(
                collection(db, 'services'),
                where('status', '==', statusFilter),
                orderBy('createdAt', 'desc')
            );
        } else {
            q = query(
                collection(db, 'services'),
                orderBy('createdAt', 'desc')
            );
        }

        const querySnapshot = await getDocs(q);
        const services: Service[] = [];

        querySnapshot.forEach((doc) => {
            services.push({ id: doc.id, ...doc.data() } as Service);
        });

        return { success: true, services };
    } catch (error: any) {
        console.error('Get all services error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Approve service (admin only)
 */
export const approveService = async (
    serviceId: string,
    adminId: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        const serviceRef = doc(db, 'services', serviceId);
        await updateDoc(serviceRef, {
            status: 'approved',
            approvedBy: adminId,
            approvedAt: new Date(),
            updatedAt: new Date(),
        });

        return { success: true };
    } catch (error: any) {
        console.error('Approve service error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Reject service (admin only)
 */
export const rejectService = async (
    serviceId: string,
    reason: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        const serviceRef = doc(db, 'services', serviceId);
        await updateDoc(serviceRef, {
            status: 'rejected',
            rejectionReason: reason,
            updatedAt: new Date(),
        });

        return { success: true };
    } catch (error: any) {
        console.error('Reject service error:', error);
        return { success: false, error: error.message };
    }
};

// ============================================
// BOOKING MANAGEMENT
// ============================================

/**
 * Get all bookings system-wide (admin only)
 */
export const getAllBookings = async (
    statusFilter?: string
): Promise<{ success: boolean; bookings?: Booking[]; error?: string }> => {
    try {
        let q;

        if (statusFilter) {
            q = query(
                collection(db, 'bookings'),
                where('status', '==', statusFilter),
                orderBy('createdAt', 'desc')
            );
        } else {
            q = query(
                collection(db, 'bookings'),
                orderBy('createdAt', 'desc')
            );
        }

        const querySnapshot = await getDocs(q);
        const bookings: Booking[] = [];

        querySnapshot.forEach((doc) => {
            bookings.push({ id: doc.id, ...doc.data() } as Booking);
        });

        return { success: true, bookings };
    } catch (error: any) {
        console.error('Get all bookings error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Cancel any booking (admin only)
 */
export const cancelBooking = async (
    bookingId: string,
    reason: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        const bookingRef = doc(db, 'bookings', bookingId);
        await updateDoc(bookingRef, {
            status: 'cancelled',
            cancellationReason: reason,
            updatedAt: new Date(),
        });

        return { success: true };
    } catch (error: any) {
        console.error('Cancel booking error:', error);
        return { success: false, error: error.message };
    }
};

// ============================================
// ANALYTICS
// ============================================

export interface PlatformAnalytics {
    totalUsers: number;
    totalAdmins: number;
    totalProviders: number;
    totalRegularUsers: number;
    totalServices: number;
    approvedServices: number;
    pendingServices: number;
    rejectedServices: number;
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    completedBookings: number;
    cancelledBookings: number;
}

/**
 * Get platform analytics (admin only)
 */
export const getAnalytics = async (): Promise<{
    success: boolean;
    analytics?: PlatformAnalytics;
    error?: string;
}> => {
    try {
        // Get all users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        let totalAdmins = 0;
        let totalProviders = 0;
        let totalRegularUsers = 0;

        usersSnapshot.forEach((doc) => {
            const user = doc.data() as UserProfile;
            if (user.role === 'admin') totalAdmins++;
            else if (user.role === 'provider') totalProviders++;
            else totalRegularUsers++;
        });

        // Get all services
        const servicesSnapshot = await getDocs(collection(db, 'services'));
        let approvedServices = 0;
        let pendingServices = 0;
        let rejectedServices = 0;

        servicesSnapshot.forEach((doc) => {
            const service = doc.data() as Service;
            if (service.status === 'approved') approvedServices++;
            else if (service.status === 'pending') pendingServices++;
            else if (service.status === 'rejected') rejectedServices++;
        });

        // Get all bookings
        const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
        let pendingBookings = 0;
        let confirmedBookings = 0;
        let completedBookings = 0;
        let cancelledBookings = 0;

        bookingsSnapshot.forEach((doc) => {
            const booking = doc.data() as Booking;
            if (booking.status === 'pending') pendingBookings++;
            else if (booking.status === 'confirmed') confirmedBookings++;
            else if (booking.status === 'completed') completedBookings++;
            else if (booking.status === 'cancelled') cancelledBookings++;
        });

        const analytics: PlatformAnalytics = {
            totalUsers: usersSnapshot.size,
            totalAdmins,
            totalProviders,
            totalRegularUsers,
            totalServices: servicesSnapshot.size,
            approvedServices,
            pendingServices,
            rejectedServices,
            totalBookings: bookingsSnapshot.size,
            pendingBookings,
            confirmedBookings,
            completedBookings,
            cancelledBookings,
        };

        return { success: true, analytics };
    } catch (error: any) {
        console.error('Get analytics error:', error);
        return { success: false, error: error.message };
    }
};
