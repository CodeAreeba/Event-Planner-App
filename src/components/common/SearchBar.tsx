import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    debounceMs?: number;
    onSearch?: (text: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
    value,
    onChangeText,
    placeholder = 'Search...',
    debounceMs = 500,
    onSearch,
}) => {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (onSearch && localValue !== value) {
                onSearch(localValue);
            }
            onChangeText(localValue);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [localValue, debounceMs]);

    const handleClear = () => {
        setLocalValue('');
        onChangeText('');
        if (onSearch) {
            onSearch('');
        }
    };

    return (
        <View className="bg-white rounded-full px-4 py-3 flex-row items-center shadow-sm" style={{ elevation: 2 }}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
                value={localValue}
                onChangeText={setLocalValue}
                placeholder={placeholder}
                placeholderTextColor="#9CA3AF"
                className="flex-1 ml-3 text-gray-900 text-sm"
            />
            {localValue.length > 0 && (
                <TouchableOpacity onPress={handleClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
            )}
        </View>
    );
};

export default SearchBar;
