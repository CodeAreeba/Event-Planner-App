import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ServiceFormData } from '../../types/service';
import PrimaryButton from '../buttons/PrimaryButton';

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
        }

        if (!description.trim()) {
            newErrors.description = 'Description is required';
        } else if (description.trim().length < 10) {
            newErrors.description = 'Description must be at least 10 characters';
        }

        if (!price.trim()) {
            newErrors.price = 'Price is required';
        } else if (isNaN(Number(price)) || Number(price) <= 0) {
            newErrors.price = 'Price must be greater than 0';
        }

        if (!duration.trim()) {
            newErrors.duration = 'Duration is required';
        } else if (isNaN(Number(duration)) || Number(duration) <= 0) {
            newErrors.duration = 'Duration must be greater than 0';
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
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {/* Service Title */}
            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Service Title <Text style={styles.required}>*</Text></Text>
                <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="e.g., Wedding Photography"
                    placeholderTextColor="#9CA3AF"
                    style={[styles.input, errors.title && styles.inputError]}
                    editable={!loading}
                />
                {errors.title ? (
                    <Text style={styles.errorText}>{errors.title}</Text>
                ) : null}
            </View>

            {/* Description */}
            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Describe your service..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={4}
                    style={[styles.input, styles.textArea, errors.description && styles.inputError]}
                    textAlignVertical="top"
                    editable={!loading}
                />
                {errors.description ? (
                    <Text style={styles.errorText}>{errors.description}</Text>
                ) : null}
            </View>

            {/* Price and Duration Row */}
            <View style={styles.row}>
                {/* Price */}
                <View style={[styles.fieldContainer, styles.halfWidth]}>
                    <Text style={styles.label}>Price (PKR) <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        value={price}
                        onChangeText={setPrice}
                        placeholder="50000"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        style={[styles.input, errors.price && styles.inputError]}
                        editable={!loading}
                    />
                    {errors.price ? (
                        <Text style={styles.errorText}>{errors.price}</Text>
                    ) : null}
                </View>

                {/* Duration */}
                <View style={[styles.fieldContainer, styles.halfWidth]}>
                    <Text style={styles.label}>Duration (min) <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        value={duration}
                        onChangeText={setDuration}
                        placeholder="120"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        style={[styles.input, errors.duration && styles.inputError]}
                        editable={!loading}
                    />
                    {errors.duration ? (
                        <Text style={styles.errorText}>{errors.duration}</Text>
                    ) : null}
                </View>
            </View>

            {/* Submit Button */}
            <View style={styles.buttonContainer}>
                <PrimaryButton
                    title={submitButtonText}
                    onPress={handleSubmit}
                    loading={loading}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        paddingTop: 20,
        paddingBottom: 24,
    },
    fieldContainer: {
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    halfWidth: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    required: {
        color: '#EF4444',
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#111827',
    },
    inputError: {
        borderColor: '#EF4444',
    },
    textArea: {
        minHeight: 120,
        paddingTop: 14,
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 6,
    },
    buttonContainer: {
        marginTop: 12,
    },
});

export default ServiceForm;
