import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Booking } from '../../types/booking';

interface BookingCardProps {
    booking: Booking;
    onPress: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    showActions?: boolean;
}

const BookingCard: React.FC<BookingCardProps> = ({
    booking,
    onPress,
    onEdit,
    onDelete,
    showActions = false,
}) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return '#10B981';
            case 'pending':
                return '#F59E0B';
            case 'completed':
                return '#6366F1';
            case 'cancelled':
                return '#EF4444';
            default:
                return '#9CA3AF';
        }
    };

    const formatDate = (date: any) => {
        if (!date) return 'N/A';
        // Handle Firestore Timestamp
        if (date && typeof date.toDate === 'function') {
            return date.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
        const d = date instanceof Date ? date : new Date(date);
        if (isNaN(d.getTime())) return 'N/A';
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
            style={{ elevation: 2 }}
            activeOpacity={0.7}
        >
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                    <Text className="text-gray-900 text-base font-bold">
                        {booking.serviceName || 'Booking'}
                    </Text>
                    <Text className="text-gray-600 text-sm mt-1">
                        {booking.userName || 'User'}
                    </Text>
                </View>
                <View
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: getStatusColor(booking.status) + '20' }}
                >
                    <Text
                        className="text-xs font-semibold capitalize"
                        style={{ color: getStatusColor(booking.status) }}
                    >
                        {booking.status}
                    </Text>
                </View>
            </View>

            <View className="flex-row items-center mt-2">
                <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
                <Text className="text-gray-500 text-sm ml-2">
                    {formatDate(booking.bookingDate)}
                </Text>
            </View>

            {showActions && (onEdit || onDelete) && (
                <View className="flex-row mt-3 pt-3 border-t border-gray-100">
                    {onEdit && (
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                            className="flex-row items-center mr-4"
                        >
                            <Ionicons name="create-outline" size={18} color="#6366F1" />
                            <Text className="text-primary text-sm font-semibold ml-1">Edit</Text>
                        </TouchableOpacity>
                    )}
                    {onDelete && (
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="flex-row items-center"
                        >
                            <Ionicons name="trash-outline" size={18} color="#EF4444" />
                            <Text className="text-red-500 text-sm font-semibold ml-1">Delete</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
};

export default BookingCard;
