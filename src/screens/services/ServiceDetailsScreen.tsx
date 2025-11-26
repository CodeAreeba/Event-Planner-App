import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getServiceById } from '../../firebase/services';
import { AppStackNavigationProp, AppStackParamList } from '../../types/navigation';
import { Service } from '../../types/service';

type ServiceDetailsRouteProp = RouteProp<AppStackParamList, 'ServiceDetails'>;

const ServiceDetailsScreen: React.FC = () => {
    const navigation = useNavigation<AppStackNavigationProp>();
    const route = useRoute<ServiceDetailsRouteProp>();
    const { serviceId } = route.params;

    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadService();
    }, [serviceId]);

    const loadService = async () => {
        setLoading(true);
        setError(null);

        const { success, service: fetchedService, error: fetchError } = await getServiceById(serviceId);

        if (success && fetchedService) {
            setService(fetchedService);
        } else {
            setError(fetchError || 'Failed to load service');
        }

        setLoading(false);
    };

    const handleBookNow = () => {
        if (service) {
            navigation.navigate('CreateBooking', { serviceId: service.id });
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#6366F1" />
                <Text className="text-gray-600 mt-4">Loading service details...</Text>
            </SafeAreaView>
        );
    }

    if (error || !service) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center px-6">
                <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                <Text className="text-gray-900 text-xl font-bold mt-4">Error</Text>
                <Text className="text-gray-600 text-center mt-2">{error || 'Service not found'}</Text>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="mt-6 bg-primary px-6 py-3 rounded-xl"
                >
                    <Text className="text-white font-semibold">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Hero Section with Gradient */}
                <View className="bg-primary pt-8 pb-12 px-6">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="mb-4"
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-3xl font-bold mb-2">{service.title}</Text>
                    <View className="flex-row items-center">
                        <Ionicons name="cash-outline" size={20} color="white" />
                        <Text className="text-white text-2xl font-bold ml-2">PKR {service.price.toLocaleString()}</Text>
                    </View>
                </View>

                {/* Service Details Card */}
                <View className="px-6 -mt-6">
                    <View className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                        {/* Description */}
                        <View className="mb-6">
                            <View className="flex-row items-center mb-3">
                                <Ionicons name="document-text-outline" size={20} color="#6366F1" />
                                <Text className="text-gray-900 text-lg font-bold ml-2">Description</Text>
                            </View>
                            <Text className="text-gray-600 leading-6">{service.description}</Text>
                        </View>

                        {/* Duration */}
                        <View className="mb-6">
                            <View className="flex-row items-center mb-2">
                                <Ionicons name="time-outline" size={20} color="#6366F1" />
                                <Text className="text-gray-900 text-lg font-bold ml-2">Duration</Text>
                            </View>
                            <Text className="text-gray-600">{service.duration} minutes</Text>
                        </View>

                        {/* Service Status */}
                        <View className="flex-row items-center">
                            <View className={`px-3 py-1 rounded-full ${service.isActive ? 'bg-green-100' : 'bg-red-100'}`}>
                                <Text className={`text-xs font-semibold ${service.isActive ? 'text-green-700' : 'text-red-700'}`}>
                                    {service.isActive ? 'Available' : 'Unavailable'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Additional Info Card */}
                    <View className="bg-blue-50 rounded-2xl p-6 mb-6 border border-blue-100">
                        <View className="flex-row items-start">
                            <Ionicons name="information-circle" size={24} color="#3B82F6" />
                            <View className="flex-1 ml-3">
                                <Text className="text-blue-900 font-semibold mb-1">Booking Information</Text>
                                <Text className="text-blue-700 text-sm">
                                    Click "Book Now" to schedule this service. You'll be able to select your preferred date and time.
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Fixed Bottom Button */}
            <View className="bg-white border-t border-gray-200 px-6 py-4">
                <TouchableOpacity
                    onPress={handleBookNow}
                    disabled={!service.isActive}
                    className={`${service.isActive ? 'bg-primary' : 'bg-gray-400'} rounded-xl py-4 flex-row items-center justify-center shadow-lg`}
                    activeOpacity={0.8}
                >
                    <Ionicons name="calendar" size={20} color="white" />
                    <Text className="text-white text-lg font-bold ml-2">
                        {service.isActive ? 'Book Now' : 'Currently Unavailable'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default ServiceDetailsScreen;
