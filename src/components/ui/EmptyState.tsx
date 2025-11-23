import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

interface EmptyStateProps {
    icon?: keyof typeof Ionicons.glyphMap;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon = 'file-tray-outline',
    title,
    description,
    action,
}) => {
    return (
        <View className="flex-1 justify-center items-center px-8 py-12">
            {/* Icon */}
            <View className="bg-gray-100 w-24 h-24 rounded-full items-center justify-center mb-6">
                <Ionicons name={icon} size={48} color="#9CA3AF" />
            </View>

            {/* Title */}
            <Text className="text-gray-900 text-xl font-bold text-center mb-2">
                {title}
            </Text>

            {/* Description */}
            {description && (
                <Text className="text-gray-500 text-base text-center mb-6">
                    {description}
                </Text>
            )}

            {/* Action Button */}
            {action && <View className="mt-4">{action}</View>}
        </View>
    );
};

export default EmptyState;
