import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { getUsersByRole } from '../../firebase/admin';
import { blockUser, unblockUser } from '../../services/userService';
import { AppStackNavigationProp } from '../../types/navigation';
import { UserProfile } from '../../types/user';

type FilterTab = 'all' | 'active' | 'blocked';

const ProviderListScreen: React.FC = () => {
    const navigation = useNavigation<AppStackNavigationProp>();
    const { userProfile } = useAuth();
    const [providers, setProviders] = useState<UserProfile[]>([]);
    const [filteredProviders, setFilteredProviders] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

    const loadProviders = async () => {
        setLoading(true);
        const { success, users } = await getUsersByRole('provider');
        if (success && users) {
            setProviders(users);
            applyFilter(users, activeFilter);
        }
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadProviders();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadProviders();
        setRefreshing(false);
    };

    const applyFilter = (providerList: UserProfile[], filter: FilterTab) => {
        let filtered = providerList;

        switch (filter) {
            case 'active':
                filtered = providerList.filter(
                    (p) => !p.isDeleted && p.status !== 'blocked'
                );
                break;
            case 'blocked':
                filtered = providerList.filter(
                    (p) => !p.isDeleted && p.status === 'blocked'
                );
                break;
            case 'all':
            default:
                filtered = providerList.filter((p) => !p.isDeleted);
                break;
        }

        setFilteredProviders(filtered);
    };

    const handleFilterChange = (filter: FilterTab) => {
        setActiveFilter(filter);
        applyFilter(providers, filter);
    };

    const handleProviderPress = (provider: UserProfile) => {
        navigation.navigate('ProviderDetails', { providerId: provider.uid });
    };

    const handleBlock = (provider: UserProfile) => {
        if (provider.uid === userProfile?.uid) {
            Alert.alert('Error', 'You cannot block yourself');
            return;
        }

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
                            await loadProviders();
                        } else {
                            Alert.alert('Error', 'Failed to block provider');
                        }
                    },
                },
            ]
        );
    };

    const handleUnblock = (provider: UserProfile) => {
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
                            await loadProviders();
                        } else {
                            Alert.alert('Error', 'Failed to unblock provider');
                        }
                    },
                },
            ]
        );
    };

    const FilterButton = ({ filter, label }: { filter: FilterTab; label: string }) => (
        <TouchableOpacity
            onPress={() => handleFilterChange(filter)}
            className={`px-4 py-2 rounded-full mr-2 ${activeFilter === filter ? 'bg-primary' : 'bg-white'
                }`}
        >
            <Text
                className={`text-sm font-semibold ${activeFilter === filter ? 'text-white' : 'text-gray-600'
                    }`}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );

    const ProviderCard = ({ provider }: { provider: UserProfile }) => (
        <TouchableOpacity
            onPress={() => handleProviderPress(provider)}
            className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                    {/* Avatar */}
                    <View className="w-14 h-14 bg-primary/10 rounded-full items-center justify-center mr-3">
                        {provider.profileImage ? (
                            <Text className="text-primary text-xl font-bold">
                                {provider.name.charAt(0).toUpperCase()}
                            </Text>
                        ) : (
                            <Ionicons name="person" size={24} color="#6366F1" />
                        )}
                    </View>

                    {/* Provider Info */}
                    <View className="flex-1">
                        <Text className="text-gray-900 text-base font-bold">{provider.name}</Text>
                        <Text className="text-gray-500 text-sm mt-0.5">{provider.email}</Text>
                        {provider.phone && (
                            <Text className="text-gray-500 text-xs mt-0.5">{provider.phone}</Text>
                        )}
                    </View>
                </View>

                {/* Status Badge */}
                <View
                    className={`px-3 py-1.5 rounded-full ${provider.status === 'blocked' ? 'bg-red-100' : 'bg-green-100'
                        }`}
                >
                    <Text
                        className={`text-xs font-semibold ${provider.status === 'blocked' ? 'text-red-700' : 'text-green-700'
                            }`}
                    >
                        {provider.status === 'blocked' ? 'Blocked' : 'Active'}
                    </Text>
                </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row mt-3 gap-2">
                <TouchableOpacity
                    onPress={() => handleProviderPress(provider)}
                    className="flex-1 bg-primary/10 rounded-lg py-2.5 items-center"
                >
                    <Text className="text-primary text-sm font-semibold">View Details</Text>
                </TouchableOpacity>

                {provider.status !== 'blocked' ? (
                    <TouchableOpacity
                        onPress={() => handleBlock(provider)}
                        className="flex-1 bg-red-50 rounded-lg py-2.5 items-center"
                    >
                        <Text className="text-red-600 text-sm font-semibold">Block</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={() => handleUnblock(provider)}
                        className="flex-1 bg-green-50 rounded-lg py-2.5 items-center"
                    >
                        <Text className="text-green-600 text-sm font-semibold">Unblock</Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return <LoadingState message="Loading providers..." />;
    }

    const activeProvidersCount = providers.filter((p) => !p.isDeleted && p.status !== 'blocked').length;

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            {/* Fixed Header Section */}
            <View className="bg-primary pt-4 pb-6 px-6">
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="mr-3"
                        >
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white text-2xl font-bold">Provider Management</Text>
                    </View>
                    <View className="bg-white/20 px-3 py-1.5 rounded-full">
                        <Text className="text-white text-xs font-bold">
                            {activeProvidersCount} Active
                        </Text>
                    </View>
                </View>

                {/* Filter Tabs */}
                <View className="flex-row">
                    <FilterButton filter="all" label="All" />
                    <FilterButton filter="active" label="Active" />
                    <FilterButton filter="blocked" label="Blocked" />
                </View>
            </View>

            {/* Scrollable Providers List */}
            <View className="flex-1 px-6">
                {filteredProviders.length === 0 ? (
                    <EmptyState
                        icon="people-outline"
                        title="No Providers Found"
                        description={`No ${activeFilter === 'all' ? '' : activeFilter} providers available`}
                    />
                ) : (
                    <FlatList
                        data={filteredProviders}
                        keyExtractor={(item) => item.uid}
                        renderItem={({ item }) => <ProviderCard provider={item} />}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

export default ProviderListScreen;
