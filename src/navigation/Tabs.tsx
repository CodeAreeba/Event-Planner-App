import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabParamList } from '../types/navigation';

// Import screens
import BookingsScreen from '../screens/bookings/BookingsScreen';
import HomeScreen from '../screens/home/HomeScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SearchScreen from '../screens/search/SearchScreen';

const Tab = createBottomTabNavigator<TabParamList>();

const Tabs: React.FC = () => {
    const insets = useSafeAreaInsets();

    // Defensive calculation for bottom padding
    // On Android, insets.bottom might be 0 on some devices/emulators even with software nav buttons
    // So we ensure a minimum padding if it's 0, or use the inset if available
    const bottomPadding = Platform.OS === 'ios'
        ? insets.bottom
        : (insets.bottom > 0 ? insets.bottom : 16);

    const tabBarHeight = 60 + bottomPadding;

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    switch (route.name) {
                        case 'Home':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'Search':
                            iconName = focused ? 'search' : 'search-outline';
                            break;
                        case 'Bookings':
                            iconName = focused ? 'calendar' : 'calendar-outline';
                            break;
                        case 'Profile':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                        default:
                            iconName = 'ellipse-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#6366F1',
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    elevation: 10,
                    paddingBottom: bottomPadding,
                    paddingTop: 8,
                    height: tabBarHeight,
                    borderTopWidth: 1,
                    borderTopColor: '#E5E7EB',
                    backgroundColor: '#FFFFFF',
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                sceneContainerStyle: {
                    paddingBottom: tabBarHeight,
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Search" component={SearchScreen} />
            <Tab.Screen name="Bookings" component={BookingsScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

export default Tabs;
