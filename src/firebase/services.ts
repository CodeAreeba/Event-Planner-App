import {
    addDoc,
    collection,
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

export interface Service {
    id?: string;
    title: string;  // Service title (using 'title' as per requirements)
    name?: string;   // Alias for title (backward compatibility) - auto-generated from title
    description: string;
    price: number;
    duration: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;  // User ID of creator (for tracking)
}

/**
 * Get all services (Admin only)
 */
export const getAllServices = async (): Promise<{ success: boolean; services?: Service[]; error?: string }> => {
    try {
        const q = query(collection(db, 'services'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const services: Service[] = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
            } as Service;
        });

        return { success: true, services };
    } catch (error: any) {
        console.error('Get all services error:', error);
        return { success: true, services: [] };
    }
};

/**
 * Get active services only (Users)
 * Includes fallback for missing Firestore index
 */
export const getActiveServices = async (): Promise<{ success: boolean; services?: Service[]; error?: string }> => {
    try {
        // Try optimized query with index
        const q = query(
            collection(db, 'services'),
            where('isActive', '==', true),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);

        const services: Service[] = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
            } as Service;
        });

        return { success: true, services };
    } catch (error: any) {
        // If index is missing, use fallback query without orderBy
        if (error.code === 'failed-precondition' || error.message?.includes('index')) {
            console.log('Index not available, using fallback query for active services...');
            try {
                const fallbackQuery = query(
                    collection(db, 'services'),
                    where('isActive', '==', true)
                );
                const querySnapshot = await getDocs(fallbackQuery);

                let services: Service[] = querySnapshot.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
                        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
                    } as Service;
                });

                // Sort client-side
                services.sort((a, b) => {
                    const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
                    const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
                    return dateB.getTime() - dateA.getTime();
                });

                return { success: true, services };
            } catch (fallbackError: any) {
                console.error('Fallback query error:', fallbackError);
                return { success: true, services: [] };
            }
        }

        console.error('Get active services error:', error);
        return { success: true, services: [] };
    }
};

/**
 * Subscribe to services with real-time updates
 * Includes fallback for missing Firestore index
 */
export const subscribeToServices = (
    callback: (services: Service[]) => void,
    activeOnly: boolean = false
): (() => void) => {
    let unsubscribeRef: (() => void) | null = null;

    try {
        // Try optimized query with index
        let q = query(collection(db, 'services'), orderBy('createdAt', 'desc'));

        if (activeOnly) {
            q = query(
                collection(db, 'services'),
                where('isActive', '==', true),
                orderBy('createdAt', 'desc')
            );
        }

        unsubscribeRef = onSnapshot(
            q,
            (querySnapshot) => {
                const services: Service[] = querySnapshot.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
                        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
                    } as Service;
                });
                callback(services);
            },
            (error) => {
                // If index error, use fallback query without orderBy
                if (error.code === 'failed-precondition' || error.message?.includes('index')) {
                    console.log('Index not available for subscription, using fallback query...');

                    // Unsubscribe from failed query
                    if (unsubscribeRef) {
                        unsubscribeRef();
                    }

                    let fallbackQuery = query(collection(db, 'services'));
                    if (activeOnly) {
                        fallbackQuery = query(collection(db, 'services'), where('isActive', '==', true));
                    }

                    unsubscribeRef = onSnapshot(
                        fallbackQuery,
                        (querySnapshot) => {
                            let services: Service[] = querySnapshot.docs.map((doc) => {
                                const data = doc.data();
                                return {
                                    id: doc.id,
                                    ...data,
                                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
                                    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
                                } as Service;
                            });

                            // Sort client-side
                            services.sort((a, b) => {
                                const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
                                const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
                                return dateB.getTime() - dateA.getTime();
                            });

                            callback(services);
                        },
                        (fallbackError) => {
                            console.error('Fallback subscription error:', fallbackError);
                            callback([]);
                        }
                    );
                } else {
                    console.error('Services subscription error:', error);
                    callback([]);
                }
            }
        );

        return () => {
            if (unsubscribeRef) {
                unsubscribeRef();
            }
        };
    } catch (error: any) {
        console.error('Subscribe to services error:', error);
        return () => { };
    }
};

/**
 * Create a new service
 */
export const createService = async (
    serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt' | 'isActive' | 'createdBy'>
): Promise<{ success: boolean; serviceId?: string; error?: string }> => {
    try {
        // Validation
        const title = serviceData.title || serviceData.name;
        if (!title || title.trim().length < 3) {
            return { success: false, error: 'Service title must be at least 3 characters' };
        }
        if (!serviceData.description || serviceData.description.trim().length < 10) {
            return { success: false, error: 'Description must be at least 10 characters' };
        }
        if (!serviceData.price || serviceData.price <= 0) {
            return { success: false, error: 'Price must be greater than 0' };
        }
        if (!serviceData.duration || serviceData.duration <= 0) {
            return { success: false, error: 'Duration must be greater than 0' };
        }

        const serviceWithDefaults = {
            ...serviceData,
            title: title.trim(),
            name: title.trim(), // Keep name in sync with title for backward compatibility
            isActive: true,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        const docRef = await addDoc(collection(db, 'services'), serviceWithDefaults);
        return { success: true, serviceId: docRef.id };
    } catch (error: any) {
        console.error('Create service error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Update an existing service
 */
export const updateService = async (
    serviceId: string,
    updates: Partial<Omit<Service, 'id' | 'createdAt' | 'updatedAt' | 'isActive' | 'createdBy'>>
): Promise<{ success: boolean; error?: string }> => {
    try {
        // Validation
        const title = updates.title || updates.name;
        if (title && title.trim().length < 3) {
            return { success: false, error: 'Service title must be at least 3 characters' };
        }
        if (updates.description && updates.description.trim().length < 10) {
            return { success: false, error: 'Description must be at least 10 characters' };
        }
        if (updates.price !== undefined && updates.price <= 0) {
            return { success: false, error: 'Price must be greater than 0' };
        }
        if (updates.duration !== undefined && updates.duration <= 0) {
            return { success: false, error: 'Duration must be greater than 0' };
        }

        const updateData: any = { ...updates };

        // If title is being updated, also update name for backward compatibility
        if (title) {
            updateData.title = title.trim();
            updateData.name = title.trim();
        }

        updateData.updatedAt = Timestamp.now();

        const serviceRef = doc(db, 'services', serviceId);
        await updateDoc(serviceRef, updateData);
        return { success: true };
    } catch (error: any) {
        console.error('Update service error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Soft delete a service (sets isActive to false)
 */
export const deleteService = async (
    serviceId: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        const serviceRef = doc(db, 'services', serviceId);
        await updateDoc(serviceRef, {
            isActive: false,
            updatedAt: Timestamp.now(),
        });
        return { success: true };
    } catch (error: any) {
        console.error('Delete service error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get a single service by ID
 */
export const getServiceById = async (
    serviceId: string
): Promise<{ success: boolean; service?: Service; error?: string }> => {
    try {
        const docRef = doc(db, 'services', serviceId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const service: Service = {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
            } as Service;
            return { success: true, service };
        } else {
            return { success: false, error: 'Service not found' };
        }
    } catch (error: any) {
        console.error('Get service error:', error);
        return { success: false, error: error.message };
    }
};
