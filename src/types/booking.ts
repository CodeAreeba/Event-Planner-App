export type BookingStatus = 'pending' | 'accepted' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';

export interface Booking {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    providerId: string;
    providerName: string;
    serviceId: string;
    serviceName: string;
    serviceCategory: string;
    date: Date;
    time: string;
    price: number;
    status: BookingStatus;
    notes?: string;
    cancellationReason?: string;
    // Accept/Reject tracking
    acceptedAt?: Date;
    acceptedBy?: string;
    rejectedAt?: Date;
    rejectedBy?: string;
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface BookingFormData {
    serviceId: string;
    date: Date;
    time: string;
    notes?: string;
}

// Availability Calendar Types
export interface TimeSlot {
    startTime: string;  // "09:00 AM"
    endTime: string;    // "10:00 AM"
    available: boolean;
}

export interface DayAvailability {
    date: string;       // "2025-12-15"
    hasAvailability: boolean;
    totalSlots: number;
    availableSlots: number;
    timeSlots: TimeSlot[];
}

export interface ProviderAvailability {
    providerId: string;
    providerName?: string;
    workingHours: {
        start: string;  // "09:00 AM"
        end: string;    // "06:00 PM"
    };
    bufferMinutes: number;  // 15
    daysAvailability: Record<string, DayAvailability>;
}

