import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import ProfileCard from '../../components/cards/ProfileCard';
import Loader from '../../components/ui/Loader';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../firebase/auth';
import { AppStackNavigationProp } from '../../types/navigation';
import { showConfirmDialog, showSuccessToast } from '../../utils/toast';

const ProfileScreen: React.FC = () => {
    const navigation = useNavigation<AppStackNavigationProp>();
    const { user, userProfile, loading } = useAuth();

    const handleLogout = () => {
        showConfirmDialog(
            'Logout',
            'Are you sure you want to logout?',
            async () => {
                const { success } = await logout();
                if (success) {
                    showSuccessToast('Logged out successfully');
                }
            }
        );
    };

    if (loading || !userProfile) {
        return <Loader fullScreen text="Loading profile..." />;
    }

    return (
        <ScrollView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-primary pt-12 pb-8 px-6">
                <Text className="text-white text-2xl font-bold">Profile</Text>
            </View>

            {/* Profile Card */}
            <View className="px-6 -mt-4 mb-6">
                <ProfileCard
                    profile={userProfile}
                    onEdit={() => navigation.navigate('EditProfile')}
                    showEditButton={true}
                />
            </View>

            {/* Menu Options */}
            <View className="px-6">
                <View className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
                    {userProfile.isProvider && (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('AddService')}
                            className="flex-row items-center p-4 border-b border-gray-100"
                        >
                            <View className="bg-primary/10 p-2 rounded-lg mr-4">
                                <Ionicons name="add-circle" size={24} color="#6366F1" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-900 text-base font-semibold">
                                    Add Service
                                </Text>
                                <Text className="text-gray-500 text-sm">
                                    Create a new service offering
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={() => navigation.navigate('Bookings')}
                        className="flex-row items-center p-4 border-b border-gray-100"
                    >
                        <View className="bg-blue-50 p-2 rounded-lg mr-4">
                            <Ionicons name="calendar" size={24} color="#3B82F6" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-900 text-base font-semibold">
                                My Bookings
                            </Text>
                            <Text className="text-gray-500 text-sm">
                                View your booking history
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleLogout}
                        className="flex-row items-center p-4"
                    >
                        <View className="bg-red-50 p-2 rounded-lg mr-4">
                            <Ionicons name="log-out" size={24} color="#EF4444" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-error text-base font-semibold">Logout</Text>
                            <Text className="text-gray-500 text-sm">
                                Sign out of your account
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

export default ProfileScreen;
