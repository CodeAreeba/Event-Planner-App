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

export interface ServiceFormData {
    title: string;
    description: string;
    price: number;
    duration: number;
}
