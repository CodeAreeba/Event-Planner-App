import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
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
import LoadingState from '../../components/common/LoadingState';
import { getBookingById, updateBooking } from '../../firebase/bookings';
import { AppStackNavigationProp, AppStackParamList } from '../../types/navigation';

type EditBookingRouteProp = RouteProp<AppStackParamList, 'EditBooking'>;

const EditBookingScreen: React.FC = () => {
    const navigation = useNavigation<AppStackNavigationProp>();
    const route = useRoute<EditBookingRouteProp>();
    const { bookingId } = route.params;

    const [serviceName, setServiceName] = useState('');
    const [userName, setUserName] = useState('');
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState('');
    const [price, setPrice] = useState('');
    const [notes, setNotes] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [errors, setErrors] = useState({
        serviceName: '',
        userName: '',
        time: '',
        price: '',
    });

    useEffect(() => {
        loadBooking();
    }, [bookingId]);

    const loadBooking = async () => {
        setLoading(true);
        const { success, booking } = await getBookingById(bookingId);
        if (success && booking) {
            setServiceName(booking.serviceName || '');
            setUserName(booking.userName || '');
            setDate(booking.date instanceof Date ? booking.date : new Date(booking.date));
            setTime(booking.time || '');
            setPrice(booking.price?.toString() || '');
            setNotes(booking.notes || '');
        }
        setLoading(false);
    };

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

        setSaving(true);

        const updates = {
            serviceName,
            userName,
            date,
            time,
            price: Number(price),
            notes,
        };

        const { success } = await updateBooking(bookingId, updates);
        setSaving(false);

        if (success) {
            Alert.alert('Success', 'Booking updated successfully!', [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]);
        } else {
            Alert.alert('Error', 'Failed to update booking. Please try again.');
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    if (loading) {
        return <LoadingState message="Loading booking..." />;
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6">
                <View className="py-6">
                    <Text className="text-gray-900 text-2xl font-bold mb-2">Edit Booking</Text>
                    <Text className="text-gray-600 text-sm">Update booking details</Text>
                </View>

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

                <FormInput
                    label="Time"
                    value={time}
                    onChangeText={setTime}
                    placeholder="e.g., 10:00 AM"
                    icon="time-outline"
                    error={errors.time}
                    required
                />

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
                        title="Save Changes"
                        onPress={handleSubmit}
                        loading={saving}
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

export default EditBookingScreen;
