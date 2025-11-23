import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Service } from '../../firebase/services';
import { formatCurrency } from '../../utils/format';

interface ServiceCardProps {
    service: Service;
    onPress?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    showActions?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
    service,
    onPress,
    onEdit,
    onDelete,
    showActions = false,
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="bg-white rounded-2xl shadow-md mb-4 overflow-hidden"
        >
            {/* Service Image */}
            <View className="relative">
                <Image
                    source={{
                        uri: service.images?.[0] || 'https://via.placeholder.com/400x200',
                    }}
                    className="w-full h-48"
                    resizeMode="cover"
                />
                {!service.availability && (
                    <View className="absolute top-3 right-3 bg-error px-3 py-1 rounded-full">
                        <Text className="text-white text-xs font-semibold">Unavailable</Text>
                    </View>
                )}
            </View>

            {/* Service Info */}
            <View className="p-4">
                <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                        <Text className="text-gray-900 text-lg font-bold" numberOfLines={1}>
                            {service.name}
                        </Text>
                        <Text className="text-gray-500 text-sm mt-1">{service.category}</Text>
                    </View>
                    {service.rating && (
                        <View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded-lg">
                            <Ionicons name="star" size={14} color="#F59E0B" />
                            <Text className="text-gray-900 text-sm font-semibold ml-1">
                                {service.rating.toFixed(1)}
                            </Text>
                        </View>
                    )}
                </View>

                <Text className="text-gray-600 text-sm mb-3" numberOfLines={2}>
                    {service.description}
                </Text>

                <View className="flex-row items-center mb-2">
                    <Ionicons name="location-outline" size={16} color="#6B7280" />
                    <Text className="text-gray-600 text-sm ml-1" numberOfLines={1}>
                        {service.location}
                    </Text>
                </View>

                <View className="flex-row justify-between items-center mt-2">
                    <Text className="text-primary text-xl font-bold">
                        {formatCurrency(service.price)}
                    </Text>

                    {showActions && (
                        <View className="flex-row gap-2">
                            {onEdit && (
                                <TouchableOpacity
                                    onPress={onEdit}
                                    className="bg-blue-50 p-2 rounded-lg"
                                >
                                    <Ionicons name="pencil" size={18} color="#3B82F6" />
                                </TouchableOpacity>
                            )}
                            {onDelete && (
                                <TouchableOpacity
                                    onPress={onDelete}
                                    className="bg-red-50 p-2 rounded-lg"
                                >
                                    <Ionicons name="trash" size={18} color="#EF4444" />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default ServiceCard;
