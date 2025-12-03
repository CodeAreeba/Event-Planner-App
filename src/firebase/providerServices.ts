/**
 * Firebase operations for Provider Service Slots
 * Handles creation, retrieval, and updates of auto-generated time slots
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    runTransaction,
    setDoc,
    Timestamp,
    updateDoc,
    where,
} from 'firebase/firestore';
import { ProviderService, SlotGenerationConfig, TimeSlot } from '../types/providerService';
import {
    formatDateToString,
    generateSlotsForDays,
    getDefaultWorkingHours,
} from '../utils/slotGenerator';
import { db } from './config';

const PROVIDER_SERVICES_COLLECTION = 'providerServices';

/**
 * Create provider service slots for the next N days
 * @param config - Slot generation configuration
 * @returns Success status and error message if any
 */
export const createProviderServiceSlots = async (
    config: SlotGenerationConfig
): Promise<{ success: boolean; error?: string; createdCount?: number }> => {
    try {
        const {
            serviceId,
            providerId,
            serviceName,
            serviceDuration,
            workingHours = getDefaultWorkingHours(),
            numberOfDays = 30,
            bufferMinutes = 15,
        } = config;

        // Validate inputs
        if (!serviceId || !providerId || !serviceName) {
            return { success: false, error: 'Missing required fields' };
        }

        if (serviceDuration <= 0) {
            return { success: false, error: 'Service duration must be greater than 0' };
        }

        // Generate slots for the specified number of days
        const slotsMap = generateSlotsForDays(
            workingHours,
            serviceDuration,
            numberOfDays,
            bufferMinutes
        );

        // Save each day's slots to Firestore
        const batch: Promise<void>[] = [];
        let createdCount = 0;

        slotsMap.forEach((slots, dateStr) => {
            const docId = `${serviceId}_${dateStr}`;
            const providerServiceData: Omit<ProviderService, 'id'> = {
                serviceId,
                providerId,
                serviceName,
                date: dateStr,
                serviceDuration,
                workingHours,
                slots,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const docRef = doc(db, PROVIDER_SERVICES_COLLECTION, docId);
            batch.push(
                setDoc(docRef, {
                    ...providerServiceData,
                    createdAt: Timestamp.fromDate(providerServiceData.createdAt),
                    updatedAt: Timestamp.fromDate(providerServiceData.updatedAt),
                })
            );
            createdCount++;
        });

        await Promise.all(batch);

        console.log(`✅ Created ${createdCount} provider service slot documents`);
        return { success: true, createdCount };
    } catch (error: any) {
        console.error('❌ Error creating provider service slots:', error);
        return { success: false, error: error.message || 'Failed to create slots' };
    }
};

/**
 * Get service slots for a specific date
 * @param serviceId - Service ID
 * @param date - Date object or date string (YYYY-MM-DD)
 * @returns Provider service with slots
 */
export const getServiceSlotsForDate = async (
    serviceId: string,
    date: Date | string
): Promise<{ success: boolean; providerService?: ProviderService; error?: string }> => {
    try {
        const dateStr = typeof date === 'string' ? date : formatDateToString(date);
        const docId = `${serviceId}_${dateStr}`;

        const docRef = doc(db, PROVIDER_SERVICES_COLLECTION, docId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return { success: false, error: 'No slots found for this date' };
        }

        const data = docSnap.data();
        const providerService: ProviderService = {
            id: docSnap.id,
            serviceId: data.serviceId,
            providerId: data.providerId,
            serviceName: data.serviceName,
            date: data.date,
            serviceDuration: data.serviceDuration,
            workingHours: data.workingHours,
            slots: data.slots,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
        };

        return { success: true, providerService };
    } catch (error: any) {
        console.error('❌ Error getting service slots:', error);
        return { success: false, error: error.message || 'Failed to get slots' };
    }
};

/**
 * Get only available slots for a specific date
 * @param serviceId - Service ID
 * @param date - Date object or date string
 * @returns Array of available time slots
 */
export const getAvailableSlots = async (
    serviceId: string,
    date: Date | string
): Promise<{ success: boolean; slots?: TimeSlot[]; error?: string }> => {
    try {
        const { success, providerService, error } = await getServiceSlotsForDate(serviceId, date);

        if (!success || !providerService) {
            return { success: false, error };
        }

        const availableSlots = providerService.slots.filter((slot) => slot.available);

        return { success: true, slots: availableSlots };
    } catch (error: any) {
        console.error('❌ Error getting available slots:', error);
        return { success: false, error: error.message || 'Failed to get available slots' };
    }
};

/**
 * Update slot availability (mark as booked or available)
 * @param serviceId - Service ID
 * @param date - Date object or date string
 * @param slotTime - Time slot to update (e.g., "9:00 AM")
 * @param available - New availability status
 * @returns Success status
 */
export const updateSlotAvailability = async (
    serviceId: string,
    date: Date | string,
    slotTime: string,
    available: boolean
): Promise<{ success: boolean; error?: string }> => {
    try {
        const dateStr = typeof date === 'string' ? date : formatDateToString(date);
        const docId = `${serviceId}_${dateStr}`;

        const docRef = doc(db, PROVIDER_SERVICES_COLLECTION, docId);

        // Use transaction to ensure atomic update
        await runTransaction(db, async (transaction) => {
            const docSnap = await transaction.get(docRef);

            if (!docSnap.exists()) {
                throw new Error('Provider service document not found');
            }

            const data = docSnap.data();
            const slots: TimeSlot[] = data.slots || [];

            // Find and update the specific slot
            const slotIndex = slots.findIndex((slot) => slot.time === slotTime);

            if (slotIndex === -1) {
                throw new Error(`Slot ${slotTime} not found`);
            }

            // Check if slot is already in the desired state
            if (slots[slotIndex].available === available) {
                console.warn(`⚠️ Slot ${slotTime} is already ${available ? 'available' : 'unavailable'}`);
                return;
            }

            // Update the slot
            slots[slotIndex].available = available;

            transaction.update(docRef, {
                slots,
                updatedAt: Timestamp.now(),
            });
        });

        console.log(`✅ Updated slot ${slotTime} to ${available ? 'available' : 'unavailable'}`);
        return { success: true };
    } catch (error: any) {
        console.error('❌ Error updating slot availability:', error);
        return { success: false, error: error.message || 'Failed to update slot' };
    }
};

/**
 * Get all provider services for a service ID (all dates)
 * @param serviceId - Service ID
 * @returns Array of provider services
 */
export const getAllServiceSlots = async (
    serviceId: string
): Promise<{ success: boolean; providerServices?: ProviderService[]; error?: string }> => {
    try {
        const q = query(
            collection(db, PROVIDER_SERVICES_COLLECTION),
            where('serviceId', '==', serviceId)
        );

        const querySnapshot = await getDocs(q);
        const providerServices: ProviderService[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            providerServices.push({
                id: doc.id,
                serviceId: data.serviceId,
                providerId: data.providerId,
                serviceName: data.serviceName,
                date: data.date,
                serviceDuration: data.serviceDuration,
                workingHours: data.workingHours,
                slots: data.slots,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            });
        });

        return { success: true, providerServices };
    } catch (error: any) {
        console.error('❌ Error getting all service slots:', error);
        return { success: false, error: error.message || 'Failed to get service slots' };
    }
};

/**
 * Delete all slots for a service (when service is deleted)
 * @param serviceId - Service ID
 * @returns Success status
 */
export const deleteServiceSlots = async (
    serviceId: string
): Promise<{ success: boolean; error?: string; deletedCount?: number }> => {
    try {
        const { success, providerServices, error } = await getAllServiceSlots(serviceId);

        if (!success || !providerServices) {
            return { success: false, error };
        }

        const batch: Promise<void>[] = [];

        providerServices.forEach((ps) => {
            if (ps.id) {
                const docRef = doc(db, PROVIDER_SERVICES_COLLECTION, ps.id);
                batch.push(updateDoc(docRef, { slots: [] }));
            }
        });

        await Promise.all(batch);

        console.log(`✅ Deleted slots for ${providerServices.length} documents`);
        return { success: true, deletedCount: providerServices.length };
    } catch (error: any) {
        console.error('❌ Error deleting service slots:', error);
        return { success: false, error: error.message || 'Failed to delete slots' };
    }
};
