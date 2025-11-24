import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingState from '../../components/common/LoadingState';
import { useAuth } from '../../context/AuthContext';
import { Booking, deleteBooking, getBookingById } from '../../firebase/bookings';
import { AppStackNavigationProp, AppStackParamList } from '../../types/navigation';

type BookingDetailsRouteProp = RouteProp<AppStackParamList, 'BookingDetails'>;

const BookingDetailsScreen: React.FC = () => {
    const navigation = useNavigation<AppStackNavigationProp>();
    const route = useRoute<BookingDetailsRouteProp>();
    const { isAdmin, user } = useAuth();
    const { bookingId } = route.params;

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBooking();
    }, [bookingId]);

    const loadBooking = async () => {
        setLoading(true);
        const { success, booking: fetchedBooking } = await getBookingById(bookingId);
        if (success && fetchedBooking) {
            setBooking(fetchedBooking);
        }
        setLoading(false);
    };

    const handleEdit = () => {
        navigation.navigate('EditBooking', { bookingId });
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Booking',
            'Are you sure you want to delete this booking? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const { success } = await deleteBooking(bookingId);
                        if (success) {
                            Alert.alert('Success', 'Booking deleted successfully');
                            navigation.goBack();
                        } else {
                            Alert.alert('Error', 'Failed to delete booking');
                        }
                    },
                },
            ]
        );
    };

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

        try {
            let dateObj: Date;

            // Handle Firestore Timestamp
            if (date && typeof date.toDate === 'function') {
                dateObj = date.toDate();
            }
            // Handle Date object
            else if (date instanceof Date) {
                dateObj = date;
            }
            // Handle string or number
            else {
                dateObj = new Date(date);
            }

            // Check if date is valid
            if (isNaN(dateObj.getTime())) {
                return 'Invalid Date';
            }

            return dateObj.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', error, date);
            return 'Invalid Date';
        }
    };

    if (loading) {
        return <LoadingState message="Loading booking details..." />;
    }

    if (!booking) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <View className="flex-1 items-center justify-center px-6">
                    <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                    <Text className="text-gray-900 text-xl font-bold mt-4 text-center">
                        Booking Not Found
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="bg-primary rounded-full px-6 py-3 mt-6"
                    >
                        <Text className="text-white font-semibold">Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Card */}
                <View className="bg-white p-6 mb-4">
                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1">
                            <Text className="text-gray-900 text-2xl font-bold">
                                {booking.serviceName || 'Booking'}
                            </Text>
                            <Text className="text-gray-600 text-sm mt-1">
                                Booking ID: {booking.id}
                            </Text>
                        </View>
                        <View
                            className="px-4 py-2 rounded-full"
                            style={{ backgroundColor: getStatusColor(booking.status) + '20' }}
                        >
                            <Text
                                className="text-sm font-bold capitalize"
                                style={{ color: getStatusColor(booking.status) }}
                            >
                                {booking.status}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Details */}
                <View className="bg-white p-6 mb-4">
                    <Text className="text-gray-900 text-lg font-bold mb-4">Booking Details</Text>

                    <View className="mb-4">
                        <Text className="text-gray-500 text-xs font-medium mb-1">Customer</Text>
                        <View className="flex-row items-center">
                            <Ionicons name="person-outline" size={20} color="#6366F1" />
                            <Text className="text-gray-900 text-base ml-2">{booking.userName}</Text>
                        </View>
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-500 text-xs font-medium mb-1">Date</Text>
                        <View className="flex-row items-center">
                            <Ionicons name="calendar-outline" size={20} color="#6366F1" />
                            <Text className="text-gray-900 text-base ml-2">
                                {formatDate(booking.date)}
                            </Text>
                        </View>
                    </View>

                    {booking.time && (
                        <View className="mb-4">
                            <Text className="text-gray-500 text-xs font-medium mb-1">Time</Text>
                            <View className="flex-row items-center">
                                <Ionicons name="time-outline" size={20} color="#6366F1" />
                                <Text className="text-gray-900 text-base ml-2">{booking.time}</Text>
                            </View>
                        </View>
                    )}

                    {booking.price && (
                        <View className="mb-4">
                            <Text className="text-gray-500 text-xs font-medium mb-1">Price</Text>
                            <View className="flex-row items-center">
                                <Ionicons name="cash-outline" size={20} color="#6366F1" />
                                <Text className="text-gray-900 text-base ml-2 font-bold">
                                    ${booking.price}
                                </Text>
                            </View>
                        </View>
                    )}

                    {booking.notes && (
                        <View>
                            <Text className="text-gray-500 text-xs font-medium mb-1">Notes</Text>
                            <Text className="text-gray-700 text-sm">{booking.notes}</Text>
                        </View>
                    )}
                </View>

                {/* Actions */}
                {(isAdmin || user?.uid === booking.userId) && (
                    <View className="px-6 pb-6">
                        <TouchableOpacity
                            onPress={handleEdit}
                            className="bg-primary rounded-full py-4 items-center mb-3"
                        >
                            <Text className="text-white text-base font-bold">Edit Booking</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleDelete}
                            className="bg-red-500 rounded-full py-4 items-center"
                        >
                            <Text className="text-white text-base font-bold">Delete Booking</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default BookingDetailsScreen;
