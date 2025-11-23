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

export interface Service {
    id?: string;
    providerId: string;
    providerName: string;
    name: string;
    category: string;
    description: string;
    price: number;
    rating?: number;
    reviewCount?: number;
    contact: string;
    location: string;
    availability: boolean;
    images: string[];
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Add a new service
 */
export const addService = async (
    serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ success: boolean; serviceId?: string; error?: string }> => {
    try {
        const serviceWithTimestamps = {
            ...serviceData,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        const docRef = await addDoc(collection(db, 'services'), serviceWithTimestamps);
        return { success: true, serviceId: docRef.id };
    } catch (error: any) {
        console.error('Add service error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Update an existing service
 */
export const updateService = async (
    serviceId: string,
    updates: Partial<Service>
): Promise<{ success: boolean; error?: string }> => {
    try {
        const serviceRef = doc(db, 'services', serviceId);
        await updateDoc(serviceRef, {
            ...updates,
            updatedAt: Timestamp.now(),
        });
        return { success: true };
    } catch (error: any) {
        console.error('Update service error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Delete a service
 */
export const deleteService = async (
    serviceId: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        await deleteDoc(doc(db, 'services', serviceId));
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
            const service = { id: docSnap.id, ...docSnap.data() } as Service;
            return { success: true, service };
        } else {
            return { success: false, error: 'Service not found' };
        }
    } catch (error: any) {
        console.error('Get service error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get all services or filter by category/provider
 */
export const getServices = async (filters?: {
    category?: string;
    providerId?: string;
    availability?: boolean;
}): Promise<{ success: boolean; services?: Service[]; error?: string }> => {
    try {
        let q = query(collection(db, 'services'), orderBy('createdAt', 'desc'));

        if (filters?.category) {
            q = query(q, where('category', '==', filters.category));
        }
        if (filters?.providerId) {
            q = query(q, where('providerId', '==', filters.providerId));
        }
        if (filters?.availability !== undefined) {
            q = query(q, where('availability', '==', filters.availability));
        }

        const querySnapshot = await getDocs(q);
        const services: Service[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Service[];

        return { success: true, services };
    } catch (error: any) {
        console.error('Get services error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Search services by name or description
 */
export const searchServices = async (
    searchTerm: string
): Promise<{ success: boolean; services?: Service[]; error?: string }> => {
    try {
        const querySnapshot = await getDocs(collection(db, 'services'));
        const allServices: Service[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Service[];

        // Client-side filtering (Firestore doesn't support full-text search natively)
        const filteredServices = allServices.filter(
            (service) =>
                service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                service.category.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return { success: true, services: filteredServices };
    } catch (error: any) {
        console.error('Search services error:', error);
        return { success: false, error: error.message };
    }
};
