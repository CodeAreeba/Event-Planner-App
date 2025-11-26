import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ServiceCard from '../../components/cards/ServiceCard';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/ui/EmptyState';
import { getUserProfile } from '../../firebase/auth';
import { getAllServices } from '../../firebase/services';
import { blockUser, unblockUser } from '../../services/userService';
import { AppStackNavigationProp, AppStackParamList } from '../../types/navigation';
import { Service } from '../../types/service';
import { UserProfile } from '../../types/user';

type ProviderDetailsRouteProp = RouteProp<AppStackParamList, 'ProviderDetails'>;

const ProviderDetailsScreen: React.FC = () => {
    const navigation = useNavigation<AppStackNavigationProp>();
    const route = useRoute<ProviderDetailsRouteProp>();
    const { providerId } = route.params;

    const [provider, setProvider] = useState<UserProfile | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadProviderData = async () => {
        setLoading(true);

        // Load provider profile
        const { success: profileSuccess, profile } = await getUserProfile(providerId);
        if (profileSuccess && profile) {
            setProvider(profile);
        }

        // Load provider's services
        const { success: servicesSuccess, services: allServices } = await getAllServices();
        if (servicesSuccess && allServices) {
            const providerServices = allServices.filter(s => s.providerId === providerId);
            setServices(providerServices);
        }

        setLoading(false);
    };

    useEffect(() => {
        loadProviderData();
    }, [providerId]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadProviderData();
        setRefreshing(false);
    };

    const handleBlock = () => {
        if (!provider) return;

        Alert.alert(
            'Block Provider',
            `Are you sure you want to block ${provider.name}? They will not be able to access the app.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Block',
                    style: 'destructive',
                    onPress: async () => {
                        const { success } = await blockUser(provider.uid);
                        if (success) {
                            Alert.alert('Success', 'Provider blocked successfully');
                            await loadProviderData();
                        } else {
                            Alert.alert('Error', 'Failed to block provider');
                        }
                    },
                },
            ]
        );
    };

    const handleUnblock = () => {
        if (!provider) return;

        Alert.alert(
            'Unblock Provider',
            `Are you sure you want to unblock ${provider.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Unblock',
                    onPress: async () => {
                        const { success } = await unblockUser(provider.uid);
                        if (success) {
                            Alert.alert('Success', 'Provider unblocked successfully');
                            await loadProviderData();
                        } else {
                            Alert.alert('Error', 'Failed to unblock provider');
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return <LoadingState message="Loading provider details..." />;
    }

    if (!provider) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
                <Text className="text-gray-900 text-lg font-semibold">Provider Not Found</Text>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="mt-4 bg-primary px-6 py-3 rounded-lg"
                >
                    <Text className="text-white font-semibold">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const activeServices = services.filter(s => s.isActive && s.status === 'approved').length;
    const pendingServices = services.filter(s => s.status === 'pending').length;

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            {/* Header */}
            <View className="bg-primary pt-4 pb-6 px-6">
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center flex-1">
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="mr-3"
                        >
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white text-2xl font-bold">Provider Details</Text>
                    </View>
                    <View
                        className={`px-3 py-1.5 rounded-full ${provider.status === 'blocked' ? 'bg-red-500' : 'bg-white/20'
                            }`}
                    >
                        <Text className="text-white text-xs font-bold">
                            {provider.status === 'blocked' ? 'BLOCKED' : 'ACTIVE'}
                        </Text>
                    </View>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6 -mt-4"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Provider Info Card */}
                <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
                    <View className="flex-row items-center mb-4">
                        <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mr-4">
                            <Ionicons name="person" size={32} color="#6366F1" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-900 text-xl font-bold">{provider.name}</Text>
                            <Text className="text-gray-500 text-sm mt-1">{provider.email}</Text>
                        </View>
                    </View>

                    {provider.phone && (
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="call-outline" size={18} color="#6B7280" />
                            <Text className="text-gray-600 text-sm ml-2">{provider.phone}</Text>
                        </View>
                    )}

                    {provider.address && (
                        <View className="flex-row items-center">
                            <Ionicons name="location-outline" size={18} color="#6B7280" />
                            <Text className="text-gray-600 text-sm ml-2">{provider.address}</Text>
                        </View>
                    )}
                </View>

                {/* Statistics */}
                <View className="flex-row mb-4 gap-3">
                    <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
                        <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mb-2">
                            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                        </View>
                        <Text className="text-2xl font-bold text-gray-900">{activeServices}</Text>
                        <Text className="text-gray-500 text-xs">Active Services</Text>
                    </View>

                    <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
                        <View className="w-10 h-10 bg-yellow-100 rounded-full items-center justify-center mb-2">
                            <Ionicons name="time" size={20} color="#F59E0B" />
                        </View>
                        <Text className="text-2xl font-bold text-gray-900">{pendingServices}</Text>
                        <Text className="text-gray-500 text-xs">Pending</Text>
                    </View>

                    <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
                        <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mb-2">
                            <Ionicons name="briefcase" size={20} color="#3B82F6" />
                        </View>
                        <Text className="text-2xl font-bold text-gray-900">{services.length}</Text>
                        <Text className="text-gray-500 text-xs">Total Services</Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row mb-6 gap-3">
                    {provider.status !== 'blocked' ? (
                        <TouchableOpacity
                            onPress={handleBlock}
                            className="flex-1 bg-red-500 rounded-xl py-3.5 items-center"
                        >
                            <Text className="text-white font-semibold">Block Provider</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={handleUnblock}
                            className="flex-1 bg-green-500 rounded-xl py-3.5 items-center"
                        >
                            <Text className="text-white font-semibold">Unblock Provider</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Provider Services */}
                <View className="mb-6">
                    <Text className="text-gray-900 text-lg font-bold mb-3">Provider Services</Text>
                    {services.length === 0 ? (
                        <EmptyState
                            icon="briefcase-outline"
                            title="No Services"
                            description="This provider hasn't created any services yet"
                        />
                    ) : (
                        services.map((service) => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                onPress={() => navigation.navigate('ServiceDetails', { serviceId: service.id! })}
                                showActions={false}
                            />
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ProviderDetailsScreen;
