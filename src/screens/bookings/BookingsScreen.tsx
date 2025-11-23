import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import BookingCard from '../../components/cards/BookingCard';
import EmptyState from '../../components/ui/EmptyState';
import Loader from '../../components/ui/Loader';
import { useAuth } from '../../context/AuthContext';
import { Booking, getBookings } from '../../firebase/bookings';
import { AppStackNavigationProp } from '../../types/navigation';

const BookingsScreen: React.FC = () => {
    const navigation = useNavigation<AppStackNavigationProp>();
    const { user } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all');

    useEffect(() => {
        if (user) {
            loadBookings();
        }
    }, [user]);

    const loadBookings = async () => {
        if (!user) return;

        setLoading(true);
        const { success, bookings: fetchedBookings } = await getBookings({ userId: user.uid });
        if (success && fetchedBookings) {
            setBookings(fetchedBookings);
        }
        setLoading(false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadBookings();
        setRefreshing(false);
    };

    const getFilteredBookings = () => {
        const now = new Date();
        switch (filter) {
            case 'upcoming':
                return bookings.filter(
                    (b) => b.status !== 'cancelled' && b.status !== 'completed' && new Date(b.date) >= now
                );
            case 'past':
                return bookings.filter(
                    (b) => b.status === 'completed' || new Date(b.date) < now
                );
            case 'cancelled':
                return bookings.filter((b) => b.status === 'cancelled');
            default:
                return bookings;
        }
    };

    const filteredBookings = getFilteredBookings();

    if (loading) {
        return <Loader fullScreen text="Loading bookings..." />;
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-200">
                <Text className="text-gray-900 text-2xl font-bold mb-4">
                    My Bookings
                </Text>

                {/* Filter Tabs */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {(['all', 'upcoming', 'past', 'cancelled'] as const).map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setFilter(tab)}
                            className={`mr-3 px-4 py-2 rounded-full ${filter === tab ? 'bg-primary' : 'bg-gray-100'
                                }`}
                        >
                            <Text
                                className={`text-sm font-semibold capitalize ${filter === tab ? 'text-white' : 'text-gray-700'
                                    }`}
                            >
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Bookings List */}
            <ScrollView
                className="flex-1 px-6 pt-4"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {filteredBookings.length === 0 ? (
                    <EmptyState
                        icon="calendar-outline"
                        title="No Bookings Found"
                        description="You haven't made any bookings yet. Browse services to get started!"
                        action={
                            <PrimaryButton
                                title="Browse Services"
                                onPress={() => navigation.navigate('MainTabs')}
                            />
                        }
                    />
                ) : (
                    filteredBookings.map((booking) => (
                        <BookingCard
                            key={booking.id}
                            booking={booking}
                            onPress={() =>
                                navigation.navigate('BookingDetails', { bookingId: booking.id! })
                            }
                            showCancelButton={true}
                        />
                    ))
                )}
            </ScrollView>

            {/* Create Booking FAB */}
            <TouchableOpacity
                onPress={() => navigation.navigate('CreateBooking')}
                className="absolute bottom-24 right-6 bg-primary w-14 h-14 rounded-full items-center justify-center shadow-lg elevation-5"
            >
                <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>
        </View>
    );
};

export default BookingsScreen;
