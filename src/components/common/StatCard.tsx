import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface StatCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    value: string | number;
    color: string;
    onPress?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color, onPress }) => {
    const Component = onPress ? TouchableOpacity : View;

    return (
        <Component
            onPress={onPress}
            className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
            style={{ elevation: 2 }}
        >
            <View className="flex-row items-center">
                <View
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ backgroundColor: color + '20' }}
                >
                    <Ionicons name={icon} size={24} color={color} />
                </View>
                <View className="ml-3 flex-1">
                    <Text className="text-gray-500 text-xs font-medium">{title}</Text>
                    <Text className="text-gray-900 text-2xl font-bold mt-1">{value}</Text>
                </View>
                {onPress && (
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                )}
            </View>
        </Component>
    );
};

export default StatCard;
