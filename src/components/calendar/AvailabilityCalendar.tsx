import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { getProviderFutureBookings } from '../../firebase/bookings';
import { Booking } from '../../types/booking';
import {
    formatDateString,
    getAvailabilityColor,
    getAvailableSlotsForDay,
    getDateAvailabilityStatus,
    isPastDate,
    WorkingHours,
} from '../../utils/availabilityUtils';

interface AvailabilityCalendarProps {
    providerId: string;
    providerName?: string;
    serviceDuration: number;
    selectedDate?: Date;
    onDateSelect: (date: Date) => void;
    minDate?: Date;
}

const DEFAULT_WORKING_HOURS: WorkingHours = {
    start: '09:00 AM',
    end: '06:00 PM',
};

const BUFFER_MINUTES = 15;

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
    providerId,
    providerName,
    serviceDuration,
    selectedDate,
    onDateSelect,
    minDate,
}) => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [markedDates, setMarkedDates] = useState<any>({});
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        loadBookingsForMonth(currentMonth);
    }, [providerId, currentMonth]);

    useEffect(() => {
        if (bookings.length >= 0) {
            calculateMarkedDates();
        }
    }, [bookings, selectedDate]);

    const loadBookingsForMonth = async (month: Date) => {
        setLoading(true);

        // Get first and last day of the month
        const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
        const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

        const { success, bookings: fetchedBookings } = await getProviderFutureBookings(
            providerId,
            startDate,
            endDate
        );

        if (success && fetchedBookings) {
            setBookings(fetchedBookings);
        }

        setLoading(false);
    };

    const calculateMarkedDates = () => {
        const marked: any = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Calculate for each day in the current month
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = formatDateString(date);

            // Skip past dates
            if (isPastDate(dateStr)) {
                marked[dateStr] = {
                    disabled: true,
                    disableTouchEvent: true,
                };
                continue;
            }

            // Calculate availability for this date
            const { available, total } = getAvailableSlotsForDay(
                dateStr,
                bookings,
                DEFAULT_WORKING_HOURS,
                serviceDuration,
                BUFFER_MINUTES
            );

            const status = getDateAvailabilityStatus(available.length, total);
            const color = getAvailabilityColor(status);

            marked[dateStr] = {
                marked: true,
                dotColor: color,
            };

            // Disable fully booked dates
            if (status === 'none') {
                marked[dateStr].disabled = true;
                marked[dateStr].disableTouchEvent = true;
            }
        }

        // Mark selected date
        if (selectedDate) {
            const selectedDateStr = formatDateString(selectedDate);
            if (marked[selectedDateStr]) {
                marked[selectedDateStr].selected = true;
                marked[selectedDateStr].selectedColor = '#6366F1';
            } else {
                marked[selectedDateStr] = {
                    selected: true,
                    selectedColor: '#6366F1',
                };
            }
        }

        setMarkedDates(marked);
    };

    const handleDayPress = (day: DateData) => {
        const date = new Date(day.year, day.month - 1, day.day);
        onDateSelect(date);
    };

    const handleMonthChange = (month: DateData) => {
        const newMonth = new Date(month.year, month.month - 1, 1);
        setCurrentMonth(newMonth);
    };

    const minDateStr = minDate ? formatDateString(minDate) : formatDateString(new Date());

    return (
        <View className="bg-white rounded-2xl p-4 shadow-sm">
            {/* Header */}
            <View className="mb-4">
                <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-gray-900 text-lg font-bold">Check Availability</Text>
                    {loading && <ActivityIndicator size="small" color="#6366F1" />}
                </View>
                {providerName && (
                    <Text className="text-gray-600 text-sm">
                        Provider: <Text className="font-semibold">{providerName}</Text>
                    </Text>
                )}
            </View>

            {/* Calendar */}
            <Calendar
                current={formatDateString(currentMonth)}
                minDate={minDateStr}
                markedDates={markedDates}
                onDayPress={handleDayPress}
                onMonthChange={handleMonthChange}
                theme={{
                    backgroundColor: '#ffffff',
                    calendarBackground: '#ffffff',
                    textSectionTitleColor: '#6B7280',
                    selectedDayBackgroundColor: '#6366F1',
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: '#6366F1',
                    dayTextColor: '#1F2937',
                    textDisabledColor: '#D1D5DB',
                    dotColor: '#6366F1',
                    selectedDotColor: '#ffffff',
                    arrowColor: '#6366F1',
                    monthTextColor: '#1F2937',
                    textDayFontFamily: 'System',
                    textMonthFontFamily: 'System',
                    textDayHeaderFontFamily: 'System',
                    textDayFontWeight: '400',
                    textMonthFontWeight: 'bold',
                    textDayHeaderFontWeight: '600',
                    textDayFontSize: 14,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 12,
                }}
            />

            {/* Legend */}
            <View className="mt-4 pt-4 border-t border-gray-200">
                <Text className="text-gray-700 text-xs font-semibold mb-2">Availability</Text>
                <View className="flex-row flex-wrap gap-3">
                    <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded-full bg-[#10B981] mr-2" />
                        <Text className="text-gray-600 text-xs">Many slots</Text>
                    </View>
                    <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded-full bg-[#F59E0B] mr-2" />
                        <Text className="text-gray-600 text-xs">Limited</Text>
                    </View>
                    <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded-full bg-[#EF4444] mr-2" />
                        <Text className="text-gray-600 text-xs">Fully booked</Text>
                    </View>
                </View>
            </View>

            {/* Info */}
            <View className="mt-3 bg-blue-50 rounded-xl p-3 flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#3B82F6" style={{ marginRight: 8, marginTop: 2 }} />
                <Text className="text-blue-700 text-xs flex-1">
                    Select a date to view available time slots. Green dots indicate many available slots.
                </Text>
            </View>
        </View>
    );
};

export default AvailabilityCalendar;
