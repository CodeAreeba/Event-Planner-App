import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ActionCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    color: string;
    onPress: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon, title, subtitle, color, onPress }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
            style={{ elevation: 2 }}
            activeOpacity={0.7}
        >
            <View className="flex-row items-center">
                <View
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ backgroundColor: color + '20' }}
                >
                    <Ionicons name={icon} size={24} color={color} />
                </View>
                <View className="ml-3 flex-1">
                    <Text className="text-gray-900 text-base font-bold">{title}</Text>
                    <Text className="text-gray-500 text-xs mt-1">{subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
        </TouchableOpacity>
    );
};

export default ActionCard;
