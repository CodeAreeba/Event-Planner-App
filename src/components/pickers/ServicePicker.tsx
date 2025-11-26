import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { getActiveServices } from '../../firebase/services';
import { Service } from '../../types/service';

interface ServicePickerProps {
    selectedServiceId?: string;
    onSelectService: (service: Service) => void;
    error?: string;
}

const ServicePicker: React.FC<ServicePickerProps> = ({
    selectedServiceId,
    onSelectService,
    error,
}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [services, setServices] = useState<Service[]>([]);
    const [filteredServices, setFilteredServices] = useState<Service[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    useEffect(() => {
        if (modalVisible) {
            loadServices();
        }
    }, [modalVisible]);

    useEffect(() => {
        if (selectedServiceId && services.length > 0) {
            const service = services.find(s => s.id === selectedServiceId);
            if (service) {
                setSelectedService(service);
            }
        }
    }, [selectedServiceId, services]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredServices(services);
        } else {
            const filtered = services.filter(service =>
                service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                service.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredServices(filtered);
        }
    }, [searchQuery, services]);

    const loadServices = async () => {
        setLoading(true);
        const { success, services: fetchedServices } = await getActiveServices();
        if (success && fetchedServices) {
            setServices(fetchedServices);
            setFilteredServices(fetchedServices);
        }
        setLoading(false);
    };

    const handleSelectService = (service: Service) => {
        setSelectedService(service);
        onSelectService(service);
        setModalVisible(false);
        setSearchQuery('');
    };

    return (
        <View className="mb-4">
            <Text className="text-gray-700 text-sm font-semibold mb-2">
                Select Service <Text className="text-red-500">*</Text>
            </Text>

            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className={`flex-row items-center bg-white rounded-xl px-4 py-3 border ${error ? 'border-red-500' : 'border-gray-200'}`}
            >
                <Ionicons name="briefcase-outline" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
                <Text className={`flex-1 text-sm ${selectedService ? 'text-gray-900' : 'text-gray-400'}`}>
                    {selectedService ? selectedService.title : 'Select a service'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {error && (
                <Text className="text-red-500 text-xs mt-1">{error}</Text>
            )}

            {selectedService && (
                <View className="mt-2 bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <View className="flex-row justify-between items-center mb-1">
                        <Text className="text-blue-900 font-semibold">Selected Service</Text>
                        <Text className="text-blue-700 font-bold">PKR {selectedService.price.toLocaleString()}</Text>
                    </View>
                    <Text className="text-blue-600 text-xs">{selectedService.duration} minutes</Text>
                </View>
            )}

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl h-4/5">
                        {/* Header */}
                        <View className="flex-row items-center justify-between p-6 border-b border-gray-200">
                            <Text className="text-gray-900 text-xl font-bold">Select Service</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={28} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {/* Search Bar */}
                        <View className="px-6 py-4">
                            <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
                                <Ionicons name="search" size={20} color="#9CA3AF" />
                                <TextInput
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    placeholder="Search services..."
                                    className="flex-1 ml-2 text-gray-900"
                                    placeholderTextColor="#9CA3AF"
                                />
                                {searchQuery.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                                        <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Services List */}
                        {loading ? (
                            <View className="flex-1 justify-center items-center">
                                <ActivityIndicator size="large" color="#6366F1" />
                                <Text className="text-gray-600 mt-4">Loading services...</Text>
                            </View>
                        ) : (
                            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                                {filteredServices.length === 0 ? (
                                    <View className="py-12 items-center">
                                        <Ionicons name="search-outline" size={48} color="#D1D5DB" />
                                        <Text className="text-gray-500 mt-4">No services found</Text>
                                    </View>
                                ) : (
                                    filteredServices.map((service) => (
                                        <TouchableOpacity
                                            key={service.id}
                                            onPress={() => handleSelectService(service)}
                                            className={`mb-3 p-4 rounded-xl border ${selectedService?.id === service.id
                                                ? 'bg-primary/10 border-primary'
                                                : 'bg-white border-gray-200'
                                                }`}
                                            activeOpacity={0.7}
                                        >
                                            <View className="flex-row justify-between items-start mb-2">
                                                <Text className={`flex-1 font-bold text-base ${selectedService?.id === service.id
                                                    ? 'text-primary'
                                                    : 'text-gray-900'
                                                    }`}>
                                                    {service.title}
                                                </Text>
                                                {selectedService?.id === service.id && (
                                                    <Ionicons name="checkmark-circle" size={24} color="#6366F1" />
                                                )}
                                            </View>
                                            <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
                                                {service.description}
                                            </Text>
                                            <View className="flex-row items-center justify-between">
                                                <View className="flex-row items-center">
                                                    <Ionicons name="cash-outline" size={16} color="#6366F1" />
                                                    <Text className="text-primary font-bold ml-1">
                                                        PKR {service.price.toLocaleString()}
                                                    </Text>
                                                </View>
                                                <View className="flex-row items-center">
                                                    <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                                                    <Text className="text-gray-500 text-sm ml-1">
                                                        {service.duration} min
                                                    </Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    ))
                                )}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ServicePicker;
