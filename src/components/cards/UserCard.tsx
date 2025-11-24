import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { UserProfile, UserStatus } from '../../types/user';

interface UserCardProps {
    user: UserProfile;
    onPress?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onBlock?: () => void;
    onUnblock?: () => void;
    showActions?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({
    user,
    onPress,
    onEdit,
    onDelete,
    onBlock,
    onUnblock,
    showActions = true,
}) => {
    // Determine role badge color
    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin':
                return { bg: 'bg-purple-100', text: 'text-purple-800' };
            case 'provider':
                return { bg: 'bg-green-100', text: 'text-green-800' };
            default:
                return { bg: 'bg-blue-100', text: 'text-blue-800' };
        }
    };

    // Determine status badge color
    const getStatusBadgeColor = (status?: UserStatus, isDeleted?: boolean) => {
        if (isDeleted) {
            return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Deleted' };
        }
        if (status === 'blocked') {
            return { bg: 'bg-red-100', text: 'text-red-800', label: 'Blocked' };
        }
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' };
    };

    const roleBadge = getRoleBadgeColor(user.role);
    const statusBadge = getStatusBadgeColor(user.status, user.isDeleted);
    const isBlocked = user.status === 'blocked';
    const isDeleted = user.isDeleted === true;

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="bg-white rounded-2xl shadow-sm mb-3 p-4"
            disabled={isDeleted}
        >
            {/* Header with Name and Role Badge */}
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                    <Text className="text-gray-900 text-lg font-bold" numberOfLines={1}>
                        {user.name}
                    </Text>
                    <Text className="text-gray-500 text-sm mt-1" numberOfLines={1}>
                        {user.email}
                    </Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${roleBadge.bg}`}>
                    <Text className={`text-xs font-semibold ${roleBadge.text}`}>
                        {user.role.toUpperCase()}
                    </Text>
                </View>
            </View>

            {/* Status Badge */}
            <View className="flex-row items-center mb-3">
                <View className={`px-3 py-1 rounded-full ${statusBadge.bg}`}>
                    <Text className={`text-xs font-semibold ${statusBadge.text}`}>
                        {statusBadge.label}
                    </Text>
                </View>
            </View>

            {/* User Info */}
            {user.phone && (
                <View className="flex-row items-center mb-2">
                    <Ionicons name="call-outline" size={16} color="#6B7280" />
                    <Text className="text-gray-600 text-sm ml-2">{user.phone}</Text>
                </View>
            )}

            {user.address && (
                <View className="flex-row items-center mb-2">
                    <Ionicons name="location-outline" size={16} color="#6B7280" />
                    <Text className="text-gray-600 text-sm ml-2" numberOfLines={1}>
                        {user.address}
                    </Text>
                </View>
            )}

            {/* Actions */}
            {showActions && !isDeleted && (
                <View className="flex-row justify-end items-center mt-2 gap-2">
                    {onEdit && (
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                            className="bg-blue-50 px-3 py-2 rounded-lg flex-row items-center"
                        >
                            <Ionicons name="pencil" size={16} color="#3B82F6" />
                            <Text className="text-blue-600 text-xs font-semibold ml-1">
                                Edit
                            </Text>
                        </TouchableOpacity>
                    )}

                    {isBlocked ? (
                        onUnblock && (
                            <TouchableOpacity
                                onPress={(e) => {
                                    e.stopPropagation();
                                    onUnblock();
                                }}
                                className="bg-green-50 px-3 py-2 rounded-lg flex-row items-center"
                            >
                                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                                <Text className="text-green-600 text-xs font-semibold ml-1">
                                    Unblock
                                </Text>
                            </TouchableOpacity>
                        )
                    ) : (
                        onBlock && (
                            <TouchableOpacity
                                onPress={(e) => {
                                    e.stopPropagation();
                                    onBlock();
                                }}
                                className="bg-orange-50 px-3 py-2 rounded-lg flex-row items-center"
                            >
                                <Ionicons name="ban" size={16} color="#F59E0B" />
                                <Text className="text-orange-600 text-xs font-semibold ml-1">
                                    Block
                                </Text>
                            </TouchableOpacity>
                        )
                    )}

                    {onDelete && (
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="bg-red-50 px-3 py-2 rounded-lg flex-row items-center"
                        >
                            <Ionicons name="trash" size={16} color="#EF4444" />
                            <Text className="text-red-600 text-xs font-semibold ml-1">
                                Delete
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
};

export default UserCard;
