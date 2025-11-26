import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TextInput, View } from 'react-native';

interface SearchInputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    onFocus?: () => void;
    onBlur?: () => void;
    className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
    value,
    onChangeText,
    placeholder = 'Search...',
    onFocus,
    onBlur,
    className = '',
}) => {
    return (
        <View
            className={`flex-row items-center bg-gray-100 rounded-full px-4 py-1.5 ${className}`}
        >
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#9CA3AF"
                onFocus={onFocus}
                onBlur={onBlur}
                className="flex-1 ml-2 text-gray-900 text-base"
            />
            {value.length > 0 && (
                <Ionicons
                    name="close-circle"
                    size={20}
                    color="#6B7280"
                    onPress={() => onChangeText('')}
                />
            )}
        </View>
    );
};

export default SearchInput;
