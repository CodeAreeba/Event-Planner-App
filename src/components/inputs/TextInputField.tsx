import React from 'react';
import { Text, TextInput, View } from 'react-native';

interface TextInputFieldProps {
    label?: string;
    value: string;
    onChangeText: (text: string) => void;
    error?: string;
    placeholder?: string;
    secureTextEntry?: boolean;
    icon?: React.ReactNode;
    multiline?: boolean;
    numberOfLines?: number;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    className?: string;
}

const TextInputField: React.FC<TextInputFieldProps> = ({
    label,
    value,
    onChangeText,
    error,
    placeholder,
    secureTextEntry = false,
    icon,
    multiline = false,
    numberOfLines = 1,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    className = '',
}) => {
    return (
        <View className={`mb-4 ${className}`}>
            {label && (
                <Text className="text-gray-700 text-sm font-medium mb-2">{label}</Text>
            )}
            <View
                className={`flex-row items-center bg-white border rounded-xl px-4 ${error ? 'border-error' : 'border-gray-300'
                    } ${multiline ? 'py-3' : 'py-4'}`}
            >
                {icon && <View className="mr-3">{icon}</View>}
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={secureTextEntry}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    className={`flex-1 text-gray-900 text-base ${multiline ? 'min-h-[80px]' : ''
                        }`}
                />
            </View>
            {error && <Text className="text-error text-xs mt-1">{error}</Text>}
        </View>
    );
};

export default TextInputField;
