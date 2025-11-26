import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getAnalytics, PlatformAnalytics } from '../../firebase/admin';

const AdminDashboardScreen: React.FC = () => {
    const { userProfile } = useAuth();
    const navigation = useNavigation();
    const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadAnalytics = async () => {
        const { success, analytics: data } = await getAnalytics();
        if (success && data) {
            setAnalytics(data);
        }
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        loadAnalytics();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadAnalytics();
    };

    const StatCard = ({ icon, title, value, color, showChevron, onPress }: any) => {
        const CardContent = (
            <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                        <View className={`w-12 h-12 rounded-full items-center justify-center`} style={{ backgroundColor: color + '20' }}>
                            <Ionicons name={icon} size={24} color={color} />
                        </View>
                        <View className="ml-3 flex-1">
                            <Text className="text-gray-500 text-xs font-medium">{title}</Text>
                            <Text className="text-gray-900 text-2xl font-bold mt-1">{value}</Text>
                        </View>
                    </View>
                    {showChevron && (
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    )}
                </View>
            </View>
        );

        if (onPress) {
            return (
                <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                    {CardContent}
                </TouchableOpacity>
            );
        }

        return CardContent;
    };

    const QuickActionCard = ({ icon, title, subtitle, color, onPress }: any) => (
        <TouchableOpacity
            onPress={onPress}
            className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
        >
            <View className="flex-row items-center">
                <View className={`w-12 h-12 rounded-full items-center justify-center`} style={{ backgroundColor: color + '20' }}>
                    <Ionicons name={icon} size={24} color={color} />
                </View>
                <View className="ml-3 flex-1">
                    <Text className="text-gray-900 text-base font-bold">{title}</Text>
                    <Text className="text-gray-500 text-xs mt-1">{subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-gray-50">
            {/* Fixed Header Section */}
            <View className="bg-primary pt-12 pb-6 px-6">
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-white text-2xl font-bold">Admin Dashboard</Text>
                        <Text className="text-white/80 text-sm mt-1">Welcome back, {userProfile?.name}!</Text>
                    </View>
                    <View className="bg-white/20 px-3 py-1.5 rounded-full">
                        <Text className="text-white text-xs font-bold">ADMIN</Text>
                    </View>
                </View>
            </View>

            {/* Scrollable Content */}
            <ScrollView
                className="flex-1 px-6"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Platform Statistics */}
                <View className="mb-6">
                    <Text className="text-gray-900 text-lg font-bold mb-3">Platform Overview</Text>

                    {loading ? (
                        <Text className="text-gray-500 text-center py-8">Loading statistics...</Text>
                    ) : analytics ? (
                        <>
                            <StatCard
                                icon="people"
                                title="Total Users"
                                value={analytics.totalUsers}
                                color="#6366F1"
                                showChevron={true}
                                onPress={() => navigation.navigate('UserList')}
                            />
                            <StatCard
                                icon="briefcase"
                                title="Total Services"
                                value={analytics.totalServices}
                                color="#10B981"
                                showChevron={true}
                                onPress={() => navigation.navigate('ServicesList')}
                            />
                            <StatCard
                                icon="calendar"
                                title="Total Bookings"
                                value={analytics.totalBookings}
                                color="#F59E0B"
                                showChevron={true}
                                onPress={() => navigation.navigate('Bookings')}
                            />
                            <StatCard
                                icon="time"
                                title="Pending Approvals"
                                value={analytics.pendingServices}
                                color="#EF4444"
                            />
                        </>
                    ) : (
                        <Text className="text-gray-500 text-center py-8">Failed to load statistics</Text>
                    )}
                </View>

                {/* Quick Actions */}
                <View className="mb-6">
                    <Text className="text-gray-900 text-lg font-bold mb-3">Quick Actions</Text>

                    <QuickActionCard
                        icon="people-outline"
                        title="Manage Users"
                        subtitle="View and manage all users"
                        color="#6366F1"
                        onPress={() => navigation.navigate('UserList')}
                    />
                    <QuickActionCard
                        icon="briefcase-outline"
                        title="Manage Providers"
                        subtitle="View and manage service providers"
                        color="#8B5CF6"
                        onPress={() => navigation.navigate('ProviderList')}
                    />
                    <QuickActionCard
                        icon="checkmark-circle-outline"
                        title="Approve Services"
                        subtitle={`${analytics?.pendingServices || 0} pending approval`}
                        color="#10B981"
                        onPress={() => navigation.navigate('ServiceApproval')}
                    />
                    <QuickActionCard
                        icon="calendar-outline"
                        title="View All Bookings"
                        subtitle="Manage platform bookings"
                        color="#F59E0B"
                        onPress={() => navigation.navigate('Bookings')}
                    />
                    <QuickActionCard
                        icon="stats-chart-outline"
                        title="Analytics"
                        subtitle="View detailed reports"
                        color="#8B5CF6"
                        onPress={() => {/* Navigate to Analytics */ }}
                    />
                </View>

                {/* Role Breakdown */}
                {analytics && (
                    <View className="mb-6">
                        <Text className="text-gray-900 text-lg font-bold mb-3">User Roles</Text>
                        <View className="bg-white rounded-2xl p-4 shadow-sm">
                            <View className="flex-row justify-between items-center mb-3">
                                <Text className="text-gray-600 text-sm">Admins</Text>
                                <Text className="text-gray-900 text-base font-bold">{analytics.totalAdmins}</Text>
                            </View>
                            <View className="flex-row justify-between items-center mb-3">
                                <Text className="text-gray-600 text-sm">Providers</Text>
                                <Text className="text-gray-900 text-base font-bold">{analytics.totalProviders}</Text>
                            </View>
                            <View className="flex-row justify-between items-center">
                                <Text className="text-gray-600 text-sm">Regular Users</Text>
                                <Text className="text-gray-900 text-base font-bold">{analytics.totalRegularUsers}</Text>
                            </View>
                        </View>
                    </View>
                )}

                <View className="h-6" />
            </ScrollView>
        </View>
    );
};

export default AdminDashboardScreen;
