/**
 * Type definitions for Provider Service Slots
 * Used for auto-generated time slot booking system
 */

export interface TimeSlot {
    time: string; // Format: "9:00 AM"
    available: boolean;
}

export interface WorkingHours {
    start: string; // Format: "9:00 AM"
    end: string; // Format: "6:00 PM"
}

export interface ProviderService {
    id?: string; // Document ID format: {serviceId}_{date}
    serviceId: string; // Reference to service in services collection
    providerId: string;
    serviceName: string;
    date: string; // Format: YYYY-MM-DD
    serviceDuration: number; // Duration in minutes
    workingHours: WorkingHours;
    slots: TimeSlot[];
    createdAt: Date;
    updatedAt: Date;
}

export interface SlotGenerationConfig {
    serviceId: string;
    providerId: string;
    serviceName: string;
    serviceDuration: number; // in minutes
    workingHours: WorkingHours;
    numberOfDays?: number; // Default: 30
    bufferMinutes?: number; // Default: 15
}
