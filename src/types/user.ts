export type UserRole = 'admin' | 'user' | 'provider';

export interface UserProfile {
    uid: string;
    email: string;
    name: string;
    role: UserRole;
    phone?: string;
    address?: string;
    profileImage?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserStats {
    totalBookings: number;
    totalServices?: number; // Only for providers
    totalSpent?: number; // Only for users
    totalEarned?: number; // Only for providers
}
