import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ServiceCard from '../../components/cards/ServiceCard';
import Loader from '../../components/ui/Loader';
import { useAuth } from '../../context/AuthContext';
import { getBookings, updatePastBookingsStatus } from '../../firebase/bookings';
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
        completedBookings: 0,
        totalEarnings: 0,
    });

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        if (!user) {
            console.log('❌ No user found, cannot load data');
            return;
        }

        setLoading(true);
        console.log('\n🔍 ===== PROVIDER DASHBOARD DATA LOAD START =====');
        console.log('📋 Current user ID:', user.uid);
        console.log('👤 User profile:', userProfile?.name, '| Role:', userProfile?.role);

        try {
            // 0. Auto-update past bookings to 'completed' status
            try {
                await updatePastBookingsStatus();
            } catch (updateError) {
                // Silently fail if permissions don't allow
                console.log('Could not auto-update past bookings');
            }

            // 1. Get Provider's Services
            console.log('\n📦 Fetching all services...');
            const { success: serviceSuccess, services: allServices } = await getAllServices();

            if (serviceSuccess && allServices) {
                console.log('✅ Total services fetched from Firestore:', allServices.length);

                // Log first few services for debugging
                if (allServices.length > 0) {
                    console.log('📝 Sample services (first 3):');
                    allServices.slice(0, 3).forEach((s, idx) => {
                        console.log(`  ${idx + 1}. ID: ${s.id} | Title: ${s.title} | CreatedBy: ${s.createdBy}`);
                    });
                }

                const myServices = allServices.filter(s => s.createdBy === user.uid);
                console.log(`\n🎯 Filtered services for provider (${user.uid}):`, myServices.length);

                if (myServices.length > 0) {
                    console.log('✅ My services:');
                    myServices.forEach((s, idx) => {
                        console.log(`  ${idx + 1}. ${s.title} (ID: ${s.id})`);
                    });
                } else {
                    console.log('⚠️ No services found for this provider');
                }

                setServices(myServices);

                // Update stats with service count first
                setStats(prev => ({
                    ...prev,
                    totalServices: myServices.length,
                }));

                // 2. Get Bookings for this provider
                console.log('\n📅 Fetching bookings for provider...');
                console.log('🔍 Query filter: { providerId:', user.uid, '}');

                try {
                    const { success: bookingSuccess, bookings: providerBookings } = await getBookings({
                        providerId: user.uid
                    });

                    console.log('📊 Booking query result:');
                    console.log('  Success:', bookingSuccess);
                    console.log('  Bookings count:', providerBookings?.length || 0);

                    let pendingCount = 0;
                    let completedCount = 0;
                    let earnings = 0;

                    if (bookingSuccess && providerBookings) {
                        console.log('\n📋 Processing bookings...');

                        if (providerBookings.length === 0) {
                            console.log('⚠️ No bookings found for this provider');
                        } else {
                            console.log(`✅ Found ${providerBookings.length} booking(s):`);

                            providerBookings.forEach((booking, idx) => {
                                console.log(`\n  Booking ${idx + 1}:`)
                                    ;
                                console.log('    ID:', booking.id);
                                console.log('    Service:', booking.serviceName);
                                console.log('    Status:', booking.status);
                                console.log('    Price: Rs.', booking.price.toLocaleString());
                                console.log('    ProviderId:', booking.providerId);
                                console.log('    UserId:', booking.userId);
                                console.log('    Date:', booking.date);

                                if (booking.status === 'pending') {
                                    pendingCount++;
                                    console.log('    ✅ Counted as PENDING');
                                }
                                if (booking.status === 'completed') {
                                    completedCount++;
                                    earnings += booking.price;
                                    console.log('    💰 Counted as COMPLETED - Added Rs.', booking.price.toLocaleString(), 'to earnings');
                                }
                            });
                        }
                    }

                    console.log('\n📊 Final Stats Calculation:');
                    console.log('  Total Services:', myServices.length);
                    console.log('  Pending Bookings:', pendingCount);
                    console.log('  Completed Bookings:', completedCount);
                    console.log('  Total Earnings: Rs.', earnings.toLocaleString(), `(from ${completedCount} completed booking${completedCount !== 1 ? 's' : ''})`);

                    setStats({
                        totalServices: myServices.length,
                        pendingBookings: pendingCount,
                        completedBookings: completedCount,
                        totalEarnings: earnings,
                    });
                } catch (bookingError: any) {
                    console.error('\n❌ Error loading bookings:');
                    console.error('  Message:', bookingError?.message || 'Unknown error');
                    console.error('  Code:', bookingError?.code);
                    console.error('  Full error:', bookingError);
                    // Stats already updated with service count, just keep default values for bookings
                }
            } else {
                console.log('❌ Failed to fetch services or no services returned');
            }
        } catch (error: any) {
            console.error('\n❌ Error loading provider data:');
            console.error('  Message:', error?.message);
            console.error('  Stack:', error?.stack);
            // Set empty state on error
            setServices([]);
            setStats({
                totalServices: 0,
                pendingBookings: 0,
                completedBookings: 0,
                totalEarnings: 0,
            });
        } finally {
            setLoading(false);
            console.log('🔍 ===== PROVIDER DASHBOARD DATA LOAD END =====\n');
        }
    };

    const onRefresh = async () => {
        console.log('🔄 Pull to refresh triggered');
        setRefreshing(true);

        // Update past bookings status before reloading
        try {
            await updatePastBookingsStatus();
        } catch (error) {
            console.log('Could not auto-update past bookings');
        }

        await loadData();
        setRefreshing(false);
    };

    if (loading && !refreshing) {
        return <Loader fullScreen text="Loading dashboard..." />;
    }

    return (
        <View className="flex-1" style={{ backgroundColor: '#F9FAFB' }}>
            {/* Header */}
            <View className="bg-primary pt-12 pb-6 px-6">
                <View className="flex-row items-center justify-between mb-4">
                    <View>
                        <Text className="text-white text-2xl font-bold">Welcome!</Text>
                        <Text className="text-white/80 text-sm mt-1">Hi, {userProfile?.name}</Text>
                    </View>
                    <View className="bg-white/30 px-5 py-2.5 rounded-full" style={styles.glassmorphism}>
                        <Text className="text-white text-xs font-bold uppercase tracking-wider">Provider</Text>
                    </View>
                </View>
                <Text className="text-white/95 text-base font-medium">
                    Manage your services and track your bookings
                </Text>
            </View>

            <ScrollView
                className="flex-1 mt-4"
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >


                {/* Stats Grid with Glassmorphism */}
                <View className="px-6  mb-6">
                    {/* First Row - Service Status Breakdown */}
                    <View className="flex-row gap-3 mb-3">
                        {/* Pending Approval */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate('UserServices')}
                            style={styles.statCard}
                            className="flex-1"
                        >
                            <View style={[styles.iconContainer, { backgroundColor: '#FEF3C7' }]}>
                                <Ionicons name="time" size={22} color="#F59E0B" />
                            </View>
                            <Text className="text-2xl font-bold text-gray-900 mt-2">
                                {services.filter(s => s.status === 'pending').length}
                            </Text>
                            <Text className="text-gray-600 text-xs font-medium">Pending Approval</Text>
                        </TouchableOpacity>

                        {/* Approved Services */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate('UserServices')}
                            style={styles.statCard}
                            className="flex-1"
                        >
                            <View style={[styles.iconContainer, { backgroundColor: '#D1FAE5' }]}>
                                <Ionicons name="checkmark-circle" size={22} color="#10B981" />
                            </View>
                            <Text className="text-2xl font-bold text-gray-900 mt-2">
                                {services.filter(s => s.status === 'approved').length}
                            </Text>
                            <Text className="text-gray-600 text-xs font-medium">Approved</Text>
                        </TouchableOpacity>

                        {/* Rejected Services */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate('UserServices')}
                            style={styles.statCard}
                            className="flex-1"
                        >
                            <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
                                <Ionicons name="close-circle" size={22} color="#EF4444" />
                            </View>
                            <Text className="text-2xl font-bold text-gray-900 mt-2">
                                {services.filter(s => s.status === 'rejected').length}
                            </Text>
                            <Text className="text-gray-600 text-xs font-medium">Rejected</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Second Row - Bookings & Earnings */}
                    <View className="flex-row gap-3">
                        {/* Pending Jobs Card */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate('ProviderBookings')}
                            style={styles.statCard}
                            className="flex-1"
                        >
                            <View style={[styles.iconContainer, { backgroundColor: '#FFEDD5' }]}>
                                <Ionicons name="calendar" size={22} color="#F97316" />
                            </View>
                            <Text className="text-2xl font-bold text-gray-900 mt-2">{stats.pendingBookings}</Text>
                            <Text className="text-gray-600 text-xs font-medium">Pending Jobs</Text>
                        </TouchableOpacity>

                        {/* Total Earnings Card */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate('ProviderBookings')}
                            style={styles.statCard}
                            className="flex-1"
                        >
                            <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
                                <Ionicons name="cash" size={22} color="#3B82F6" />
                            </View>
                            <Text className="text-xl font-bold text-gray-900 mt-2">
                                Rs. {stats.totalEarnings.toLocaleString()}
                            </Text>
                            <Text className="text-gray-600 text-xs font-medium">Total Earnings</Text>
                            <Text className="text-gray-500 text-[10px] mt-0.5">
                                {stats.completedBookings} completed
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Actions Section */}
                <View className="px-6 mb-6">
                    <Text className="text-gray-900 text-xl font-bold mb-4">Quick Actions</Text>
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={() => navigation.navigate('AddService')}
                            style={styles.actionButton}
                            className="flex-1"
                        >
                            <View style={[styles.actionIconContainer, { backgroundColor: '#EEF2FF' }]}>
                                <Ionicons name="add-circle" size={24} color="#6366F1" />
                            </View>
                            <Text className="text-gray-900 text-sm font-bold mt-2">Add Service</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => navigation.navigate('Bookings')}
                            style={styles.actionButton}
                            className="flex-1"
                        >
                            <View style={[styles.actionIconContainer, { backgroundColor: '#FEF3C7' }]}>
                                <Ionicons name="calendar" size={24} color="#F59E0B" />
                            </View>
                            <Text className="text-gray-900 text-sm font-bold mt-2">View Bookings</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => navigation.navigate('Profile')}
                            style={styles.actionButton}
                            className="flex-1"
                        >
                            <View style={[styles.actionIconContainer, { backgroundColor: '#FCE7F3' }]}>
                                <Ionicons name="person" size={24} color="#EC4899" />
                            </View>
                            <Text className="text-gray-900 text-sm font-bold mt-2">My Profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* My Services Preview */}
                <View className="px-6 pb-8">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-gray-900 text-xl font-bold">My Services</Text>
                        {services.length > 0 && (
                            <TouchableOpacity onPress={() => navigation.navigate('UserServices')}>
                                <Text className="text-blue-600 text-sm font-bold">See All →</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {services.length === 0 ? (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconContainer}>
                                <Ionicons name="briefcase-outline" size={48} color="#9CA3AF" />
                            </View>
                            <Text className="text-gray-900 text-xl font-bold mb-2">No Services Yet</Text>
                            <Text className="text-gray-600 text-base text-center mb-6 px-4">
                                Start by adding your first service to get booked by customers!
                            </Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('AddService')}
                                style={styles.primaryButton}
                            >
                                <Ionicons name="add-circle-outline" size={20} color="white" style={{ marginRight: 8 }} />
                                <Text className="text-white font-bold text-base">Add Your First Service</Text>
                            </TouchableOpacity>
                        </View>
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
        </View>
    );
};

const styles = StyleSheet.create({
    glassmorphism: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    statCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    actionButton: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    actionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyState: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    emptyIconContainer: {
        width: 96,
        height: 96,
        backgroundColor: '#F3F4F6',
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    primaryButton: {
        backgroundColor: '#7C3AED',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
});

export default ProviderDashboardScreen;
