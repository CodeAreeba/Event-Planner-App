import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ServiceCard from '../../components/cards/ServiceCard';
import EmptyState from '../../components/ui/EmptyState';
import Loader from '../../components/ui/Loader';
import { useAuth } from '../../context/AuthContext';
import { deleteService, subscribeToServices } from '../../firebase/services';
import { AppStackNavigationProp } from '../../types/navigation';
import { Service } from '../../types/service';

const ServicesListScreen: React.FC = () => {
    const navigation = useNavigation<AppStackNavigationProp>();
    const { isAdmin } = useAuth();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Role-based access control - Admin only
    useEffect(() => {
        if (!isAdmin) {
            Alert.alert(
                'Access Denied',
                'Only administrators can access the services management screen.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        }
    }, [isAdmin]);

    useEffect(() => {
        if (!isAdmin) return;

        // Subscribe to real-time updates for all services (admin view)
        const unsubscribe = subscribeToServices(
            (fetchedServices) => {
                setServices(fetchedServices);
                setLoading(false);
                setRefreshing(false);
            },
            false // Show all services (active + inactive)
        );

        return () => unsubscribe();
    }, [isAdmin]);

    const onRefresh = () => {
        setRefreshing(true);
        // Real-time listener will automatically update
    };

    const handleEdit = (service: Service) => {
        navigation.navigate('EditService', { serviceId: service.id! });
    };

    const handleDelete = (service: Service) => {
        Alert.alert(
            'Delete Service',
            `Are you sure you want to delete "${service.title || service.name}"? This will make it inactive.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const { success, error } = await deleteService(service.id!);
                        if (success) {
                            Alert.alert('Success', 'Service deleted successfully');
                        } else {
                            Alert.alert('Error', error || 'Failed to delete service');
                        }
                    },
                },
            ]
        );
    };

    // Show access denied message if not admin
    if (!isAdmin) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
                <Text className="text-gray-900 text-lg font-semibold">Access Denied</Text>
                <Text className="text-gray-600 text-sm mt-2">Only administrators can access this screen.</Text>
            </SafeAreaView>
        );
    }

    if (loading) {
        return <Loader fullScreen text="Loading services..." />;
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Fixed Header with Add Service Button */}
            <View className="bg-white border-b border-gray-200 px-6 py-4">
                <Text className="text-gray-900 text-2xl font-bold mb-3">Services Management</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('AddService')}
                    className="bg-primary rounded-xl py-3 px-4 flex-row items-center justify-center"
                >
                    <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                    <Text className="text-white text-base font-bold ml-2">Add New Service</Text>
                </TouchableOpacity>
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
                            title="No Services Found"
                            description="Start by adding your first service"
                        />
                    ) : (
                        services.map((service) => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                onEdit={() => handleEdit(service)}
                                onDelete={() => handleDelete(service)}
                                showActions={true}
                                showStatus={true}
                            />
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ServicesListScreen;
