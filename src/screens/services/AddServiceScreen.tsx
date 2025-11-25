import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ServiceForm from '../../components/forms/ServiceForm';
import { useAuth } from '../../context/AuthContext';
import { createService } from '../../firebase/services';
import { AppStackNavigationProp } from '../../types/navigation';
import { ServiceFormData } from '../../types/service';

const AddServiceScreen: React.FC = () => {
    const navigation = useNavigation<AppStackNavigationProp>();
    const { isAdmin, userProfile, user } = useAuth();

    // Role-based access control - Admin and Provider only
    const canAddService = isAdmin || userProfile?.role === 'provider';

    useEffect(() => {
        if (!canAddService) {
            Alert.alert(
                'Access Denied',
                'Only administrators and service providers can add services.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        }
    }, [canAddService]);

    const handleSubmit = async (data: ServiceFormData) => {
        const { success, error } = await createService(data, user?.uid);

        if (success) {
            Alert.alert('Success', 'Service created successfully', [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]);
        } else {
            Alert.alert('Error', error || 'Failed to create service');
        }
    };

    // Show access denied message if not authorized
    if (!canAddService) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
                <Text className="text-gray-900 text-lg font-semibold">Access Denied</Text>
                <Text className="text-gray-600 text-sm mt-2">Only administrators and service providers can add services.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ServiceForm onSubmit={handleSubmit} submitButtonText="Create Service" />
        </SafeAreaView>
    );
};

export default AddServiceScreen;
