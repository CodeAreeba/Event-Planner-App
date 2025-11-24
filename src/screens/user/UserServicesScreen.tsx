import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ServiceCard from '../../components/cards/ServiceCard';
import EmptyState from '../../components/ui/EmptyState';
import Loader from '../../components/ui/Loader';
import { subscribeToServices } from '../../firebase/services';
import { AppStackNavigationProp } from '../../types/navigation';
import { Service } from '../../types/service';

const UserServicesScreen: React.FC = () => {
    const navigation = useNavigation<AppStackNavigationProp>();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        // Subscribe to real-time updates for active services only (user view)
        const unsubscribe = subscribeToServices(
            (fetchedServices) => {
                setServices(fetchedServices);
                setLoading(false);
                setRefreshing(false);
            },
            true // Show only active services
        );

        return () => unsubscribe();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        // Real-time listener will automatically update
    };

    const handleServicePress = (serviceId: string) => {
        navigation.navigate('ServiceDetails', { serviceId });
    };

    if (loading) {
        return <Loader fullScreen text="Loading services..." />;
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Fixed Header */}
            <View className="bg-primary pt-4 pb-6 px-6">
                <Text className="text-white text-2xl font-bold">Available Services</Text>
                <Text className="text-white/80 text-sm mt-1">Browse and book our services</Text>
            </View>

            {/* Scrollable Services List */}
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View className="px-6 pt-4">
                    {services.length === 0 ? (
                        <EmptyState
                            icon="briefcase-outline"
                            title="No Services Available"
                            description="Check back later for available services"
                        />
                    ) : (
                        services.map((service) => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                onPress={() => handleServicePress(service.id!)}
                                showActions={false}
                                showStatus={false}
                            />
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default UserServicesScreen;
