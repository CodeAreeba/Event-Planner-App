import { UserRole } from '../types/user';

/**
 * Permission utility functions for role-based access control
 */

export const canManageUsers = (role: UserRole): boolean => {
    return role === 'admin';
};

export const canApproveServices = (role: UserRole): boolean => {
    return role === 'admin';
};

export const canCreateService = (role: UserRole): boolean => {
    return role === 'provider' || role === 'admin';
};

export const canViewAnalytics = (role: UserRole): boolean => {
    return role === 'admin';
};

export const canDeleteAnyBooking = (role: UserRole): boolean => {
    return role === 'admin';
};

export const canAccessAdminPanel = (role: UserRole): boolean => {
    return role === 'admin';
};

export const canEditService = (role: UserRole, serviceProviderId: string, currentUserId: string): boolean => {
    if (role === 'admin') return true;
    if (role === 'provider' && serviceProviderId === currentUserId) return true;
    return false;
};

export const canDeleteService = (role: UserRole, serviceProviderId: string, currentUserId: string): boolean => {
    if (role === 'admin') return true;
    if (role === 'provider' && serviceProviderId === currentUserId) return true;
    return false;
};

export const canCancelBooking = (role: UserRole, bookingUserId: string, currentUserId: string): boolean => {
    if (role === 'admin') return true;
    if (bookingUserId === currentUserId) return true;
    return false;
};

export const canViewAllBookings = (role: UserRole): boolean => {
    return role === 'admin';
};

export const canChangeUserRole = (role: UserRole): boolean => {
    return role === 'admin';
};

export const isAdmin = (role: UserRole): boolean => {
    return role === 'admin';
};

export const isProvider = (role: UserRole): boolean => {
    return role === 'provider';
};

export const isUser = (role: UserRole): boolean => {
    return role === 'user';
};
