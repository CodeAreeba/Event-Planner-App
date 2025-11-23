import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { AppStackParamList } from '../types/navigation';

// Import navigators and screens
import BookingDetailsScreen from '../screens/bookings/BookingDetailsScreen';
import BookingScreen from '../screens/bookings/BookingScreen';
import CreateBookingScreen from '../screens/bookings/CreateBookingScreen';
import EditBookingScreen from '../screens/bookings/EditBookingScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import AddServiceScreen from '../screens/services/AddServiceScreen';
import EditServiceScreen from '../screens/services/EditServiceScreen';
import ServiceDetailsScreen from '../screens/services/ServiceDetailsScreen';
import Tabs from './Tabs';

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppStack: React.FC = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="MainTabs" component={Tabs} />
            <Stack.Screen
                name="ServiceDetails"
                component={ServiceDetailsScreen}
                options={{ headerShown: true, title: 'Service Details' }}
            />
            <Stack.Screen
                name="Booking"
                component={BookingScreen}
                options={{ headerShown: true, title: 'Book Service' }}
            />
            <Stack.Screen
                name="AddService"
                component={AddServiceScreen}
                options={{ headerShown: true, title: 'Add Service' }}
            />
            <Stack.Screen
                name="EditService"
                component={EditServiceScreen}
                options={{ headerShown: true, title: 'Edit Service' }}
            />
            <Stack.Screen
                name="BookingDetails"
                component={BookingDetailsScreen}
                options={{ headerShown: true, title: 'Booking Details' }}
            />
            <Stack.Screen
                name="CreateBooking"
                component={CreateBookingScreen}
                options={{ headerShown: true, title: 'Create Booking' }}
            />
            <Stack.Screen
                name="EditBooking"
                component={EditBookingScreen}
                options={{ headerShown: true, title: 'Edit Booking' }}
            />
            <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{ headerShown: true, title: 'Edit Profile' }}
            />
        </Stack.Navigator>
    );
};

export default AppStack;
