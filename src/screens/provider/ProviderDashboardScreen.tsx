import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ServiceCard from '../../components/cards/ServiceCard';
import StatCard from '../../components/common/StatCard';
import EmptyState from '../../components/ui/EmptyState';
import Loader from '../../components/ui/Loader';
import { useAuth } from '../../context/AuthContext';
import { getBookings } from '../../firebase/bookings';
import { getAllServices } from '../../firebase/services';
import { AppStackNavigationProp } from '../../types/navigation';
import { Service } from '../../types/service';

const ProviderDashboardScreen: React.FC = () => {
    const navigation = useNavigation<AppStackNavigationProp>();
    const { userProfile, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [services, setServices] = useState<Service[]>([]);
    const [stats, setStats] = useState({
        totalServices: 0,
        pendingBookings: 0,
        totalEarnings: 0,
    });

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        if (!user) return;
        setLoading(true);

        try {
            // 1. Get Provider's Services
            // Note: We need a way to filter services by provider. 
            // Currently getAllServices fetches all. We'll filter client-side for now 
            // or update the service to support filtering by createdBy.
            const { success: serviceSuccess, services: allServices } = await getAllServices();

            if (serviceSuccess && allServices) {
                const myServices = allServices.filter(s => s.createdBy === user.uid);
                setServices(myServices);

                // Update stats with service count first
                setStats(prev => ({
                    ...prev,
                    totalServices: myServices.length,
                }));

                // 2. Get Bookings for this provider
                // Query bookings by providerId instead of fetching all
                try {
                    const { success: bookingSuccess, bookings: providerBookings } = await getBookings({
                        providerId: user.uid
                    });

                    let pendingCount = 0;
                    let earnings = 0;

                    if (bookingSuccess && providerBookings) {
                        providerBookings.forEach(booking => {
                            if (booking.status === 'pending') pendingCount++;
                            if (booking.status === 'completed') earnings += booking.price;
                        });
                    }

                    setStats({
                        totalServices: myServices.length,
                        pendingBookings: pendingCount,
                        totalEarnings: earnings,
                    });
                } catch (bookingError: any) {
                    console.log('Could not load bookings:', bookingError?.message || 'Unknown error');
                    // Stats already updated with service count, just keep default values for bookings
                }
            }
        } catch (error) {
            console.error('Error loading provider data:', error);
            // Set empty state on error
            setServices([]);
            setStats({
                totalServices: 0,
                pendingBookings: 0,
                totalEarnings: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    if (loading && !refreshing) {
        return <Loader fullScreen text="Loading dashboard..." />;
    }

    return (
        <ScrollView
            className="flex-1 bg-gray-50"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {/* Header */}
            <SafeAreaView edges={['top']} className="bg-white px-6 pb-6 border-b border-gray-200">
                <View className="flex-row justify-between items-center mb-4">
                    <View>
                        <Text className="text-gray-500 text-sm font-medium">Welcome back,</Text>
                        <Text className="text-gray-900 text-2xl font-bold">{userProfile?.name}</Text>
                    </View>
                    <View className="bg-primary/10 px-3 py-1 rounded-full">
                        <Text className="text-primary text-xs font-bold uppercase">Provider</Text>
                    </View>
                </View>

                {/* Stats Grid */}
                <View className="flex-row flex-wrap justify-between gap-y-4">
                    <View className="w-[48%]">
                        <StatCard
                            icon="briefcase"
                            title="My Services"
                            value={stats.totalServices}
                            color="#6366F1"
                            onPress={() => navigation.navigate('UserServices')} // Navigate to manage services
                        />
                    </View>
                    <View className="w-[48%]">
                        <StatCard
                            icon="time"
                            title="Pending Jobs"
                            value={stats.pendingBookings}
                            color="#F59E0B"
                            onPress={() => { }} // Navigate to bookings filtered by pending?
                        />
                    </View>
                    <View className="w-full">
                        <StatCard
                            icon="cash"
                            title="Total Earnings"
                            value={`$${stats.totalEarnings}`}
                            color="#10B981"
                        />
                    </View>
                </View>
            </SafeAreaView>

            {/* Quick Actions */}
            <View className="px-6 py-6">
                <Text className="text-gray-900 text-lg font-bold mb-4">Quick Actions</Text>
                <View className="flex-row gap-4">
                    <TouchableOpacity
                        className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100 items-center"
                        onPress={() => navigation.navigate('AddService')}
                        activeOpacity={0.7}
                    >
                        <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center mb-2">
                            <Ionicons name="add" size={24} color="#6366F1" />
                        </View>
                        <Text className="text-gray-900 font-semibold mb-1">Add Service</Text>
                        <Text className="text-gray-500 text-xs text-center">Create a new service offering</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* My Services Preview */}
            <View className="px-6 pb-8">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-gray-900 text-lg font-bold">My Services</Text>
                    <Text
                        className="text-primary text-sm font-semibold"
                        onPress={() => navigation.navigate('UserServices')}
                    >
                        See All
                    </Text>
                </View>

                {services.length === 0 ? (
                    <EmptyState
                        icon="briefcase-outline"
                        title="No Services Yet"
                        description="Start by adding your first service to get booked!"
                    />
                ) : (
                    services.slice(0, 3).map((service) => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            onPress={() => navigation.navigate('ServiceDetails', { serviceId: service.id! })}
                        />
                    ))
                )}
            </View>
        </ScrollView>
    );
};

export default ProviderDashboardScreen;
