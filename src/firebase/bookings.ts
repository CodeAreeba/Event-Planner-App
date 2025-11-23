import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    Timestamp,
    updateDoc,
    where,
} from 'firebase/firestore';
import { db } from './config';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
    id?: string;
    userId: string;
    userName: string;
    providerId: string;
    providerName: string;
    serviceId: string;
    serviceName: string;
    date: Date;
    time: string;
    status: BookingStatus;
    price: number;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Create a new booking
 */
export const createBooking = async (
    bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<{ success: boolean; bookingId?: string; error?: string }> => {
    try {
        const bookingWithDefaults = {
            ...bookingData,
            status: 'pending' as BookingStatus,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        const docRef = await addDoc(collection(db, 'bookings'), bookingWithDefaults);
        return { success: true, bookingId: docRef.id };
    } catch (error: any) {
        console.error('Create booking error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Update booking status or details
 */
export const updateBooking = async (
    bookingId: string,
    updates: Partial<Booking>
): Promise<{ success: boolean; error?: string }> => {
    try {
        const bookingRef = doc(db, 'bookings', bookingId);
        await updateDoc(bookingRef, {
            ...updates,
            updatedAt: Timestamp.now(),
        });
        return { success: true };
    } catch (error: any) {
        console.error('Update booking error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Cancel a booking
 */
export const cancelBooking = async (
    bookingId: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        const bookingRef = doc(db, 'bookings', bookingId);
        await updateDoc(bookingRef, {
            status: 'cancelled',
            updatedAt: Timestamp.now(),
        });
        return { success: true };
    } catch (error: any) {
        console.error('Cancel booking error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Delete a booking (admin only)
 */
export const deleteBooking = async (
    bookingId: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        await deleteDoc(doc(db, 'bookings', bookingId));
        return { success: true };
    } catch (error: any) {
        console.error('Delete booking error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get a single booking by ID
 */
export const getBookingById = async (
    bookingId: string
): Promise<{ success: boolean; booking?: Booking; error?: string }> => {
    try {
        const docRef = doc(db, 'bookings', bookingId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const booking = { id: docSnap.id, ...docSnap.data() } as Booking;
            return { success: true, booking };
        } else {
            return { success: false, error: 'Booking not found' };
        }
    } catch (error: any) {
        console.error('Get booking error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get bookings for a user or provider
 * Includes fallback logic for index errors
 */
export const getBookings = async (filters?: {
    userId?: string;
    providerId?: string;
    status?: BookingStatus;
}): Promise<{ success: boolean; bookings?: Booking[]; error?: string }> => {
    try {
        let q;

        // Try the optimized query with orderBy first
        try {
            q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));

            if (filters?.userId) {
                q = query(q, where('userId', '==', filters.userId));
            }
            if (filters?.providerId) {
                q = query(q, where('providerId', '==', filters.providerId));
            }
            if (filters?.status) {
                q = query(q, where('status', '==', filters.status));
            }

            const querySnapshot = await getDocs(q);
            const bookings: Booking[] = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Booking[];

            return { success: true, bookings };
        } catch (indexError: any) {
            // If index error, fall back to simpler query without orderBy
            if (indexError.code === 'failed-precondition' || indexError.message?.includes('index')) {
                console.log('Index not available, using fallback query...');

                // Simpler query without orderBy
                let fallbackQuery = collection(db, 'bookings');
                const constraints: any[] = [];

                if (filters?.userId) {
                    constraints.push(where('userId', '==', filters.userId));
                }
                if (filters?.providerId) {
                    constraints.push(where('providerId', '==', filters.providerId));
                }
                if (filters?.status) {
                    constraints.push(where('status', '==', filters.status));
                }

                const q = constraints.length > 0
                    ? query(fallbackQuery, ...constraints)
                    : fallbackQuery;

                const querySnapshot = await getDocs(q);
                let bookings: Booking[] = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Booking[];

                // Sort client-side since we can't use orderBy
                bookings.sort((a, b) => {
                    const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
                    const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
                    return dateB.getTime() - dateA.getTime();
                });

                return { success: true, bookings };
            }
            throw indexError; // Re-throw if it's not an index error
        }
    } catch (error: any) {
        console.error('Get bookings error:', error);
        return { success: false, error: error.message, bookings: [] };
    }
};

/**
 * Get upcoming bookings for a user
 * Includes fallback logic for index errors
 */
export const getUpcomingBookings = async (
    userId: string
): Promise<{ success: boolean; bookings?: Booking[]; error?: string }> => {
    try {
        // Try optimized query first
        try {
            const q = query(
                collection(db, 'bookings'),
                where('userId', '==', userId),
                where('status', 'in', ['pending', 'confirmed']),
                orderBy('date', 'asc')
            );

            const querySnapshot = await getDocs(q);
            const bookings: Booking[] = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Booking[];

            // Filter for future dates
            const now = new Date();
            const upcomingBookings = bookings.filter(
                (booking) => new Date(booking.date) >= now
            );

            return { success: true, bookings: upcomingBookings };
        } catch (indexError: any) {
            // Fallback: simpler query without orderBy
            if (indexError.code === 'failed-precondition' || indexError.message?.includes('index')) {
                console.log('Index not available for upcoming bookings, using fallback...');

                const q = query(
                    collection(db, 'bookings'),
                    where('userId', '==', userId),
                    where('status', 'in', ['pending', 'confirmed'])
                );

                const querySnapshot = await getDocs(q);
                let bookings: Booking[] = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Booking[];

                // Filter for future dates and sort client-side
                const now = new Date();
                const upcomingBookings = bookings
                    .filter((booking) => new Date(booking.date) >= now)
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                return { success: true, bookings: upcomingBookings };
            }
            throw indexError;
        }
    } catch (error: any) {
        console.error('Get upcoming bookings error:', error);
        return { success: false, error: error.message, bookings: [] };
    }
};
