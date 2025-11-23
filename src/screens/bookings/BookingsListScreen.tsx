import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BookingCard from '../../../components/common/BookingCard';
import LoadingState from '../../../components/common/LoadingState';
import SearchBar from '../../../components/common/SearchBar';
import EmptyState from '../../../components/ui/EmptyState';
import { useAuth } from '../../../context/AuthContext';
import { Booking, deleteBooking, getBookings } from '../../../firebase/bookings';
import { AppStackNavigationProp } from '../../../types/navigation';

const BookingsListScreen: React.FC = () => {
    const navigation = useNavigation<AppStackNavigationProp>();
    const { isAdmin } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const loadBookings = async () => {
        setLoading(true);
        const { success, bookings: fetchedBookings } = await getBookings();
        if (success && fetchedBookings) {
            setBookings(fetchedBookings);
            setFilteredBookings(fetchedBookings);
        }
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadBookings();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadBookings();
        setRefreshing(false);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setFilteredBookings(bookings);
        } else {
            const filtered = bookings.filter(
                (booking) =>
                    booking.serviceName?.toLowerCase().includes(query.toLowerCase()) ||
                    booking.userName?.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredBookings(filtered);
        }
    };

    const handleBookingPress = (booking: Booking) => {
        navigation.navigate('BookingDetails', { bookingId: booking.id! });
    };

    const handleEdit = (booking: Booking) => {
        navigation.navigate('EditBooking', { bookingId: booking.id! });
    };

    const handleDelete = (booking: Booking) => {
        Alert.alert(
            'Delete Booking',
            'Are you sure you want to delete this booking? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const { success } = await deleteBooking(booking.id!);
                        if (success) {
                            Alert.alert('Success', 'Booking deleted successfully');
                            loadBookings();
                        } else {
                            Alert.alert('Error', 'Failed to delete booking');
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return <LoadingState message="Loading bookings..." />;
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            {/* Header */}
            <View className="bg-primary pt-4 pb-6 px-6">
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-white text-2xl font-bold">Bookings</Text>
                    {isAdmin && (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('AddBooking')}
                            className="bg-white/20 px-4 py-2 rounded-full flex-row items-center"
                        >
                            <Ionicons name="add" size={20} color="white" />
                            <Text className="text-white text-sm font-semibold ml-1">New</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <SearchBar
                    value={searchQuery}
                    onChangeText={handleSearch}
                    placeholder="Search bookings..."
                />
            </View>

            {/* Bookings List */}
            <View className="flex-1 px-6 -mt-4">
                {filteredBookings.length === 0 ? (
                    <EmptyState
                        icon="calendar-outline"
                        title="No Bookings Found"
                        description={
                            searchQuery
                                ? 'No bookings match your search'
                                : 'No bookings available yet'
                        }
                    />
                ) : (
                    <FlatList
                        data={filteredBookings}
                        keyExtractor={(item) => item.id!}
                        renderItem={({ item }) => (
                            <BookingCard
                                booking={item}
                                onPress={() => handleBookingPress(item)}
                                onEdit={isAdmin ? () => handleEdit(item) : undefined}
                                onDelete={isAdmin ? () => handleDelete(item) : undefined}
                                showActions={isAdmin}
                            />
                        )}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

export default BookingsListScreen;
