/**
 * Navigation type definitions for React Navigation
 */

import { NavigationProp, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Service } from './service';

// Auth Stack Param List
export type AuthStackParamList = {
    Login: undefined;
    Signup: undefined;
    ForgotPassword: undefined;
};

// Tab Navigator Param List
export type TabParamList = {
    Home: undefined;
    Search: undefined;
    Bookings: undefined;
    Profile: undefined;
};

// App Stack Param List
export type AppStackParamList = {
    MainTabs: undefined;
    Search: undefined;
    ServiceDetails: { serviceId: string };
    Booking: { service: Service };
    AddService: undefined;
    EditService: { serviceId: string };
    ServicesList: undefined;
    UserServices: undefined;
    ProviderProfile: { providerId: string };
    BookingDetails: { bookingId: string };
    CreateBooking: { serviceId?: string };
    EditBooking: { bookingId: string };
    EditProfile: undefined;
    UserList: undefined;
    EditUser: { userId: string };
    ProviderList: undefined;
    ProviderDetails: { providerId: string };
    ServiceApproval: undefined;
    ProviderBookings: undefined;
};

// Root Stack Param List
export type RootStackParamList = {
    Auth: undefined;
    App: undefined;
};

// Navigation Props
export type AuthStackNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type TabNavigationProp = NavigationProp<TabParamList>;
export type AppStackNavigationProp = NavigationProp<AppStackParamList>;

// Route Props
export type ServiceDetailsRouteProp = RouteProp<AppStackParamList, 'ServiceDetails'>;
export type BookingRouteProp = RouteProp<AppStackParamList, 'Booking'>;
export type EditServiceRouteProp = RouteProp<AppStackParamList, 'EditService'>;
export type ProviderProfileRouteProp = RouteProp<AppStackParamList, 'ProviderProfile'>;
export type BookingDetailsRouteProp = RouteProp<AppStackParamList, 'BookingDetails'>;
