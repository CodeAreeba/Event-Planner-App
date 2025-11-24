import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import ServiceCard from '../../components/cards/ServiceCard';
import SearchInput from '../../components/inputs/SearchInput';
import EmptyState from '../../components/ui/EmptyState';
import Loader from '../../components/ui/Loader';
import { CATEGORIES } from '../../constants/categories';
import { useAuth } from '../../context/AuthContext';
import { getActiveServices, Service } from '../../firebase/services';
import { AppStackNavigationProp } from '../../types/navigation';
import AdminDashboardScreen from '../admin/AdminDashboardScreen';

const HomeScreen: React.FC = () => {
    const navigation = useNavigation<AppStackNavigationProp>();
    const { userProfile, isAdmin } = useAuth();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadData();
    }, [isAdmin]);

    const loadData = async () => {
        setLoading(true);

        // Load active services for all users
        const { success, services: fetchedServices } = await getActiveServices();
        if (success && fetchedServices) {
            setServices(fetchedServices);
        }

        setLoading(false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleCategoryPress = (categoryId: string) => {
        navigation.navigate('Search');
    };

    const handleServicePress = (serviceId: string) => {
        navigation.navigate('ServiceDetails', { serviceId });
    };

    if (loading) {
        return <Loader fullScreen text="Loading..." />;
    }

    // Admin Dashboard View
    if (isAdmin) {
        return <AdminDashboardScreen />;
    }

    // Regular User Dashboard View
    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: '#F9FAFB' }}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Header */}
            <View className="bg-primary pt-12 pb-8 px-6 rounded-b-3xl">
                <Text className="text-white text-3xl font-bold mb-2">
                    Event Planner
                </Text>
                <Text className="text-white/80 text-base mb-4">
                    Find the perfect services for your event
                </Text>
                <SearchInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search services..."
                    onFocus={() => navigation.navigate('Search')}
                />
            </View>

            {/* Categories */}
            <View className="px-6 mt-6">
                <Text className="text-gray-900 text-xl font-bold mb-4">
                    Categories
                </Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mb-6"
                >
                    {CATEGORIES.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            onPress={() => handleCategoryPress(category.id)}
                            className="bg-white rounded-2xl p-4 mr-4 items-center shadow-sm"
                            style={{ width: 100 }}
                        >
                            <View
                                className="w-12 h-12 rounded-full items-center justify-center mb-2"
                                style={{ backgroundColor: category.color + '20' }}
                            >
                                <Text className="text-2xl">{category.icon}</Text>
                            </View>
                            <Text className="text-gray-900 text-xs font-semibold text-center">
                                {category.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Featured Services */}
            <View className="px-6 mb-6">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-gray-900 text-xl font-bold">
                        Featured Services
                    </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                        <Text className="text-primary text-sm font-semibold">See All</Text>
                    </TouchableOpacity>
                </View>

                {services.length === 0 ? (
                    <EmptyState
                        icon="briefcase-outline"
                        title="No Services Available"
                        description="Check back later for available services"
                    />
                ) : (
                    services.slice(0, 5).map((service) => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            onPress={() => handleServicePress(service.id!)}
                        />
                    ))
                )}
            </View>
        </ScrollView>
    );
};

export default HomeScreen;
