/**
 * Navigation type definitions for React Navigation
 */

import { NavigationProp, RouteProp } from '@react-navigation/native';
import { Service } from '../firebase/services';

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
    ServiceDetails: { serviceId: string };
    Booking: { service: Service };
    AddService: undefined;
    EditService: { serviceId: string };
    ServicesList: undefined;
    UserServices: undefined;
    ProviderProfile: { providerId: string };
    BookingDetails: { bookingId: string };
    CreateBooking: undefined;
    EditBooking: { bookingId: string };
    EditProfile: undefined;
};

// Root Stack Param List
export type RootStackParamList = {
    Auth: undefined;
    App: undefined;
};

// Navigation Props
export type AuthStackNavigationProp = NavigationProp<AuthStackParamList>;
export type TabNavigationProp = NavigationProp<TabParamList>;
export type AppStackNavigationProp = NavigationProp<AppStackParamList>;

// Route Props
export type ServiceDetailsRouteProp = RouteProp<AppStackParamList, 'ServiceDetails'>;
export type BookingRouteProp = RouteProp<AppStackParamList, 'Booking'>;
export type EditServiceRouteProp = RouteProp<AppStackParamList, 'EditService'>;
export type ProviderProfileRouteProp = RouteProp<AppStackParamList, 'ProviderProfile'>;
export type BookingDetailsRouteProp = RouteProp<AppStackParamList, 'BookingDetails'>;
