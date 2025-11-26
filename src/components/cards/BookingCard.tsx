import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Booking } from '../../firebase/bookings';
import { formatBookingStatus, formatCurrency, formatDate, formatTime } from '../../utils/format';

interface BookingCardProps {
    booking: Booking;
    onPress?: () => void;
    onCancel?: () => void;
    showCancelButton?: boolean;
    showUserInfo?: boolean;
}

const BookingCard: React.FC<BookingCardProps> = ({
    booking,
    onPress,
    onCancel,
    showCancelButton = false,
    showUserInfo = false,
}) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'accepted':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="bg-white rounded-2xl shadow-md p-4 mb-4"
        >
            {/* Header */}
            <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                    <Text className="text-gray-900 text-lg font-bold" numberOfLines={1}>
                        {booking.serviceName}
                    </Text>
                    <Text className="text-gray-500 text-sm mt-1">
                        Provider: {booking.providerName}
                    </Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                    <Text className="text-xs font-semibold">
                        {formatBookingStatus(booking.status)}
                    </Text>
                </View>
            </View>

            {/* User Info (Admin Only) */}
            {showUserInfo && (
                <View className="flex-row items-center mb-2">
                    <Ionicons name="person-outline" size={16} color="#6B7280" />
                    <Text className="text-gray-600 text-sm ml-2">
                        Booked by: <Text className="font-semibold text-gray-900">{booking.userName}</Text>
                    </Text>
                </View>
            )}

            {/* Date & Time */}
            <View className="flex-row items-center mb-2">
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text className="text-gray-600 text-sm ml-2">
                    {formatDate(booking.date)}
                </Text>
            </View>

            <View className="flex-row items-center mb-3">
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text className="text-gray-600 text-sm ml-2">
                    {formatTime(booking.time)}
                </Text>
            </View>

            {/* Price */}
            <View className="flex-row justify-between items-center pt-3 border-t border-gray-200">
                <Text className="text-primary text-xl font-bold">
                    {formatCurrency(booking.price)}
                </Text>

                {showCancelButton && booking.status !== 'cancelled' && booking.status !== 'completed' && onCancel && (
                    <TouchableOpacity
                        onPress={onCancel}
                        className="bg-red-50 px-4 py-2 rounded-lg"
                    >
                        <Text className="text-error text-sm font-semibold">Cancel</Text>
                    </TouchableOpacity>
                )}
            </View>

            {booking.notes && (
                <View className="mt-3 bg-gray-50 p-3 rounded-lg">
                    <Text className="text-gray-600 text-xs">Note: {booking.notes}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

export default BookingCard;
