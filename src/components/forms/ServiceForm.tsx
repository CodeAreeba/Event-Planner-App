import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ServiceFormData } from '../../types/service';

interface ServiceFormProps {
    initialValues?: ServiceFormData;
    onSubmit: (data: ServiceFormData) => Promise<void>;
    submitButtonText?: string;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
    initialValues,
    onSubmit,
    submitButtonText = 'Submit',
}) => {
    const [title, setTitle] = useState(initialValues?.title || '');
    const [description, setDescription] = useState(initialValues?.description || '');
    const [price, setPrice] = useState(initialValues?.price?.toString() || '');
    const [duration, setDuration] = useState(initialValues?.duration?.toString() || '');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!title.trim()) {
            newErrors.title = 'Service title is required';
        } else if (title.trim().length < 3) {
            newErrors.title = 'Title must be at least 3 characters';
        } else if (title.trim().length > 100) {
            newErrors.title = 'Title must not exceed 100 characters';
        }

        if (!description.trim()) {
            newErrors.description = 'Description is required';
        } else if (description.trim().length < 10) {
            newErrors.description = 'Description must be at least 10 characters';
        } else if (description.trim().length > 500) {
            newErrors.description = 'Description must not exceed 500 characters';
        }

        if (!price.trim()) {
            newErrors.price = 'Price is required';
        } else if (isNaN(Number(price)) || Number(price) <= 0) {
            newErrors.price = 'Price must be a number greater than 0';
        }

        if (!duration.trim()) {
            newErrors.duration = 'Duration is required';
        } else if (isNaN(Number(duration)) || Number(duration) <= 0) {
            newErrors.duration = 'Duration must be a number greater than 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            return;
        }

        setLoading(true);
        try {
            const formData: ServiceFormData = {
                title: title.trim(),
                description: description.trim(),
                price: Number(price),
                duration: Number(duration),
            };

            await onSubmit(formData);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to submit form');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView
            className="flex-1 bg-gray-50 px-6"
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
        >
            {/* Service Title */}
            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2">
                    Service Title <Text className="text-error">*</Text>
                </Text>
                <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="e.g., Wedding Photography"
                    className={`bg-white border ${errors.title ? 'border-error' : 'border-gray-300'} rounded-xl px-4 py-3 text-gray-900`}
                    editable={!loading}
                />
                {errors.title && (
                    <Text className="text-error text-xs mt-1">{errors.title}</Text>
                )}
            </View>

            {/* Description */}
            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2">
                    Description <Text className="text-error">*</Text>
                </Text>
                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Describe your service..."
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    className={`bg-white border ${errors.description ? 'border-error' : 'border-gray-300'} rounded-xl px-4 py-3 text-gray-900`}
                    editable={!loading}
                />
                {errors.description && (
                    <Text className="text-error text-xs mt-1">{errors.description}</Text>
                )}
            </View>

            {/* Price */}
            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2">
                    Price (PKR) <Text className="text-error">*</Text>
                </Text>
                <TextInput
                    value={price}
                    onChangeText={setPrice}
                    placeholder="e.g., 50000"
                    keyboardType="numeric"
                    className={`bg-white border ${errors.price ? 'border-error' : 'border-gray-300'} rounded-xl px-4 py-3 text-gray-900`}
                    editable={!loading}
                />
                {errors.price && (
                    <Text className="text-error text-xs mt-1">{errors.price}</Text>
                )}
            </View>

            {/* Duration */}
            <View className="mb-6">
                <Text className="text-gray-700 text-sm font-semibold mb-2">
                    Duration (minutes) <Text className="text-error">*</Text>
                </Text>
                <TextInput
                    value={duration}
                    onChangeText={setDuration}
                    placeholder="e.g., 120"
                    keyboardType="numeric"
                    className={`bg-white border ${errors.duration ? 'border-error' : 'border-gray-300'} rounded-xl px-4 py-3 text-gray-900`}
                    editable={!loading}
                />
                {errors.duration && (
                    <Text className="text-error text-xs mt-1">{errors.duration}</Text>
                )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                className={`${loading ? 'bg-gray-400' : 'bg-primary'} rounded-xl py-4 items-center mb-6`}
            >
                <Text className="text-white text-base font-bold">
                    {loading ? 'Submitting...' : submitButtonText}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default ServiceForm;
