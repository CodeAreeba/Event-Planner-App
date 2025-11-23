import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

interface SecondaryButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    className?: string;
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({
    title,
    onPress,
    loading = false,
    disabled = false,
    icon,
    className = '',
}) => {
    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            className={`bg-white border-2 border-primary rounded-xl py-4 px-6 flex-row items-center justify-center ${isDisabled ? 'opacity-50' : 'active:opacity-80'
                } ${className}`}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color="#6366F1" size="small" />
            ) : (
                <View className="flex-row items-center">
                    {icon && <View className="mr-2">{icon}</View>}
                    <Text className="text-primary text-base font-semibold">{title}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

export default SecondaryButton;
