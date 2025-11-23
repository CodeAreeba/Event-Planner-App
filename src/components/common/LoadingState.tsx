import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

interface LoadingStateProps {
    message?: string;
    size?: 'small' | 'large';
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...', size = 'large' }) => {
    return (
        <View className="flex-1 items-center justify-center bg-gray-50 px-6">
            <ActivityIndicator size={size} color="#6366F1" />
            <Text className="text-gray-600 text-sm mt-4">{message}</Text>
        </View>
    );
};

export default LoadingState;
