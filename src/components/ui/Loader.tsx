import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

interface LoaderProps {
    size?: 'small' | 'large';
    color?: string;
    text?: string;
    fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({
    size = 'large',
    color = '#6366F1',
    text,
    fullScreen = false,
}) => {
    if (fullScreen) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size={size} color={color} />
                {text && (
                    <Text className="text-gray-600 text-base mt-4">{text}</Text>
                )}
            </View>
        );
    }

    return (
        <View className="justify-center items-center py-8">
            <ActivityIndicator size={size} color={color} />
            {text && (
                <Text className="text-gray-600 text-sm mt-3">{text}</Text>
            )}
        </View>
    );
};

export default Loader;
