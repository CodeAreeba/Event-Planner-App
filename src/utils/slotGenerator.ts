/**
 * Slot Generator Utility
 * Generates time slots for provider services based on working hours and duration
 */

import { TimeSlot, WorkingHours } from '../types/providerService';

const BUFFER_MINUTES = 15; // Default buffer between slots

/**
 * Parse time string to minutes since midnight
 * @param timeStr - Time in format "9:00 AM" or "2:30 PM"
 * @returns Minutes since midnight
 */
export const parseTimeToMinutes = (timeStr: string): number => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);

    let totalMinutes = minutes;

    if (period === 'PM' && hours !== 12) {
        totalMinutes += (hours + 12) * 60;
    } else if (period === 'AM' && hours === 12) {
        totalMinutes += 0; // 12 AM is midnight
    } else {
        totalMinutes += hours * 60;
    }

    return totalMinutes;
};

/**
 * Format minutes to time string
 * @param minutes - Minutes since midnight
 * @returns Time in format "9:00 AM"
 */
export const formatMinutesToTime = (minutes: number): string => {
    const hours24 = Math.floor(minutes / 60);
    const mins = minutes % 60;

    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;

    const formattedMins = mins.toString().padStart(2, '0');

    return `${hours12}:${formattedMins} ${period}`;
};

/**
 * Generate time slots for a single day
 * @param workingHours - Start and end time
 * @param serviceDuration - Duration of each slot in minutes
 * @param bufferMinutes - Buffer time between slots (default: 15)
 * @returns Array of time slots
 */
export const generateDailySlots = (
    workingHours: WorkingHours,
    serviceDuration: number,
    bufferMinutes: number = BUFFER_MINUTES
): TimeSlot[] => {
    const slots: TimeSlot[] = [];

    const startMinutes = parseTimeToMinutes(workingHours.start);
    const endMinutes = parseTimeToMinutes(workingHours.end);

    let currentMinutes = startMinutes;

    while (currentMinutes + serviceDuration <= endMinutes) {
        const slotTime = formatMinutesToTime(currentMinutes);

        slots.push({
            time: slotTime,
            available: true,
        });

        // Move to next slot (duration + buffer)
        currentMinutes += serviceDuration + bufferMinutes;
    }

    return slots;
};

/**
 * Generate slots for multiple days
 * @param workingHours - Start and end time
 * @param serviceDuration - Duration of each slot in minutes
 * @param numberOfDays - Number of days to generate (default: 30)
 * @param bufferMinutes - Buffer time between slots (default: 15)
 * @returns Map of date string to slots array
 */
export const generateSlotsForDays = (
    workingHours: WorkingHours,
    serviceDuration: number,
    numberOfDays: number = 30,
    bufferMinutes: number = BUFFER_MINUTES
): Map<string, TimeSlot[]> => {
    const slotsMap = new Map<string, TimeSlot[]>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < numberOfDays; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        const dateStr = formatDateToString(date);
        const dailySlots = generateDailySlots(workingHours, serviceDuration, bufferMinutes);

        slotsMap.set(dateStr, dailySlots);
    }

    return slotsMap;
};

/**
 * Format date to YYYY-MM-DD string
 * @param date - Date object
 * @returns Date string in YYYY-MM-DD format
 */
export const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

/**
 * Calculate end time for a slot
 * @param startTime - Start time in format "9:00 AM"
 * @param durationMinutes - Duration in minutes
 * @returns End time in format "11:00 AM"
 */
export const calculateSlotEndTime = (startTime: string, durationMinutes: number): string => {
    const startMinutes = parseTimeToMinutes(startTime);
    const endMinutes = startMinutes + durationMinutes;

    return formatMinutesToTime(endMinutes);
};

/**
 * Validate if a time slot fits within working hours
 * @param slotStartTime - Slot start time
 * @param durationMinutes - Slot duration
 * @param workingHours - Working hours
 * @returns True if slot fits within working hours
 */
export const isSlotWithinWorkingHours = (
    slotStartTime: string,
    durationMinutes: number,
    workingHours: WorkingHours
): boolean => {
    const startMinutes = parseTimeToMinutes(slotStartTime);
    const endMinutes = startMinutes + durationMinutes;
    const workingEndMinutes = parseTimeToMinutes(workingHours.end);

    return endMinutes <= workingEndMinutes;
};

/**
 * Get default working hours
 * @returns Default working hours (9 AM - 6 PM)
 */
export const getDefaultWorkingHours = (): WorkingHours => ({
    start: '9:00 AM',
    end: '6:00 PM',
});
