import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { signup } from '../../firebase/auth';
import { AuthStackNavigationProp } from '../../types/navigation';
import {
    validateEmail,
    validateName,
    validatePassword,
    validatePasswordMatch,
} from '../../utils/validation';

const SignupScreen: React.FC = () => {
    const navigation = useNavigation<AuthStackNavigationProp>();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSignup = async () => {
        try {
            setNameError('');
            setEmailError('');
            setPasswordError('');
            setConfirmPasswordError('');
            setErrorMessage('');

            const nameValidation = validateName(name);
            const emailValidation = validateEmail(email);
            const passwordValidation = validatePassword(password);
            const passwordMatchValidation = validatePasswordMatch(password, confirmPassword);

            let hasError = false;

            if (!nameValidation.valid) {
                setNameError(nameValidation.error || 'Invalid name');
                hasError = true;
            }

            if (!emailValidation.valid) {
                setEmailError(emailValidation.error || 'Invalid email');
                hasError = true;
            }

            if (!passwordValidation.valid) {
                setPasswordError(passwordValidation.error || 'Invalid password');
                hasError = true;
            }

            if (!passwordMatchValidation.valid) {
                setConfirmPasswordError(passwordMatchValidation.error || 'Passwords do not match');
                hasError = true;
            }

            if (hasError) {
                return;
            }

            setLoading(true);
            const { success, error } = await signup(email, password, name);
            setLoading(false);

            if (success) {
                // Show success message inline
                setErrorMessage('');

                // Clear form fields
                setName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');

                // Show success message with Alert
                Alert.alert(
                    'Success',
                    'Signed up successfully! Please login with your credentials.',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.replace('Login')
                        }
                    ]
                );
            } else {
                setErrorMessage(error || 'Signup failed');
            }
        } catch (error) {
            setLoading(false);
            setErrorMessage('An unexpected error occurred. Please try again.');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
            style={{ backgroundColor: '#F9FAFB' }}
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Logo */}
                <View className="items-center mb-6">
                    <View className="bg-primary w-16 h-16 rounded-full items-center justify-center mb-3">
                        <Ionicons name="person-add" size={28} color="white" />
                    </View>
                    <Text className="text-gray-900 text-3xl font-bold">Create Account</Text>
                    <Text className="text-gray-500 text-sm mt-1">Sign up to get started</Text>
                </View>

                {/* Error Alert */}
                {errorMessage && (
                    <View className="bg-red-50 border border-red-200 rounded-2xl p-3 mb-4 flex-row items-start">
                        <Ionicons name="alert-circle" size={18} color="#EF4444" style={{ marginTop: 2 }} />
                        <View className="flex-1 ml-2">
                            <Text className="text-red-800 text-xs font-semibold mb-1">{errorMessage}</Text>
                            {errorMessage.includes('already registered') && (
                                <Text className="text-red-600 text-xs">
                                    Already have an account?{' '}
                                    <Text
                                        className="text-red-700 font-bold underline"
                                        onPress={() => navigation.navigate('Login')}
                                    >
                                        Login here
                                    </Text>
                                </Text>
                            )}
                        </View>
                        <TouchableOpacity onPress={() => setErrorMessage('')}>
                            <Ionicons name="close" size={16} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Form */}
                <View>
                    <View className="mb-3">
                        <View className="flex-row items-center bg-white rounded-full px-4 py-3 border border-gray-200">
                            <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                            <TextInput
                                value={name}
                                onChangeText={(text) => {
                                    setName(text);
                                    setNameError('');
                                }}
                                placeholder="Full Name"
                                placeholderTextColor="#9CA3AF"
                                className="flex-1 ml-3 text-gray-900 text-sm"
                            />
                        </View>
                        {nameError && <Text className="text-red-500 text-xs mt-1 ml-4">{nameError}</Text>}
                    </View>

                    <View className="mb-3">
                        <View className="flex-row items-center bg-white rounded-full px-4 py-3 border border-gray-200">
                            <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                            <TextInput
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    setEmailError('');
                                }}
                                placeholder="Email"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                className="flex-1 ml-3 text-gray-900 text-sm"
                            />
                        </View>
                        {emailError && <Text className="text-red-500 text-xs mt-1 ml-4">{emailError}</Text>}
                    </View>

                    <View className="mb-3">
                        <View className="flex-row items-center bg-white rounded-full px-4 py-3 border border-gray-200">
                            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                            <TextInput
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    setPasswordError('');
                                }}
                                placeholder="Password"
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry={!showPassword}
                                className="flex-1 ml-3 text-gray-900 text-sm"
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color="#9CA3AF"
                                />
                            </TouchableOpacity>
                        </View>
                        {passwordError && <Text className="text-red-500 text-xs mt-1 ml-4">{passwordError}</Text>}
                    </View>

                    <View className="mb-4">
                        <View className="flex-row items-center bg-white rounded-full px-4 py-3 border border-gray-200">
                            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                            <TextInput
                                value={confirmPassword}
                                onChangeText={(text) => {
                                    setConfirmPassword(text);
                                    setConfirmPasswordError('');
                                }}
                                placeholder="Confirm Password"
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry={!showConfirmPassword}
                                className="flex-1 ml-3 text-gray-900 text-sm"
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <Ionicons
                                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color="#9CA3AF"
                                />
                            </TouchableOpacity>
                        </View>
                        {confirmPasswordError && <Text className="text-red-500 text-xs mt-1 ml-4">{confirmPasswordError}</Text>}
                    </View>

                    <TouchableOpacity
                        onPress={handleSignup}
                        disabled={loading}
                        className="bg-primary rounded-full py-3.5 items-center mb-4 mt-2"
                        style={{ opacity: loading ? 0.7 : 1 }}
                    >
                        <Text className="text-white text-base font-bold">
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </Text>
                    </TouchableOpacity>

                    <View className="flex-row justify-center items-center mt-2">
                        <Text className="text-gray-600 text-sm">Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text className="text-primary text-sm font-bold">Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default SignupScreen;
