export type ServiceStatus = 'pending' | 'approved' | 'rejected';

export type ServiceCategory =
    | 'Event Planner'
    | 'Photographer'
    | 'Caterer'
    | 'Decorator'
    | 'Venue'
    | 'DJ/Music'
    | 'Makeup Artist'
    | 'Other';

export interface Service {
    id: string;
    providerId: string;
    providerName: string;
    providerEmail: string;
    name: string;
    category: ServiceCategory;
    description: string;
    price: number;
    images: string[];
    location?: string;
    phone?: string;
    status: ServiceStatus;
    approvedBy?: string;
    approvedAt?: Date;
    rejectionReason?: string;
    rating?: number;
    reviewCount?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ServiceFormData {
    name: string;
    category: ServiceCategory;
    description: string;
    price: number;
    location?: string;
    phone?: string;
}
