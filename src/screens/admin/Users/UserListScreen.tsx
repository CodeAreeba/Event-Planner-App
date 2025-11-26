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
import UserCard from '../../../components/cards/UserCard';
import LoadingState from '../../../components/common/LoadingState';
import EmptyState from '../../../components/ui/EmptyState';
import { useAuth } from '../../../context/AuthContext';
import {
    blockUser,
    getAllUsers,
    softDeleteUser,
    unblockUser,
} from '../../../services/userService';
import { AppStackNavigationProp } from '../../../types/navigation';
import { UserProfile } from '../../../types/user';

type FilterTab = 'all' | 'active' | 'blocked' | 'deleted';

const UserListScreen: React.FC = () => {
    const navigation = useNavigation<AppStackNavigationProp>();
    const { userProfile } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

    const loadUsers = async (includeDeleted: boolean = false) => {
        setLoading(true);
        const { success, users: fetchedUsers } = await getAllUsers({
            includeDeleted,
        });
        if (success && fetchedUsers) {
            setUsers(fetchedUsers);
            applyFilter(fetchedUsers, activeFilter);
        }
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadUsers(activeFilter === 'deleted');
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadUsers(activeFilter === 'deleted');
        setRefreshing(false);
    };

    const applyFilter = (userList: UserProfile[], filter: FilterTab) => {
        let filtered = userList;

        switch (filter) {
            case 'active':
                filtered = userList.filter(
                    (u) => !u.isDeleted && u.status !== 'blocked'
                );
                break;
            case 'blocked':
                filtered = userList.filter(
                    (u) => !u.isDeleted && u.status === 'blocked'
                );
                break;
            case 'deleted':
                filtered = userList.filter((u) => u.isDeleted === true);
                break;
            case 'all':
            default:
                filtered = userList.filter((u) => !u.isDeleted);
                break;
        }

        setFilteredUsers(filtered);
    };

    const handleFilterChange = async (filter: FilterTab) => {
        setActiveFilter(filter);
        if (filter === 'deleted') {
            await loadUsers(true);
        } else {
            applyFilter(users, filter);
        }
    };

    const handleUserPress = (user: UserProfile) => {
        if (!user.isDeleted) {
            navigation.navigate('EditUser', { userId: user.uid });
        }
    };

    const handleEdit = (user: UserProfile) => {
        navigation.navigate('EditUser', { userId: user.uid });
    };

    const handleBlock = (user: UserProfile) => {
        if (user.uid === userProfile?.uid) {
            Alert.alert('Error', 'You cannot block yourself');
            return;
        }

        Alert.alert(
            'Block User',
            `Are you sure you want to block ${user.name}? They will not be able to access the app.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Block',
                    style: 'destructive',
                    onPress: async () => {
                        const { success } = await blockUser(user.uid);
                        if (success) {
                            Alert.alert('Success', 'User blocked successfully');
                            await loadUsers(activeFilter === 'deleted');
                        } else {
                            Alert.alert('Error', 'Failed to block user');
                        }
                    },
                },
            ]
        );
    };

    const handleUnblock = (user: UserProfile) => {
        Alert.alert(
            'Unblock User',
            `Are you sure you want to unblock ${user.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Unblock',
                    onPress: async () => {
                        const { success } = await unblockUser(user.uid);
                        if (success) {
                            Alert.alert('Success', 'User unblocked successfully');
                            await loadUsers(activeFilter === 'deleted');
                        } else {
                            Alert.alert('Error', 'Failed to unblock user');
                        }
                    },
                },
            ]
        );
    };

    const handleDelete = (user: UserProfile) => {
        if (user.uid === userProfile?.uid) {
            Alert.alert('Error', 'You cannot delete yourself');
            return;
        }

        Alert.alert(
            'Delete User',
            `Are you sure you want to delete ${user.name}? This will mark the user as deleted.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const { success } = await softDeleteUser(user.uid);
                        if (success) {
                            Alert.alert('Success', 'User deleted successfully');
                            await loadUsers(activeFilter === 'deleted');
                        } else {
                            Alert.alert('Error', 'Failed to delete user');
                        }
                    },
                },
            ]
        );
    };

    const FilterButton = ({ filter, label }: { filter: FilterTab; label: string }) => (
        <TouchableOpacity
            onPress={() => handleFilterChange(filter)}
            className={`px-4 py-2 rounded-full mr-2 ${activeFilter === filter ? 'bg-white' : 'bg-white/20'
                }`}
        >
            <Text
                className={`text-sm font-semibold ${activeFilter === filter ? 'text-primary' : 'text-white'
                    }`}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );

    if (loading) {
        return <LoadingState message="Loading users..." />;
    }

    const activeUsersCount = users.filter((u) => !u.isDeleted).length;

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
                        <Text className="text-white text-2xl font-bold">User Management</Text>
                    </View>
                    <View className="bg-white/20 px-3 py-1.5 rounded-full">
                        <Text className="text-white text-xs font-bold">
                            {activeUsersCount} Users
                        </Text>
                    </View>
                </View>

                {/* Role Statistics */}
                <View className="flex-row gap-2 mb-4">
                    <View className="flex-1 bg-white/10 rounded-xl p-3">
                        <View className="flex-row items-center justify-between">
                            <View>
                                <Text className="text-white/80 text-xs font-medium">Admins</Text>
                                <Text className="text-white text-xl font-bold mt-1">
                                    {users.filter(u => !u.isDeleted && u.role === 'admin').length}
                                </Text>
                            </View>
                            <View className="bg-purple-500/30 p-2 rounded-lg">
                                <Ionicons name="shield-checkmark" size={20} color="white" />
                            </View>
                        </View>
                    </View>
                    <View className="flex-1 bg-white/10 rounded-xl p-3">
                        <View className="flex-row items-center justify-between">
                            <View>
                                <Text className="text-white/80 text-xs font-medium">Providers</Text>
                                <Text className="text-white text-xl font-bold mt-1">
                                    {users.filter(u => !u.isDeleted && u.role === 'provider').length}
                                </Text>
                            </View>
                            <View className="bg-green-500/30 p-2 rounded-lg">
                                <Ionicons name="briefcase" size={20} color="white" />
                            </View>
                        </View>
                    </View>
                    <View className="flex-1 bg-white/10 rounded-xl p-3">
                        <View className="flex-row items-center justify-between">
                            <View>
                                <Text className="text-white/80 text-xs font-medium">Users</Text>
                                <Text className="text-white text-xl font-bold mt-1">
                                    {users.filter(u => !u.isDeleted && u.role === 'user').length}
                                </Text>
                            </View>
                            <View className="bg-blue-500/30 p-2 rounded-lg">
                                <Ionicons name="people" size={20} color="white" />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Filter Tabs */}
                <View className="flex-row">
                    <FilterButton filter="all" label="All" />
                    <FilterButton filter="active" label="Active" />
                    <FilterButton filter="blocked" label="Blocked" />
                    <FilterButton filter="deleted" label="Deleted" />
                </View>
            </View>

            {/* Scrollable Users List */}
            <View className="flex-1 px-6">
                {filteredUsers.length === 0 ? (
                    <EmptyState
                        icon="people-outline"
                        title="No Users Found"
                        description={`No ${activeFilter === 'all' ? '' : activeFilter} users available`}
                    />
                ) : (
                    <FlatList
                        data={filteredUsers}
                        keyExtractor={(item) => item.uid}
                        renderItem={({ item }) => (
                            <UserCard
                                user={item}
                                onPress={() => handleUserPress(item)}
                                onEdit={() => handleEdit(item)}
                                onBlock={
                                    item.status !== 'blocked'
                                        ? () => handleBlock(item)
                                        : undefined
                                }
                                onUnblock={
                                    item.status === 'blocked'
                                        ? () => handleUnblock(item)
                                        : undefined
                                }
                                onDelete={!item.isDeleted ? () => handleDelete(item) : undefined}
                                showActions={!item.isDeleted}
                            />
                        )}
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

export default UserListScreen;
