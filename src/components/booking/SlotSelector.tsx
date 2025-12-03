/**
 * SlotSelector Component
 * Displays available time slots in a grid layout
 * Allows users to select an available slot for booking
 */

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { getAvailableSlots } from '../../firebase/providerServices';
import { TimeSlot } from '../../types/providerService';
import { formatDateToString } from '../../utils/slotGenerator';

interface SlotSelectorProps {
    serviceId: string;
    selectedDate: Date;
    selectedSlot?: string;
    onSlotSelect: (slotTime: string) => void;
    showAllSlots?: boolean; // If true, show all slots (available and unavailable)
}

const SlotSelector: React.FC<SlotSelectorProps> = ({
    serviceId,
    selectedDate,
    selectedSlot,
    onSlotSelect,
    showAllSlots = false,
}) => {
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadSlots();
    }, [serviceId, selectedDate]);

    const loadSlots = async () => {
        setLoading(true);
        setError(null);

        try {
            const dateStr = formatDateToString(selectedDate);
            const { success, slots: fetchedSlots, error: fetchError } = await getAvailableSlots(
                serviceId,
                dateStr
            );

            if (success && fetchedSlots) {
                setSlots(fetchedSlots);
            } else {
                setError(fetchError || 'Failed to load slots');
                setSlots([]);
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
            setSlots([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="bg-white rounded-2xl p-6 shadow-sm items-center justify-center" style={{ minHeight: 150 }}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text className="text-gray-600 mt-3">Loading available slots...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View className="bg-white rounded-2xl p-6 shadow-sm">
                <Text className="text-gray-900 text-lg font-bold mb-2">Available Time Slots</Text>
                <View className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <Text className="text-red-700 text-center font-semibold">
                        {error}
                    </Text>
                    <TouchableOpacity
                        onPress={loadSlots}
                        className="mt-3 bg-red-600 rounded-lg py-2 px-4"
                    >
                        <Text className="text-white text-center font-semibold">Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (slots.length === 0) {
        return (
            <View className="bg-white rounded-2xl p-6 shadow-sm">
                <Text className="text-gray-900 text-lg font-bold mb-2">Available Time Slots</Text>
                <View className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                    <Text className="text-amber-700 text-center font-semibold">
                        No available slots for this date
                    </Text>
                    <Text className="text-amber-600 text-center text-sm mt-1">
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
                    {slots.length} slot{slots.length !== 1 ? 's' : ''} available
                </Text>
            </View>

            <ScrollView
                horizontal={false}
                showsVerticalScrollIndicator={false}
                className="max-h-64"
            >
                <View className="flex-row flex-wrap gap-2">
                    {slots.map((slot, index) => {
                        const isSelected = selectedSlot === slot.time;
                        const isAvailable = slot.available;

                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={() => isAvailable && onSlotSelect(slot.time)}
                                disabled={!isAvailable}
                                className={`flex-1 min-w-[45%] px-4 py-3 rounded-xl border-2 ${isSelected
                                        ? 'bg-primary border-primary'
                                        : isAvailable
                                            ? 'bg-white border-gray-200'
                                            : 'bg-gray-100 border-gray-300'
                                    }`}
                                activeOpacity={isAvailable ? 0.7 : 1}
                            >
                                <Text
                                    className={`text-center font-semibold ${isSelected
                                            ? 'text-white'
                                            : isAvailable
                                                ? 'text-gray-900'
                                                : 'text-gray-400'
                                        }`}
                                >
                                    {slot.time}
                                </Text>
                                {!isAvailable && (
                                    <Text className="text-center text-xs mt-1 text-gray-400">
                                        Booked
                                    </Text>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Info */}
            <View className="mt-3 bg-blue-50 rounded-xl p-3 flex-row items-start">
                <Text className="text-blue-700 text-xs flex-1">
                    💡 Select an available time slot for your booking. Unavailable slots are already booked.
                </Text>
            </View>
        </View>
    );
};

export default SlotSelector;
