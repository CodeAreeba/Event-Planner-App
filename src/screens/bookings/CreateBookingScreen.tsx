import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import FormInput from '../../components/common/FormInput';
import { useAuth } from '../../context/AuthContext';
import { createBooking } from '../../firebase/bookings';
import { AppStackNavigationProp } from '../../types/navigation';

// Helper function to format time from Date object
const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

// Helper function to parse time string to Date object
const parseTimeToDate = (timeString: string): Date => {
    const date = new Date();
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':').map(Number);

    let hour24 = hours;
    if (period === 'PM' && hours !== 12) hour24 += 12;
    if (period === 'AM' && hours === 12) hour24 = 0;

    date.setHours(hour24, minutes, 0, 0);
    return date;
};

// Helper function to combine date and time into a single Date object
const combineDateAndTime = (date: Date, timeString: string): Date => {
    const combined = new Date(date);

    if (timeString) {
        const [time, period] = timeString.split(' ');
        const [hours, minutes] = time.split(':').map(Number);

        let hour24 = hours;
        if (period === 'PM' && hours !== 12) hour24 += 12;
        if (period === 'AM' && hours === 12) hour24 = 0;

        combined.setHours(hour24, minutes, 0, 0);
    }

    return combined;
};

const CreateBookingScreen: React.FC = () => {
    const navigation = useNavigation<AppStackNavigationProp>();
    const { user, userProfile } = useAuth();

    const [serviceName, setServiceName] = useState('');
    const [userName, setUserName] = useState(userProfile?.name || '');
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState('');
    const [timeDate, setTimeDate] = useState(new Date());
    const [price, setPrice] = useState('');
    const [notes, setNotes] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [loading, setLoading] = useState(false);

    // Validation errors
    const [errors, setErrors] = useState({
        serviceName: '',
        userName: '',
        time: '',
        price: '',
    });

    const validateForm = () => {
        const newErrors = {
            serviceName: '',
            userName: '',
            time: '',
            price: '',
        };

        let isValid = true;

        if (!serviceName.trim()) {
            newErrors.serviceName = 'Service name is required';
            isValid = false;
        }

        if (!userName.trim()) {
            newErrors.userName = 'User name is required';
            isValid = false;
        }

        if (!time.trim()) {
            newErrors.time = 'Time is required';
            isValid = false;
        }

        if (!price.trim()) {
            newErrors.price = 'Price is required';
            isValid = false;
        } else if (isNaN(Number(price)) || Number(price) <= 0) {
            newErrors.price = 'Price must be a valid number';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        // Combine date and time into a single Date object for proper sorting
        const eventDateTime = combineDateAndTime(date, time);

        const bookingData = {
            userId: user?.uid || '',
            userName,
            providerId: 'provider-id', // This should come from service selection
            providerName: 'Provider Name',
            serviceId: 'service-id',
            serviceName,
            date: eventDateTime, // Combined date and time
            time,
            price: Number(price),
            notes,
        };

        const { success, bookingId } = await createBooking(bookingData);
        setLoading(false);

        if (success) {
            Alert.alert('Success', 'Booking created successfully!', [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]);
        } else {
            Alert.alert('Error', 'Failed to create booking. Please try again.');
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const onTimeChange = (event: any, selectedTime?: Date) => {
        setShowTimePicker(Platform.OS === 'ios');
        if (selectedTime) {
            setTimeDate(selectedTime);
            setTime(formatTime(selectedTime));
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6">
                <FormInput
                    label="Service Name"
                    value={serviceName}
                    onChangeText={setServiceName}
                    placeholder="Enter service name"
                    icon="briefcase-outline"
                    error={errors.serviceName}
                    required
                />

                <FormInput
                    label="Customer Name"
                    value={userName}
                    onChangeText={setUserName}
                    placeholder="Enter customer name"
                    icon="person-outline"
                    error={errors.userName}
                    required
                />

                <View className="mb-4">
                    <Text className="text-gray-700 text-sm font-semibold mb-2">
                        Date <Text className="text-red-500">*</Text>
                    </Text>
                    <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-200"
                    >
                        <Ionicons name="calendar-outline" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
                        <Text className="flex-1 text-gray-900 text-sm">
                            {date.toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </Text>
                    </TouchableOpacity>
                </View>

                {showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={onDateChange}
                        minimumDate={new Date()}
                    />
                )}

                <View className="mb-4">
                    <Text className="text-gray-700 text-sm font-semibold mb-2">
                        Time <Text className="text-red-500">*</Text>
                    </Text>
                    <TouchableOpacity
                        onPress={() => setShowTimePicker(true)}
                        className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-200"
                    >
                        <Ionicons name="time-outline" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
                        <Text className={`flex-1 text-sm ${time ? 'text-gray-900' : 'text-gray-400'}`}>
                            {time || 'Select time'}
                        </Text>
                    </TouchableOpacity>
                    {errors.time ? (
                        <Text className="text-red-500 text-xs mt-1">{errors.time}</Text>
                    ) : null}
                </View>

                {showTimePicker && (
                    <DateTimePicker
                        value={timeDate}
                        mode="time"
                        display="default"
                        onChange={onTimeChange}
                    />
                )}

                <FormInput
                    label="Price"
                    value={price}
                    onChangeText={setPrice}
                    placeholder="Enter price"
                    icon="cash-outline"
                    keyboardType="numeric"
                    error={errors.price}
                    required
                />

                <FormInput
                    label="Notes"
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Additional notes (optional)"
                    icon="document-text-outline"
                    multiline
                    numberOfLines={4}
                />

                <View className="py-6 gap-y-3">
                    <PrimaryButton
                        title="Create Booking"
                        onPress={handleSubmit}
                        loading={loading}
                    />

                    <SecondaryButton
                        title="Cancel"
                        onPress={() => navigation.goBack()}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default CreateBookingScreen;
