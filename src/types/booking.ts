export type BookingStatus = 'pending' | 'accepted' |'confirmed'| 'rejected' | 'completed' | 'cancelled';

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
