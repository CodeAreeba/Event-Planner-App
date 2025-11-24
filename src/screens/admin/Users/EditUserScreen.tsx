import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../../../components/buttons/PrimaryButton';
import SecondaryButton from '../../../components/buttons/SecondaryButton';
import FormInput from '../../../components/common/FormInput';
import LoadingState from '../../../components/common/LoadingState';
import { getUserById, updateUser } from '../../../services/userService';
import { AppStackNavigationProp, AppStackParamList } from '../../../types/navigation';
import { UserProfile, UserRole } from '../../../types/user';

type EditUserRouteProp = RouteProp<AppStackParamList, 'EditUser'>;

const EditUserScreen: React.FC = () => {
    const navigation = useNavigation<AppStackNavigationProp>();
    const route = useRoute<EditUserRouteProp>();
    const { userId } = route.params;

    const [user, setUser] = useState<UserProfile | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [role, setRole] = useState<UserRole>('user');
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showRolePicker, setShowRolePicker] = useState(false);

    const [errors, setErrors] = useState({
        name: '',
        phone: '',
    });

    const roles: { value: UserRole; label: string }[] = [
        { value: 'user', label: 'User' },
        { value: 'provider', label: 'Provider' },
        { value: 'admin', label: 'Admin' },
    ];

    useEffect(() => {
        loadUser();
    }, [userId]);

    const loadUser = async () => {
        setLoading(true);
        const { success, user: fetchedUser } = await getUserById(userId);
        if (success && fetchedUser) {
            setUser(fetchedUser);
            setName(fetchedUser.name);
            setEmail(fetchedUser.email);
            setPhone(fetchedUser.phone || '');
            setAddress(fetchedUser.address || '');
            setRole(fetchedUser.role);
            setIsActive(fetchedUser.status !== 'blocked');
        } else {
            Alert.alert('Error', 'Failed to load user details');
            navigation.goBack();
        }
        setLoading(false);
    };

    const validateForm = () => {
        const newErrors = {
            name: '',
            phone: '',
        };

        let isValid = true;

        if (!name.trim()) {
            newErrors.name = 'Name is required';
            isValid = false;
        }

        // Validate phone if provided
        if (phone && !/^\+?[\d\s-()]+$/.test(phone)) {
            newErrors.phone = 'Please enter a valid phone number';
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

        const updates: Partial<UserProfile> = {
            name,
            phone: phone || undefined,
            address: address || undefined,
            role,
            status: isActive ? 'active' : 'blocked',
        };

        const { success } = await updateUser(userId, updates);
        setSaving(false);

        if (success) {
            Alert.alert('Success', 'User updated successfully!', [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]);
        } else {
            Alert.alert('Error', 'Failed to update user. Please try again.');
        }
    };

    const getRoleLabel = (roleValue: UserRole) => {
        return roles.find(r => r.value === roleValue)?.label || roleValue;
    };

    if (loading) {
        return <LoadingState message="Loading user details..." />;
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6">
                {/* User Info Header */}
                <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
                    <View className="flex-row items-center">
                        <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mr-4">
                            <Ionicons name="person" size={32} color="#6366F1" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-900 text-lg font-bold">{user?.name}</Text>
                            <Text className="text-gray-500 text-sm">{user?.email}</Text>
                        </View>
                    </View>
                </View>

                <FormInput
                    label="Full Name"
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter full name"
                    icon="person-outline"
                    error={errors.name}
                    required
                />

                {/* Email (Read-only) */}
                <View className="mb-4">
                    <Text className="text-gray-700 text-sm font-semibold mb-2">
                        Email <Text className="text-gray-400">(Read-only)</Text>
                    </Text>
                    <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 border border-gray-200">
                        <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
                        <Text className="flex-1 text-gray-500 text-sm">{email}</Text>
                    </View>
                </View>

                <FormInput
                    label="Phone"
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Enter phone number"
                    icon="call-outline"
                    keyboardType="phone-pad"
                    error={errors.phone}
                />

                <FormInput
                    label="Address"
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Enter address"
                    icon="location-outline"
                    multiline
                    numberOfLines={3}
                />

                {/* Role Selector */}
                <View className="mb-4">
                    <Text className="text-gray-700 text-sm font-semibold mb-2">
                        Role <Text className="text-red-500">*</Text>
                    </Text>
                    <TouchableOpacity
                        onPress={() => setShowRolePicker(true)}
                        className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-200"
                    >
                        <Ionicons name="shield-outline" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
                        <Text className="flex-1 text-gray-900 text-sm">{getRoleLabel(role)}</Text>
                        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                {/* Role Picker Modal */}
                <Modal
                    visible={showRolePicker}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowRolePicker(false)}
                >
                    <View className="flex-1 justify-end bg-black/50">
                        <View className="bg-white rounded-t-3xl p-6">
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-gray-900 text-lg font-bold">Select Role</Text>
                                <TouchableOpacity onPress={() => setShowRolePicker(false)}>
                                    <Ionicons name="close" size={24} color="#6B7280" />
                                </TouchableOpacity>
                            </View>
                            {roles.map((roleOption) => (
                                <TouchableOpacity
                                    key={roleOption.value}
                                    onPress={() => {
                                        setRole(roleOption.value);
                                        setShowRolePicker(false);
                                    }}
                                    className="flex-row items-center py-4 border-b border-gray-100"
                                >
                                    <View className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${role === roleOption.value ? 'border-primary' : 'border-gray-300'
                                        }`}>
                                        {role === roleOption.value && (
                                            <View className="w-3 h-3 rounded-full bg-primary" />
                                        )}
                                    </View>
                                    <Text className={`text-base ${role === roleOption.value ? 'text-primary font-semibold' : 'text-gray-700'
                                        }`}>
                                        {roleOption.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </Modal>

                {/* Status Toggle */}
                <View className="mb-4 bg-white rounded-xl p-4 border border-gray-200">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                            <Text className="text-gray-900 text-sm font-semibold">Account Status</Text>
                            <Text className="text-gray-500 text-xs mt-1">
                                {isActive ? 'User can access the app' : 'User is blocked from accessing the app'}
                            </Text>
                        </View>
                        <Switch
                            value={isActive}
                            onValueChange={setIsActive}
                            trackColor={{ false: '#EF4444', true: '#10B981' }}
                            thumbColor="#FFFFFF"
                            ios_backgroundColor="#EF4444"
                        />
                    </View>
                    <View className="flex-row items-center mt-2">
                        <View className={`px-3 py-1 rounded-full ${isActive ? 'bg-green-100' : 'bg-red-100'}`}>
                            <Text className={`text-xs font-semibold ${isActive ? 'text-green-800' : 'text-red-800'}`}>
                                {isActive ? 'Active' : 'Blocked'}
                            </Text>
                        </View>
                    </View>
                </View>

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

export default EditUserScreen;
