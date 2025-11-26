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
import { Service } from '../types/service';
import { db } from './config';

/**
 * Normalize service data for backward compatibility
 * Provides default values for new required fields that may not exist in older services
 */
const normalizeService = (data: any, docId: string): Service => {
    return {
        id: docId,
        ...data,
        // Ensure new required fields have default values
        category: data.category || 'event-planners',
        providerId: data.providerId || data.createdBy || 'unknown',
        providerName: data.providerName || 'Unknown Provider',
        status: data.status || 'approved', // Assume old services are approved
        images: data.images || [],
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
    } as Service;
};

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

        const services: Service[] = querySnapshot.docs.map((doc) =>
            normalizeService(doc.data(), doc.id)
        );

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

                let services: Service[] = querySnapshot.docs.map((doc) =>
                    normalizeService(doc.data(), doc.id)
                );

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
                const services: Service[] = querySnapshot.docs.map((doc) =>
                    normalizeService(doc.data(), doc.id)
                );
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
                            let services: Service[] = querySnapshot.docs.map((doc) =>
                                normalizeService(doc.data(), doc.id)
                            );

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
        return () => { }; // Return empty unsubscribe function
    }
};

/**
 * Create a new service
 */
export const createService = async (
    serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>,
    userId?: string,
    userName?: string
): Promise<{ success: boolean; serviceId?: string; error?: string }> => {
    try {
        // Validation
        if (!serviceData.title || serviceData.title.trim().length < 3) {
            return { success: false, error: 'Title must be at least 3 characters' };
        }
        if (!serviceData.description || serviceData.description.trim().length < 10) {
            return { success: false, error: 'Description must be at least 10 characters' };
        }
        if (serviceData.price <= 0) {
            return { success: false, error: 'Price must be greater than 0' };
        }
        if (serviceData.duration <= 0) {
            return { success: false, error: 'Duration must be greater than 0' };
        }
        if (!serviceData.category) {
            return { success: false, error: 'Category is required' };
        }
        if (!userId) {
            return { success: false, error: 'User ID is required' };
        }

        const newService = {
            ...serviceData,
            title: serviceData.title.trim(),
            name: serviceData.title.trim(), // For backward compatibility
            description: serviceData.description.trim(),
            providerId: userId,
            providerName: userName || 'Unknown Provider',
            status: 'pending' as const, // All new services start as pending
            isActive: true, // Active by default
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            createdBy: userId,
        };

        const docRef = await addDoc(collection(db, 'services'), newService);
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
    updates: Partial<Omit<Service, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<{ success: boolean; error?: string }> => {
    try {
        // Validation
        if (updates.title !== undefined && updates.title.trim().length < 3) {
            return { success: false, error: 'Title must be at least 3 characters' };
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
        if (updates.title) {
            updateData.title = updates.title.trim();
            updateData.name = updates.title.trim();
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
 * Toggle service active status
 */
export const toggleServiceStatus = async (
    serviceId: string,
    isActive: boolean
): Promise<{ success: boolean; error?: string }> => {
    try {
        const serviceRef = doc(db, 'services', serviceId);
        await updateDoc(serviceRef, {
            isActive,
            updatedAt: Timestamp.now(),
        });
        return { success: true };
    } catch (error: any) {
        console.error('Toggle service status error:', error);
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
            const service = normalizeService(docSnap.data(), docSnap.id);
            return { success: true, service };
        } else {
            return { success: false, error: 'Service not found' };
        }
    } catch (error: any) {
        console.error('Get service error:', error);
        return { success: false, error: error.message };
    }
};
