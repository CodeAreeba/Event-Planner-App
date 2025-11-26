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
import ServicePicker from '../../components/pickers/ServicePicker';
import { useAuth } from '../../context/AuthContext';
import { createBooking } from '../../firebase/bookings';
import { getServiceById } from '../../firebase/services';
import { AppStackNavigationProp, AppStackParamList } from '../../types/navigation';
import { Service } from '../../types/service';

type CreateBookingRouteProp = RouteProp<AppStackParamList, 'CreateBooking'>;

// Helper function to format time from Date object
const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
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
    const route = useRoute<CreateBookingRouteProp>();
    const { user, userProfile } = useAuth();

    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [userName, setUserName] = useState(userProfile?.name || '');
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState('');
    const [timeDate, setTimeDate] = useState(new Date());
    const [notes, setNotes] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingService, setLoadingService] = useState(false);

    // Validation errors
    const [errors, setErrors] = useState({
        service: '',
        userName: '',
        time: '',
    });

    // Load pre-selected service if serviceId is provided
    useEffect(() => {
        if (route.params?.serviceId) {
            loadPreSelectedService(route.params.serviceId);
        }
    }, [route.params?.serviceId]);

    const loadPreSelectedService = async (serviceId: string) => {
        setLoadingService(true);
        const { success, service } = await getServiceById(serviceId);
        if (success && service) {
            setSelectedService(service);
        }
        setLoadingService(false);
    };

    const validateForm = () => {
        const newErrors = {
            service: '',
            userName: '',
            time: '',
        };

        let isValid = true;

        if (!selectedService) {
            newErrors.service = 'Please select a service';
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

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async () => {
        if (!validateForm() || !selectedService) {
            return;
        }

        console.log('\n📝 ===== CREATING BOOKING =====');
        console.log('🔍 Selected Service Details:');
        console.log('  Service ID:', selectedService.id);
        console.log('  Service Title:', selectedService.title);
        console.log('  Service Price:', selectedService.price);
        console.log('  Created By (Provider ID):', selectedService.createdBy);
        console.log('  Duration:', selectedService.duration, 'minutes');

        setLoading(true);

        // Combine date and time into a single Date object for proper sorting
        const eventDateTime = combineDateAndTime(date, time);

        const bookingData = {
            userId: user?.uid || '',
            userName,
            providerId: selectedService.createdBy || 'unknown',
            providerName: 'Service Provider', // You can fetch this from users collection if needed
            serviceId: selectedService.id || '',
            serviceName: selectedService.title,
            date: eventDateTime,
            time,
            price: selectedService.price,
            notes,
        };

        console.log('\n📦 Booking Data to be Created:');
        console.log('  User ID:', bookingData.userId);
        console.log('  User Name:', bookingData.userName);
        console.log('  Provider ID:', bookingData.providerId);
        console.log('  Service ID:', bookingData.serviceId);
        console.log('  Service Name:', bookingData.serviceName);
        console.log('  Event Date:', eventDateTime.toLocaleString());
        console.log('  Time:', bookingData.time);
        console.log('  Price:', bookingData.price);
        console.log('  Notes:', bookingData.notes || '(none)');

        // Validation check
        if (bookingData.providerId === 'unknown' || !bookingData.providerId) {
            console.warn('⚠️ WARNING: Provider ID is missing or unknown!');
            console.warn('  This booking may not appear in any provider\'s dashboard');
        } else {
            console.log('✅ Provider ID validated:', bookingData.providerId);
        }

        const { success, bookingId } = await createBooking(bookingData);
        setLoading(false);

        if (success) {
            console.log('\n✅ Booking created successfully!');
            console.log('  Booking ID:', bookingId);
            console.log('  Status: pending (default)');
            console.log('  Provider should see this in their pending jobs');
            console.log('📝 ===== BOOKING CREATION COMPLETE =====\n');

            Alert.alert('Success', 'Booking created successfully!', [
                {
                    text: 'OK',
                    onPress: () => navigation.navigate('MainTabs'),
                },
            ]);
        } else {
            console.error('\n❌ Failed to create booking');
            console.log('📝 ===== BOOKING CREATION FAILED =====\n');
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

    const handleServiceSelect = (service: Service) => {
        setSelectedService(service);
        setErrors({ ...errors, service: '' });
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
            {/* Header */}
            <View className="bg-primary pt-4 pb-6 px-6">
                <View className="flex-row items-center mb-2">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-2xl font-bold">Create Booking</Text>
                </View>
                <Text className="text-white/80 text-sm">Schedule your service appointment</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pt-4">
                {/* Service Picker */}
                <ServicePicker
                    selectedServiceId={selectedService?.id}
                    onSelectService={handleServiceSelect}
                    error={errors.service}
                />

                <FormInput
                    label="Your Name"
                    value={userName}
                    onChangeText={setUserName}
                    placeholder="Enter your name"
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
                    label="Notes"
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Additional notes (optional)"
                    icon="document-text-outline"
                    multiline
                    numberOfLines={4}
                />

                {/* Booking Summary */}
                {selectedService && (
                    <View className="bg-primary/10 rounded-2xl p-4 mb-4 border border-primary/20">
                        <Text className="text-primary font-bold mb-3">Booking Summary</Text>
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-600">Service:</Text>
                            <Text className="text-gray-900 font-semibold">{selectedService.title}</Text>
                        </View>
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-600">Duration:</Text>
                            <Text className="text-gray-900 font-semibold">{selectedService.duration} min</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">Price:</Text>
                            <Text className="text-primary font-bold text-lg">PKR {selectedService.price.toLocaleString()}</Text>
                        </View>
                    </View>
                )}

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
