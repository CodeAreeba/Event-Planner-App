import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { getProviderBookingsForDate } from '../../firebase/bookings';
import { Booking } from '../../types/booking';
import {
    formatDateString,
    getAvailableSlotsForDay,
    isPastTimeSlot,
    WorkingHours,
} from '../../utils/availabilityUtils';

interface TimeSlotPickerProps {
    providerId: string;
    selectedDate: Date;
    serviceDuration: number;
    selectedTime?: string;
    onTimeSelect: (time: string) => void;
}

const DEFAULT_WORKING_HOURS: WorkingHours = {
    start: '09:00 AM',
    end: '06:00 PM',
};

const BUFFER_MINUTES = 15;

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
    providerId,
    selectedDate,
    serviceDuration,
    selectedTime,
    onTimeSelect,
}) => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [availableSlots, setAvailableSlots] = useState<any[]>([]);

    useEffect(() => {
        loadBookingsAndCalculateSlots();
    }, [providerId, selectedDate, serviceDuration]);

    const loadBookingsAndCalculateSlots = async () => {
        setLoading(true);

        const { success, bookings: fetchedBookings } = await getProviderBookingsForDate(
            providerId,
            selectedDate
        );

        if (success && fetchedBookings) {
            setBookings(fetchedBookings);
            calculateAvailableSlots(fetchedBookings);
        } else {
            setBookings([]);
            calculateAvailableSlots([]);
        }

        setLoading(false);
    };

    const calculateAvailableSlots = (bookingsForDate: Booking[]) => {
        const dateStr = formatDateString(selectedDate);
        const { available } = getAvailableSlotsForDay(
            dateStr,
            bookingsForDate,
            DEFAULT_WORKING_HOURS,
            serviceDuration,
            BUFFER_MINUTES
        );

        // Filter out past time slots for today
        const now = new Date();
        const isToday = dateStr === formatDateString(now);

        const filteredSlots = isToday
            ? available.filter(slot => !isPastTimeSlot(dateStr, slot.startTime))
            : available;

        setAvailableSlots(filteredSlots);
    };

    if (loading) {
        return (
            <View className="bg-white rounded-2xl p-6 shadow-sm items-center justify-center" style={{ minHeight: 150 }}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text className="text-gray-600 mt-3">Loading time slots...</Text>
            </View>
        );
    }

    if (availableSlots.length === 0) {
        return (
            <View className="bg-white rounded-2xl p-6 shadow-sm">
                <Text className="text-gray-900 text-lg font-bold mb-2">Available Time Slots</Text>
                <View className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <Text className="text-red-700 text-center font-semibold">
                        No available time slots for this date
                    </Text>
                    <Text className="text-red-600 text-center text-sm mt-1">
                        Please select a different date
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View className="bg-white rounded-2xl p-4 shadow-sm">
            <View className="mb-3">
                <Text className="text-gray-900 text-lg font-bold">Available Time Slots</Text>
                <Text className="text-gray-600 text-sm mt-1">
                    {selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </Text>
                <Text className="text-primary text-sm font-semibold mt-1">
                    {availableSlots.length} slot{availableSlots.length !== 1 ? 's' : ''} available
                </Text>
            </View>

            <ScrollView
                horizontal={false}
                showsVerticalScrollIndicator={false}
                className="max-h-64"
            >
                <View className="flex-row flex-wrap gap-2">
                    {availableSlots.map((slot, index) => {
                        const isSelected = selectedTime === slot.startTime;
                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={() => onTimeSelect(slot.startTime)}
                                className={`flex-1 min-w-[45%] px-4 py-3 rounded-xl border-2 ${isSelected
                                        ? 'bg-primary border-primary'
                                        : 'bg-white border-gray-200'
                                    }`}
                                activeOpacity={0.7}
                            >
                                <Text
                                    className={`text-center font-semibold ${isSelected ? 'text-white' : 'text-gray-900'
                                        }`}
                                >
                                    {slot.startTime}
                                </Text>
                                <Text
                                    className={`text-center text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-gray-500'
                                        }`}
                                >
                                    {serviceDuration} min
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
};

export default TimeSlotPicker;
