// Service approval status
export type ServiceStatus = 'pending' | 'approved' | 'rejected';

export interface Service {
    id?: string;
    title: string;  // Service title (using 'title' as per requirements)
    name?: string;   // Alias for title (backward compatibility) - auto-generated from title
    description: string;
    price: number;
    duration: number;

    // Category and images (new fields)
    category: string; // Category ID from CATEGORIES constant
    images?: string[]; // Array of image URLs

    // Provider information
    providerId: string; // User ID of the provider
    providerName: string; // Provider's name for quick access

    // Approval workflow
    status: ServiceStatus; // Approval status
    approvedBy?: string; // Admin user ID who approved
    approvedAt?: Date; // Timestamp of approval
    rejectionReason?: string; // Reason for rejection if status is 'rejected'

    // Status and metadata
    isActive: boolean; // Whether service is currently active/visible
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;  // User ID of creator (for tracking) - same as providerId
}

export interface ServiceFormData {
    title: string;
    description: string;
    price: number;
    duration: number;
    category: string; // Category ID
    images?: string[]; // Optional images
}
