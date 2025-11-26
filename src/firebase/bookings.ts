import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
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
        console.log('\n💾 Saving booking to Firestore...');

        // Convert date to Firestore Timestamp if it's a Date object
        const dateToSave = bookingData.date instanceof Date 
            ? Timestamp.fromDate(bookingData.date)
            : bookingData.date;

        const bookingWithDefaults = {
            ...bookingData,
            date: dateToSave,
            status: 'pending' as BookingStatus,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        console.log('📊 Complete Booking Document:');
        console.log('  userId:', bookingWithDefaults.userId);
        console.log('  providerId:', bookingWithDefaults.providerId);
        console.log('  serviceId:', bookingWithDefaults.serviceId);
        console.log('  date:', bookingData.date);
        console.log('  status:', bookingWithDefaults.status);
        console.log('  price:', bookingWithDefaults.price);

        // Validation warnings
        if (!bookingWithDefaults.providerId || bookingWithDefaults.providerId === 'unknown') {
            console.warn('⚠️ WARNING: Booking has no valid provider ID!');
        }
        if (!bookingWithDefaults.userId) {
            console.warn('⚠️ WARNING: Booking has no user ID!');
        }

        const docRef = await addDoc(collection(db, 'bookings'), bookingWithDefaults);

        console.log('✅ Booking saved to Firestore');
        console.log('  Document ID:', docRef.id);
        console.log('  Collection: bookings');
        console.log('  Provider can query with: { providerId:', bookingWithDefaults.providerId, '}');

        return { success: true, bookingId: docRef.id };
    } catch (error: any) {
        console.error('❌ Create booking error:', error);
        console.error('  Error message:', error.message);
        console.error('  Error code:', error.code);
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
 * Accept a booking (Provider action)
 */
export const acceptBooking = async (
    bookingId: string,
    providerId: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        // Get booking to verify provider owns it
        const bookingRef = doc(db, 'bookings', bookingId);
        const bookingSnap = await getDoc(bookingRef);

        if (!bookingSnap.exists()) {
            return { success: false, error: 'Booking not found' };
        }

        const booking = bookingSnap.data();

        // Verify provider owns this booking
        if (booking.providerId !== providerId) {
            return { success: false, error: 'Unauthorized: You can only accept your own bookings' };
        }

        // Verify booking is in pending status
        if (booking.status !== 'pending') {
            return { success: false, error: `Cannot accept booking with status: ${booking.status}` };
        }

        // Update booking to accepted
        await updateDoc(bookingRef, {
            status: 'accepted',
            acceptedAt: Timestamp.now(),
            acceptedBy: providerId,
            updatedAt: Timestamp.now(),
        });

        return { success: true };
    } catch (error: any) {
        console.error('Accept booking error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Reject a booking (Provider action)
 */
export const rejectBooking = async (
    bookingId: string,
    providerId: string,
    reason?: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        // Get booking to verify provider owns it
        const bookingRef = doc(db, 'bookings', bookingId);
        const bookingSnap = await getDoc(bookingRef);

        if (!bookingSnap.exists()) {
            return { success: false, error: 'Booking not found' };
        }

        const booking = bookingSnap.data();

        // Verify provider owns this booking
        if (booking.providerId !== providerId) {
            return { success: false, error: 'Unauthorized: You can only reject your own bookings' };
        }

        // Verify booking is in pending status
        if (booking.status !== 'pending') {
            return { success: false, error: `Cannot reject booking with status: ${booking.status}` };
        }

        // Update booking to rejected
        await updateDoc(bookingRef, {
            status: 'rejected',
            rejectedAt: Timestamp.now(),
            rejectedBy: providerId,
            rejectionReason: reason || 'No reason provided',
            updatedAt: Timestamp.now(),
        });

        return { success: true };
    } catch (error: any) {
        console.error('Reject booking error:', error);
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
            const data = docSnap.data();
            const booking: Booking = {
                id: docSnap.id,
                ...data,
                date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
            } as Booking;
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
 */
export const getBookings = async (filters?: {
    userId?: string;
    providerId?: string;
    status?: BookingStatus;
}): Promise<{ success: boolean; bookings?: Booking[]; error?: string }> => {
    try {
        // Try optimized query with orderBy first
        let q = query(collection(db, 'bookings'), orderBy('date', 'asc'));

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
    } catch (error: any) {
        // If index is missing, use fallback query without orderBy
        if (error.code === 'failed-precondition' || error.message?.includes('index')) {
            console.log('⚠️ Firestore index not available, using fallback query without orderBy...');

            try {
                // Build query without orderBy
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

                const fallbackQ = constraints.length > 0
                    ? query(collection(db, 'bookings'), ...constraints)
                    : collection(db, 'bookings');

                const querySnapshot = await getDocs(fallbackQ);
                let bookings: Booking[] = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Booking[];

                // Sort client-side since we can't use orderBy
                bookings.sort((a, b) => {
                    const dateA = a.date instanceof Date ? a.date : new Date(a.date);
                    const dateB = b.date instanceof Date ? b.date : new Date(b.date);
                    return dateA.getTime() - dateB.getTime();
                });

                console.log('✅ Fallback query successful, sorted', bookings.length, 'bookings client-side');
                return { success: true, bookings };
            } catch (fallbackError: any) {
                console.error('❌ Fallback query error:', fallbackError);
                return { success: false, error: fallbackError.message, bookings: [] };
            }
        }

        console.error('Get bookings error:', error);
        return { success: false, error: error.message, bookings: [] };
    }
};

/**
 * Subscribe to bookings with real-time updates
 * Returns an unsubscribe function
 */
export const subscribeToBookings = (
    callback: (bookings: Booking[]) => void,
    filters?: {
        userId?: string;
        providerId?: string;
        status?: BookingStatus;
    }
): (() => void) => {
    try {
        // Try the optimized query with orderBy first
        let q = query(collection(db, 'bookings'), orderBy('date', 'asc'));

        if (filters?.userId) {
            q = query(q, where('userId', '==', filters.userId));
        }
        if (filters?.providerId) {
            q = query(q, where('providerId', '==', filters.providerId));
        }
        if (filters?.status) {
            q = query(q, where('status', '==', filters.status));
        }

        const unsubscribe = onSnapshot(
            q,
            (querySnapshot) => {
                const bookings: Booking[] = querySnapshot.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
                        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
                        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
                    } as Booking;
                });
                callback(bookings);
            },
            (error: any) => {
                // If index error, fall back to simpler query without orderBy
                if (error.code === 'failed-precondition' || error.message?.includes('index')) {
                    console.log('Index not available for subscription, using fallback query...');

                    // Simpler query without orderBy
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

                    const fallbackQ = constraints.length > 0
                        ? query(collection(db, 'bookings'), ...constraints)
                        : collection(db, 'bookings');

                    // Subscribe with fallback query
                    try {
                        return onSnapshot(
                            fallbackQ,
                            (querySnapshot) => {
                                let bookings: Booking[] = querySnapshot.docs.map((doc) => {
                                    const data = doc.data();
                                    return {
                                        id: doc.id,
                                        ...data,
                                        date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
                                        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
                                        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
                                    } as Booking;
                                });

                                // Sort client-side since we can't use orderBy
                                bookings.sort((a, b) => {
                                    const dateA = a.date instanceof Date ? a.date : new Date(a.date);
                                    const dateB = b.date instanceof Date ? b.date : new Date(b.date);
                                    return dateA.getTime() - dateB.getTime();
                                });

                                callback(bookings);
                            },
                            (fallbackError) => {
                                console.error('Fallback subscription error:', fallbackError);
                                // Return empty array on permission errors instead of breaking
                                callback([]);
                            }
                        );
                    } catch (fallbackSetupError: any) {
                        console.error('Error setting up fallback subscription:', fallbackSetupError);
                        callback([]);
                        return () => { }; // Return empty unsubscribe
                    }
                } else if (error.code === 'permission-denied' || error.message?.includes('permission')) {
                    // Handle permission errors gracefully
                    console.log('⚠️ Permission denied for bookings subscription. Returning empty results.');
                    callback([]);
                } else {
                    console.error('Subscription error:', error);
                    callback([]);
                }
            }
        );

        return unsubscribe;
    } catch (error: any) {
        console.error('Subscribe to bookings error:', error);
        return () => { }; // Return empty unsubscribe function
    }
};

/**
 * Update booking status based on date for a specific user
 * Automatically sets past bookings:
 * - 'pending' bookings (not confirmed) → 'cancelled'
 * - 'confirmed' bookings → 'completed'
 * @param userId - The ID of the current user (can be customer or provider)
 */
export const updatePastBookingsForUser = async (userId: string): Promise<{ success: boolean; updated: number }> => {
    try {
        const now = new Date();
        
        // Get bookings where user is either the customer or provider
        const userBookingsQuery = query(
            collection(db, 'bookings'),
            where('status', 'in', ['pending', 'confirmed'])
        );

        const querySnapshot = await getDocs(userBookingsQuery);
        let updated = 0;

        const updatePromises = querySnapshot.docs
            .filter(docSnapshot => {
                const data = docSnapshot.data();
                // Only process bookings where current user is involved
                return data.userId === userId || data.providerId === userId;
            })
            .map(async (docSnapshot) => {
                const data = docSnapshot.data();
                const bookingDate = data.date?.toDate ? data.date.toDate() : new Date(data.date);

                if (bookingDate < now) {
                    try {
                        // Pending bookings (never confirmed) become cancelled
                        // Confirmed bookings become completed
                        const newStatus = data.status === 'pending' ? 'cancelled' : 'completed';
                        
                        await updateDoc(doc(db, 'bookings', docSnapshot.id), {
                            status: newStatus,
                            updatedAt: Timestamp.now(),
                        });
                        updated++;
                    } catch (updateError) {
                        // Skip bookings that can't be updated due to permissions
                        console.log('Could not update booking:', docSnapshot.id);
                    }
                }
            });

        await Promise.all(updatePromises);
        return { success: true, updated };
    } catch (error: any) {
        console.error('Update past bookings error:', error);
        return { success: false, updated: 0 };
    }
};

/**
 * @deprecated Use updatePastBookingsForUser instead
 * Update booking status based on date (Admin only - requires permission to update all bookings)
 * Automatically sets past bookings to 'completed'
 */
export const updatePastBookingsStatus = async (): Promise<{ success: boolean; updated: number }> => {
    try {
        const now = new Date();
        const q = query(
            collection(db, 'bookings'),
            where('status', 'in', ['pending', 'accepted'])
        );

        const querySnapshot = await getDocs(q);
        let updated = 0;

        const updatePromises = querySnapshot.docs.map(async (docSnapshot) => {
            const data = docSnapshot.data();
            const bookingDate = data.date?.toDate ? data.date.toDate() : new Date(data.date);

            if (bookingDate < now) {
                await updateDoc(doc(db, 'bookings', docSnapshot.id), {
                    status: 'completed',
                    updatedAt: Timestamp.now(),
                });
                updated++;
            }
        });

        await Promise.all(updatePromises);
        return { success: true, updated };
    } catch (error: any) {
        console.error('Update past bookings error:', error);
        return { success: false, updated: 0 };
    }
};
