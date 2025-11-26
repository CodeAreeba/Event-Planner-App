import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ServiceForm from '../../components/forms/ServiceForm';
import Loader from '../../components/ui/Loader';
import { useAuth } from '../../context/AuthContext';
import { getServiceById, updateService } from '../../firebase/services';
import { AppStackNavigationProp, AppStackParamList } from '../../types/navigation';
import { Service, ServiceFormData } from '../../types/service';

type EditServiceRouteProp = RouteProp<AppStackParamList, 'EditService'>;

const EditServiceScreen: React.FC = () => {
    const navigation = useNavigation<AppStackNavigationProp>();
    const route = useRoute<EditServiceRouteProp>();
    const { serviceId } = route.params;
    const { isAdmin } = useAuth();

    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);

    // Role-based access control - Admin only
    useEffect(() => {
        if (!isAdmin) {
            Alert.alert(
                'Access Denied',
                'Only administrators can edit services.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        }
    }, [isAdmin]);

    useEffect(() => {
        if (isAdmin) {
            loadService();
        }
    }, [serviceId, isAdmin]);

    const loadService = async () => {
        const { success, service: fetchedService, error } = await getServiceById(serviceId);
        if (success && fetchedService) {
            setService(fetchedService);
        } else {
            Alert.alert('Error', error || 'Failed to load service');
            navigation.goBack();
        }
        setLoading(false);
    };

    const handleSubmit = async (data: ServiceFormData) => {
        const { success, error } = await updateService(serviceId, data);

        if (success) {
            Alert.alert('Success', 'Service updated successfully', [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]);
        } else {
            Alert.alert('Error', error || 'Failed to update service');
        }
    };

    // Show access denied message if not admin
    if (!isAdmin) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
                <Text className="text-gray-900 text-lg font-semibold">Access Denied</Text>
                <Text className="text-gray-600 text-sm mt-2">Only administrators can edit services.</Text>
            </SafeAreaView>
        );
    }

    if (loading) {
        return <Loader fullScreen text="Loading service..." />;
    }

    if (!service) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <Text className="text-gray-900 text-lg">Service not found</Text>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ServiceForm
                initialValues={{
                    title: service.title || service.name || '', // Use title, fallback to name, then empty string
                    description: service.description,
                    price: service.price,
                    duration: service.duration,
                    category: service.category,
                }}
                onSubmit={handleSubmit}
                submitButtonText="Update Service"
            />
        </SafeAreaView>
    );
};

export default EditServiceScreen;
