import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const UserDashboardScreen: React.FC = () => {
    const { userProfile } = useAuth();
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const onRefresh = () => {
        setRefreshing(true);
        // Reload data
        setTimeout(() => setRefreshing(false), 1000);
    };

    const CategoryCard = ({ icon, title, color }: any) => (
        <TouchableOpacity className="bg-white rounded-2xl p-4 mr-3 items-center shadow-sm" style={{ width: 100 }}>
            <View className={`w-14 h-14 rounded-full items-center justify-center mb-2`} style={{ backgroundColor: color + '20' }}>
                <Ionicons name={icon} size={28} color={color} />
            </View>
            <Text className="text-gray-900 text-xs font-semibold text-center">{title}</Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1" style={{ backgroundColor: '#F9FAFB' }}>
            {/* Header */}
            <View className="bg-primary pt-12 pb-6 px-6">
                <View className="flex-row items-center justify-between mb-4">
                    <View>
                        <Text className="text-white text-2xl font-bold">Welcome!</Text>
                        <Text className="text-white/80 text-sm mt-1">Hi, {userProfile?.name}</Text>
                    </View>
                    <TouchableOpacity className="bg-white/20 w-10 h-10 rounded-full items-center justify-center">
                        <Ionicons name="notifications-outline" size={22} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="bg-white rounded-full px-4 py-3 flex-row items-center">
                    <Ionicons name="search" size={20} color="#9CA3AF" />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search for services..."
                        placeholderTextColor="#9CA3AF"
                        className="flex-1 ml-3 text-gray-900 text-sm"
                    />
                </View>
            </View>

            <ScrollView
                className="flex-1 -mt-4"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Categories */}
                <View className="px-6 mb-6">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-gray-900 text-lg font-bold">Categories</Text>
                        <TouchableOpacity>
                            <Text className="text-primary text-sm font-semibold">See All</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <CategoryCard icon="calendar" title="Event Planner" color="#6366F1" />
                        <CategoryCard icon="camera" title="Photographer" color="#10B981" />
                        <CategoryCard icon="restaurant" title="Caterer" color="#F59E0B" />
                        <CategoryCard icon="color-palette" title="Decorator" color="#EC4899" />
                        <CategoryCard icon="location" title="Venue" color="#8B5CF6" />
                    </ScrollView>
                </View>

                {/* Featured Services */}
                <View className="px-6 mb-6">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-gray-900 text-lg font-bold">Featured Services</Text>
                        <TouchableOpacity>
                            <Text className="text-primary text-sm font-semibold">See All</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
                        <View className="flex-row items-center">
                            <View className="w-16 h-16 bg-gray-200 rounded-xl items-center justify-center">
                                <Ionicons name="image-outline" size={28} color="#9CA3AF" />
                            </View>
                            <View className="flex-1 ml-3">
                                <Text className="text-gray-900 text-base font-bold">No services yet</Text>
                                <Text className="text-gray-500 text-xs mt-1">Services will appear here once approved</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View className="px-6 mb-6">
                    <Text className="text-gray-900 text-lg font-bold mb-3">Quick Actions</Text>

                    <View className="flex-row">
                        <TouchableOpacity className="flex-1 bg-white rounded-2xl p-4 mr-2 shadow-sm">
                            <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center mb-2">
                                <Ionicons name="calendar-outline" size={24} color="#6366F1" />
                            </View>
                            <Text className="text-gray-900 text-sm font-bold">My Bookings</Text>
                            <Text className="text-gray-500 text-xs mt-1">View all bookings</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="flex-1 bg-white rounded-2xl p-4 ml-2 shadow-sm">
                            <View className="w-12 h-12 bg-green-500/10 rounded-full items-center justify-center mb-2">
                                <Ionicons name="person-outline" size={24} color="#10B981" />
                            </View>
                            <Text className="text-gray-900 text-sm font-bold">My Profile</Text>
                            <Text className="text-gray-500 text-xs mt-1">Edit your profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="h-6" />
            </ScrollView>
        </View>
    );
};

export default UserDashboardScreen;
