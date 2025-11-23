import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

interface PrimaryButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    className?: string;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
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
            className={`bg-primary rounded-xl py-4 px-6 flex-row items-center justify-center ${isDisabled ? 'opacity-50' : 'active:opacity-80'
                } ${className}`}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
                <View className="flex-row items-center">
                    {icon && <View className="mr-2">{icon}</View>}
                    <Text className="text-white text-base font-semibold">{title}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

export default PrimaryButton;
