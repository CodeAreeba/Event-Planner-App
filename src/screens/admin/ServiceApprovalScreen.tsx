import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ServiceCard from '../../components/cards/ServiceCard';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { approveService, getAllServices, rejectService } from '../../firebase/admin';
import { AppStackNavigationProp } from '../../types/navigation';
import { Service } from '../../types/service';

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected';

const ServiceApprovalScreen: React.FC = () => {
    const navigation = useNavigation<AppStackNavigationProp>();
    const { userProfile } = useAuth();
    const [services, setServices] = useState<Service[]>([]);
    const [filteredServices, setFilteredServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState<FilterTab>('pending');
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const loadServices = async () => {
        setLoading(true);
        const { success, services: fetchedServices } = await getAllServices();
        if (success && fetchedServices) {
            setServices(fetchedServices);
            applyFilter(fetchedServices, activeFilter);
        }
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadServices();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadServices();
        setRefreshing(false);
    };

    const applyFilter = (serviceList: Service[], filter: FilterTab) => {
        let filtered = serviceList;

        switch (filter) {
            case 'pending':
                filtered = serviceList.filter((s) => s.status === 'pending');
                break;
            case 'approved':
                filtered = serviceList.filter((s) => s.status === 'approved');
                break;
            case 'rejected':
                filtered = serviceList.filter((s) => s.status === 'rejected');
                break;
            case 'all':
            default:
                // Show all services
                break;
        }

        setFilteredServices(filtered);
    };

    const handleFilterChange = (filter: FilterTab) => {
        setActiveFilter(filter);
        applyFilter(services, filter);
    };

    const handleApprove = (service: Service) => {
        Alert.alert(
            'Approve Service',
            `Are you sure you want to approve "${service.title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Approve',
                    onPress: async () => {
                        setActionLoading(true);
                        const { success } = await approveService(service.id!, userProfile!.uid);
                        setActionLoading(false);

                        if (success) {
                            Alert.alert('Success', 'Service approved successfully');
                            await loadServices();
                        } else {
                            Alert.alert('Error', 'Failed to approve service');
                        }
                    },
                },
            ]
        );
    };

    const handleRejectPress = (service: Service) => {
        setSelectedService(service);
        setRejectionReason('');
        setRejectModalVisible(true);
    };

    const handleRejectSubmit = async () => {
        if (!selectedService) return;

        if (!rejectionReason.trim()) {
            Alert.alert('Error', 'Please provide a reason for rejection');
            return;
        }

        setActionLoading(true);
        const { success } = await rejectService(selectedService.id!, rejectionReason.trim());
        setActionLoading(false);

        if (success) {
            setRejectModalVisible(false);
            Alert.alert('Success', 'Service rejected successfully');
            await loadServices();
        } else {
            Alert.alert('Error', 'Failed to reject service');
        }
    };

    const FilterButton = ({ filter, label, count }: { filter: FilterTab; label: string; count?: number }) => (
        <TouchableOpacity
            onPress={() => handleFilterChange(filter)}
            className={`px-4 py-2 rounded-full mr-2 ${activeFilter === filter ? 'bg-primary' : 'bg-white'
                }`}
        >
            <Text
                className={`text-sm font-semibold ${activeFilter === filter ? 'text-white' : 'text-gray-600'
                    }`}
            >
                {label} {count !== undefined && `(${count})`}
            </Text>
        </TouchableOpacity>
    );

    const ServiceApprovalCard = ({ service }: { service: Service }) => (
        <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
            <ServiceCard
                service={service}
                onPress={() => navigation.navigate('ServiceDetails', { serviceId: service.id! })}
                showActions={false}
            />

            {/* Approval Actions */}
            {service.status === 'pending' && (
                <View className="flex-row mt-3 gap-2">
                    <TouchableOpacity
                        onPress={() => handleApprove(service)}
                        disabled={actionLoading}
                        className="flex-1 bg-green-500 rounded-lg py-3 items-center"
                    >
                        <Text className="text-white font-semibold">Approve</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleRejectPress(service)}
                        disabled={actionLoading}
                        className="flex-1 bg-red-500 rounded-lg py-3 items-center"
                    >
                        <Text className="text-white font-semibold">Reject</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Status Badge */}
            {service.status !== 'pending' && (
                <View className="mt-3">
                    <View
                        className={`px-3 py-2 rounded-lg ${service.status === 'approved' ? 'bg-green-100' : 'bg-red-100'
                            }`}
                    >
                        <Text
                            className={`text-sm font-semibold text-center ${service.status === 'approved' ? 'text-green-700' : 'text-red-700'
                                }`}
                        >
                            {service.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                        </Text>
                        {service.rejectionReason && (
                            <Text className="text-red-600 text-xs mt-1 text-center">
                                Reason: {service.rejectionReason}
                            </Text>
                        )}
                    </View>
                </View>
            )}
        </View>
    );

    if (loading) {
        return <LoadingState message="Loading services..." />;
    }

    const pendingCount = services.filter((s) => s.status === 'pending').length;
    const approvedCount = services.filter((s) => s.status === 'approved').length;
    const rejectedCount = services.filter((s) => s.status === 'rejected').length;

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            {/* Header */}
            <View className="bg-primary pt-4 pb-6 px-6">
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="mr-3"
                        >
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white text-2xl font-bold">Service Approval</Text>
                    </View>
                    <View className="bg-white/20 px-3 py-1.5 rounded-full">
                        <Text className="text-white text-xs font-bold">
                            {pendingCount} Pending
                        </Text>
                    </View>
                </View>

                {/* Filter Tabs */}
                <View className="flex-row flex-wrap">
                    <FilterButton filter="pending" label="Pending" count={pendingCount} />
                    <FilterButton filter="approved" label="Approved" count={approvedCount} />
                    <FilterButton filter="rejected" label="Rejected" count={rejectedCount} />
                    <FilterButton filter="all" label="All" />
                </View>
            </View>

            {/* Services List */}
            <View className="flex-1 px-6 -mt-4">
                {filteredServices.length === 0 ? (
                    <EmptyState
                        icon="briefcase-outline"
                        title="No Services Found"
                        description={`No ${activeFilter === 'all' ? '' : activeFilter} services available`}
                    />
                ) : (
                    <FlatList
                        data={filteredServices}
                        keyExtractor={(item) => item.id!}
                        renderItem={({ item }) => <ServiceApprovalCard service={item} />}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}
            </View>

            {/* Rejection Modal */}
            <Modal
                visible={rejectModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setRejectModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6">
                        <Text className="text-gray-900 text-xl font-bold mb-4">
                            Reject Service
                        </Text>

                        <Text className="text-gray-600 text-sm mb-2">
                            Please provide a reason for rejecting this service:
                        </Text>

                        <TextInput
                            value={rejectionReason}
                            onChangeText={setRejectionReason}
                            placeholder="Enter rejection reason..."
                            placeholderTextColor="#9CA3AF"
                            multiline
                            numberOfLines={4}
                            className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 mb-4"
                            textAlignVertical="top"
                        />

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => setRejectModalVisible(false)}
                                disabled={actionLoading}
                                className="flex-1 bg-gray-200 rounded-xl py-3.5 items-center"
                            >
                                <Text className="text-gray-700 font-semibold">Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleRejectSubmit}
                                disabled={actionLoading}
                                className="flex-1 bg-red-500 rounded-xl py-3.5 items-center"
                            >
                                <Text className="text-white font-semibold">
                                    {actionLoading ? 'Rejecting...' : 'Reject Service'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default ServiceApprovalScreen;
