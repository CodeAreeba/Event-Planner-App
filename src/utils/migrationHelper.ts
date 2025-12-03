/**
 * Migration Script: Generate Slots for Existing Services
 * 
 * This script generates time slots for all existing services in the database.
 * Run this once to migrate existing services to the new slot-based booking system.
 * 
 * Usage:
 * 1. Import this function in your app
 * 2. Call it from an admin screen or run it manually
 * 3. It will process all services and generate 30 days of slots
 */

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { createProviderServiceSlots } from '../firebase/providerServices';
import { Service } from '../types/service';
import { getDefaultWorkingHours } from '../utils/slotGenerator';

interface MigrationResult {
    success: boolean;
    totalServices: number;
    successfulMigrations: number;
    failedMigrations: number;
    errors: Array<{ serviceId: string; error: string }>;
}

/**
 * Generate slots for all existing services
 * @param onProgress - Optional callback to track progress
 * @returns Migration result with statistics
 */
export const migrateExistingServices = async (
    onProgress?: (current: number, total: number, serviceName: string) => void
): Promise<MigrationResult> => {
    console.log('🔄 Starting migration: Generating slots for existing services...');

    const result: MigrationResult = {
        success: true,
        totalServices: 0,
        successfulMigrations: 0,
        failedMigrations: 0,
        errors: [],
    };

    try {
        // Fetch all active services from Firestore
        console.log('📖 Fetching all services from database...');
        const servicesRef = collection(db, 'services');
        const servicesSnapshot = await getDocs(servicesRef);

        const services: Service[] = [];
        servicesSnapshot.forEach((doc) => {
            const data = doc.data();
            services.push({
                id: doc.id,
                title: data.title || data.name || 'Untitled Service',
                name: data.name || data.title,
                description: data.description || '',
                price: data.price || 0,
                duration: data.duration || 60, // Default to 60 minutes if not set
                category: data.category || 'other',
                images: data.images || [],
                providerId: data.providerId || data.createdBy || '',
                providerName: data.providerName || 'Unknown Provider',
                status: data.status || 'approved',
                isActive: data.isActive !== false,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
                createdBy: data.createdBy || data.providerId,
            } as Service);
        });

        result.totalServices = services.length;
        console.log(`✅ Found ${services.length} services to migrate`);

        if (services.length === 0) {
            console.log('ℹ️ No services found. Migration complete.');
            return result;
        }

        // Process each service
        for (let i = 0; i < services.length; i++) {
            const service = services[i];
            const current = i + 1;

            console.log(`\n📦 [${current}/${services.length}] Processing: ${service.title}`);
            console.log(`   Service ID: ${service.id}`);
            console.log(`   Provider ID: ${service.providerId}`);
            console.log(`   Duration: ${service.duration} minutes`);

            // Call progress callback if provided
            if (onProgress) {
                onProgress(current, services.length, service.title);
            }

            // Skip services without providerId
            if (!service.providerId || service.providerId.trim() === '') {
                result.failedMigrations++;
                result.errors.push({
                    serviceId: service.id || 'unknown',
                    error: 'Missing providerId - skipping service',
                });
                console.warn(`   ⚠️ Skipped: No provider ID found`);
                continue;
            }

            // Skip services with invalid duration
            if (!service.duration || service.duration <= 0 || service.duration > 1440) {
                result.failedMigrations++;
                result.errors.push({
                    serviceId: service.id || 'unknown',
                    error: `Invalid duration: ${service.duration} minutes`,
                });
                console.warn(`   ⚠️ Skipped: Invalid duration`);
                continue;
            }

            try {
                // Generate slots for this service
                const slotResult = await createProviderServiceSlots({
                    serviceId: service.id || '',
                    providerId: service.providerId,
                    serviceName: service.title,
                    serviceDuration: service.duration,
                    workingHours: getDefaultWorkingHours(),
                    numberOfDays: 30,
                    bufferMinutes: 15,
                });

                if (slotResult.success) {
                    result.successfulMigrations++;
                    console.log(`   ✅ Generated ${slotResult.createdCount} days of slots`);
                } else {
                    result.failedMigrations++;
                    result.errors.push({
                        serviceId: service.id || 'unknown',
                        error: slotResult.error || 'Unknown error',
                    });
                    console.error(`   ❌ Failed: ${slotResult.error}`);
                }
            } catch (error: any) {
                result.failedMigrations++;
                result.errors.push({
                    serviceId: service.id || 'unknown',
                    error: error.message || 'Unknown error',
                });
                console.error(`   ❌ Error: ${error.message}`);
            }

            // Add a small delay to avoid overwhelming Firestore
            if (i < services.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        // Final summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 MIGRATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total Services: ${result.totalServices}`);
        console.log(`✅ Successful: ${result.successfulMigrations}`);
        console.log(`❌ Failed: ${result.failedMigrations}`);

        if (result.errors.length > 0) {
            console.log('\n❌ Failed Services:');
            result.errors.forEach((err, idx) => {
                console.log(`   ${idx + 1}. Service ID: ${err.serviceId}`);
                console.log(`      Error: ${err.error}`);
            });
            result.success = false;
        } else {
            console.log('\n🎉 All services migrated successfully!');
        }
        console.log('='.repeat(60));

        return result;
    } catch (error: any) {
        console.error('❌ Migration failed:', error);
        result.success = false;
        result.errors.push({
            serviceId: 'MIGRATION_ERROR',
            error: error.message || 'Unknown error',
        });
        return result;
    }
};

/**
 * Generate slots for a specific service by ID
 * Useful for re-generating slots for a single service
 */
export const migrateSpecificService = async (
    serviceId: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        console.log(`🔄 Generating slots for service: ${serviceId}`);

        // Fetch the service
        const servicesRef = collection(db, 'services');
        const q = query(servicesRef, where('__name__', '==', serviceId));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { success: false, error: 'Service not found' };
        }

        const doc = snapshot.docs[0];
        const data = doc.data();

        const service: Service = {
            id: doc.id,
            title: data.title || data.name || 'Untitled Service',
            duration: data.duration || 60,
            providerId: data.providerId || data.createdBy || '',
            providerName: data.providerName || 'Unknown Provider',
        } as Service;

        // Generate slots
        const slotResult = await createProviderServiceSlots({
            serviceId: service.id || '',
            providerId: service.providerId,
            serviceName: service.title,
            serviceDuration: service.duration,
            workingHours: getDefaultWorkingHours(),
            numberOfDays: 30,
            bufferMinutes: 15,
        });

        if (slotResult.success) {
            console.log(`✅ Generated ${slotResult.createdCount} days of slots`);
            return { success: true };
        } else {
            return { success: false, error: slotResult.error };
        }
    } catch (error: any) {
        console.error('❌ Migration error:', error);
        return { success: false, error: error.message };
    }
};
