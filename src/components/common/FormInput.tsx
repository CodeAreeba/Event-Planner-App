import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';

interface FormInputProps extends TextInputProps {
    label: string;
    error?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    required?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
    label,
    error,
    icon,
    required = false,
    ...props
}) => {
    return (
        <View className="mb-1">
            <Text className="text-gray-700 text-sm font-semibold mb-2">
                {label}
                {required && <Text className="text-red-500"> *</Text>}
            </Text>
            <View
                className={`flex-row items-center bg-white rounded-xl px-4 py-1 border ${error ? 'border-red-300' : 'border-gray-200'
                    }`}
            >
                {icon && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={error ? '#EF4444' : '#9CA3AF'}
                        style={{ marginRight: 12 }}
                    />
                )}
                <TextInput
                    className="flex-1 text-gray-900 text-sm"
                    placeholderTextColor="#9CA3AF"
                    {...props}
                />
            </View>
            {error && (
                <Text className="text-red-500 text-xs mt-1 ml-1">{error}</Text>
            )}
        </View>
    );
};

export default FormInput;
