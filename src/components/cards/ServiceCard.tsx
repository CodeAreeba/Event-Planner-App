import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Switch, Text, TouchableOpacity, View } from 'react-native';
import { Service } from '../../types/service';
import { formatCurrency } from '../../utils/format';

interface ServiceCardProps {
    service: Service;
    onPress?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onToggleStatus?: (isActive: boolean) => void;
    showActions?: boolean;
    showStatus?: boolean;
    isToggling?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
    service,
    onPress,
    onEdit,
    onDelete,
    onToggleStatus,
    showActions = false,
    showStatus = false,
    isToggling = false,
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="bg-white rounded-2xl shadow-md mb-4 p-4"
        >
            {/* Header */}
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                    <Text className="text-gray-900 text-lg font-bold" numberOfLines={1}>
                        {service.title || service.name}
                    </Text>
                </View>
                {showStatus && (
                    <View className="flex-row items-center gap-2">
                        <View className={`px-3 py-1 rounded-full ${service.isActive ? 'bg-green-100' : 'bg-red-100'}`}>
                            <Text className={`text-xs font-semibold ${service.isActive ? 'text-green-800' : 'text-red-800'}`}>
                                {service.isActive ? 'Active' : 'Inactive'}
                            </Text>
                        </View>
                        {onToggleStatus && (
                            <Switch
                                value={service.isActive}
                                onValueChange={(value) => {
                                    onToggleStatus(value);
                                }}
                                disabled={isToggling}
                                trackColor={{ false: '#EF4444', true: '#10B981' }}
                                thumbColor={service.isActive ? '#FFFFFF' : '#FFFFFF'}
                                ios_backgroundColor="#EF4444"
                            />
                        )}
                    </View>
                )}
            </View>

            {/* Description */}
            <Text className="text-gray-600 text-sm mb-3" numberOfLines={2}>
                {service.description}
            </Text>

            {/* Duration */}
            <View className="flex-row items-center mb-2">
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text className="text-gray-600 text-sm ml-2">
                    {service.duration} minutes
                </Text>
            </View>

            {/* Price and Actions */}
            <View className="flex-row justify-between items-center mt-2">
                <Text className="text-primary text-xl font-bold">
                    {formatCurrency(service.price)}
                </Text>

                {showActions && (
                    <View className="flex-row gap-2">
                        {onEdit && (
                            <TouchableOpacity
                                onPress={(e) => {
                                    e.stopPropagation();
                                    onEdit();
                                }}
                                className="bg-blue-50 p-2 rounded-lg"
                            >
                                <Ionicons name="pencil" size={18} color="#3B82F6" />
                            </TouchableOpacity>
                        )}
                        {onDelete && service.isActive && (
                            <TouchableOpacity
                                onPress={(e) => {
                                    e.stopPropagation();
                                    onDelete();
                                }}
                                className="bg-red-50 p-2 rounded-lg"
                            >
                                <Ionicons name="trash" size={18} color="#EF4444" />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default ServiceCard;
