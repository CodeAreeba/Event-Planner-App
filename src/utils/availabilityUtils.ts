/**
 * Utility functions for calculating provider availability
 */

import { Booking } from '../types/booking';

export interface WorkingHours {
    start: string;  // "09:00 AM"
    end: string;    // "06:00 PM"
}

export interface TimeSlot {
    startTime: string;
    endTime: string;
    startDate: Date;
    endDate: Date;
}

/**
 * Parse time string (e.g., "09:00 AM") and combine with date
 */
export const parseTimeString = (dateStr: string, timeStr: string): Date => {
    const date = new Date(dateStr);
    const timeParts = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);

    if (!timeParts) {
        throw new Error(`Invalid time format: ${timeStr}`);
    }

    let hours = parseInt(timeParts[1], 10);
    const minutes = parseInt(timeParts[2], 10);
    const period = timeParts[3].toUpperCase();

    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }

    date.setHours(hours, minutes, 0, 0);
    return date;
};

/**
 * Format Date object to time string (e.g., "09:00 AM")
 */
export const formatTimeSlot = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

/**
 * Add minutes to a date
 */
export const addMinutes = (date: Date, minutes: number): Date => {
    return new Date(date.getTime() + minutes * 60000);
};

/**
 * Generate all possible time slots for a day
 */
export const generateTimeSlots = (
    dateStr: string,
    workingHours: WorkingHours,
    slotDuration: number,
    bufferMinutes: number = 15
): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const totalSlotDuration = slotDuration + bufferMinutes;

    let currentTime = parseTimeString(dateStr, workingHours.start);
    const endTime = parseTimeString(dateStr, workingHours.end);

    while (currentTime < endTime) {
        const slotEnd = addMinutes(currentTime, slotDuration);

        // Only add slot if it ends before or at working hours end
        if (slotEnd <= endTime) {
            slots.push({
                startTime: formatTimeSlot(currentTime),
                endTime: formatTimeSlot(slotEnd),
                startDate: new Date(currentTime),
                endDate: new Date(slotEnd),
            });
        }

        // Move to next slot (including buffer)
        currentTime = addMinutes(currentTime, totalSlotDuration);
    }

    return slots;
};

/**
 * Check if a time slot overlaps with any existing bookings
 */
export const isSlotAvailable = (
    slot: TimeSlot,
    bookings: Booking[]
): boolean => {
    for (const booking of bookings) {
        const bookingDate = booking.date instanceof Date
            ? booking.date
            : new Date(booking.date);

        // Parse booking time
        const bookingStart = parseTimeString(
            bookingDate.toISOString().split('T')[0],
            booking.time
        );

        // Estimate booking end time (using service duration if available, otherwise 60 min)
        const bookingEnd = addMinutes(bookingStart, 60); // Default duration

        // Check for overlap
        // Slot overlaps if: slot.start < booking.end AND slot.end > booking.start
        if (slot.startDate < bookingEnd && slot.endDate > bookingStart) {
            return false;
        }
    }

    return true;
};

/**
 * Get available time slots for a specific day
 */
export const getAvailableSlotsForDay = (
    dateStr: string,
    bookings: Booking[],
    workingHours: WorkingHours,
    serviceDuration: number,
    bufferMinutes: number = 15
): { available: TimeSlot[]; total: number } => {
    const allSlots = generateTimeSlots(dateStr, workingHours, serviceDuration, bufferMinutes);

    // Filter bookings for this specific date
    const dateBookings = bookings.filter(booking => {
        const bookingDate = booking.date instanceof Date
            ? booking.date
            : new Date(booking.date);
        const bookingDateStr = bookingDate.toISOString().split('T')[0];
        return bookingDateStr === dateStr;
    });

    const availableSlots = allSlots.filter(slot =>
        isSlotAvailable(slot, dateBookings)
    );

    return {
        available: availableSlots,
        total: allSlots.length,
    };
};

/**
 * Determine availability status based on available vs total slots
 */
export const getDateAvailabilityStatus = (
    availableSlots: number,
    totalSlots: number
): 'full' | 'partial' | 'none' => {
    if (totalSlots === 0) return 'none';

    const percentage = (availableSlots / totalSlots) * 100;

    if (percentage > 50) return 'full';
    if (percentage > 0) return 'partial';
    return 'none';
};

/**
 * Get color for calendar marking based on availability
 */
export const getAvailabilityColor = (status: 'full' | 'partial' | 'none'): string => {
    switch (status) {
        case 'full':
            return '#10B981'; // Green
        case 'partial':
            return '#F59E0B'; // Yellow/Orange
        case 'none':
            return '#EF4444'; // Red
        default:
            return '#9CA3AF'; // Gray
    }
};

/**
 * Format date to YYYY-MM-DD string
 */
export const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Check if a date is in the past
 */
export const isPastDate = (dateStr: string): boolean => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
};

/**
 * Check if a time slot is in the past (for today's date)
 */
export const isPastTimeSlot = (dateStr: string, timeStr: string): boolean => {
    const slotDateTime = parseTimeString(dateStr, timeStr);
    return slotDateTime < new Date();
};
