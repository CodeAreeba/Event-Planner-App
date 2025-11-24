export type UserRole = 'admin' | 'user' | 'provider';
export type UserStatus = 'active' | 'blocked';

export interface UserProfile {
    uid: string;
    email: string;
    name: string;
    role: UserRole;
    status?: UserStatus; // Default: 'active'
    phone?: string;
    address?: string;
    profileImage?: string;
    isDeleted?: boolean; // Soft delete flag, default: false
    deletedAt?: Date; // Timestamp when user was deleted
    createdAt: Date;
    updatedAt: Date;
}

export interface UserStats {
    totalBookings: number;
    totalServices?: number; // Only for providers
    totalSpent?: number; // Only for users
    totalEarned?: number; // Only for providers
}
