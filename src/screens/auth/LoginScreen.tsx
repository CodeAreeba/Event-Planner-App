import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { login } from '../../firebase/auth';
import { AuthStackNavigationProp } from '../../types/navigation';
import { showSuccessToast } from '../../utils/toast';
import { validateEmail, validatePassword } from '../../utils/validation';

const LoginScreen: React.FC = () => {
    const navigation = useNavigation<AuthStackNavigationProp>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async () => {
        try {
            setEmailError('');
            setPasswordError('');
            setErrorMessage('');

            const emailValidation = validateEmail(email);
            const passwordValidation = validatePassword(password);

            let hasError = false;

            if (!emailValidation.valid) {
                setEmailError(emailValidation.error || 'Invalid email');
                hasError = true;
            }

            if (!passwordValidation.valid) {
                setPasswordError(passwordValidation.error || 'Invalid password');
                hasError = true;
            }

            if (hasError) {
                return;
            }

            setLoading(true);
            const { success, error } = await login(email, password);
            setLoading(false);

            if (success) {
                showSuccessToast('Welcome back! 🎉');
            } else {
                setErrorMessage(error || 'Login failed');
            }
        } catch (error) {
            setLoading(false);
            setErrorMessage('An unexpected error occurred. Please try again.');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 justify-center px-6"
            style={{ backgroundColor: '#F9FAFB' }}
        >
            {/* Logo */}
            <View className="items-center mb-8">
                <View className="bg-primary w-16 h-16 rounded-full items-center justify-center mb-3">
                    <Ionicons name="calendar" size={32} color="white" />
                </View>
                <Text className="text-gray-900 text-3xl font-bold">Welcome Back</Text>
                <Text className="text-gray-500 text-sm mt-1">Sign in to continue</Text>
            </View>

            {/* Error Alert */}
            {errorMessage && (
                <View className="bg-red-50 border border-red-200 rounded-2xl p-3 mb-4 flex-row items-start">
                    <Ionicons name="alert-circle" size={18} color="#EF4444" style={{ marginTop: 2 }} />
                    <View className="flex-1 ml-2">
                        <Text className="text-red-800 text-xs font-semibold mb-1">{errorMessage}</Text>
                        {errorMessage.includes('Invalid email or password') && (
                            <Text className="text-red-600 text-xs">
                                Don't have an account?{' '}
                                <Text
                                    className="text-red-700 font-bold underline"
                                    onPress={() => navigation.navigate('Signup')}
                                >
                                    Sign up here
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

                <View className="mb-4">
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

                <TouchableOpacity
                    onPress={() => navigation.navigate('ForgotPassword')}
                    className="self-end mb-6"
                >
                    <Text className="text-primary text-sm font-semibold">Forgot Password?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleLogin}
                    disabled={loading}
                    className="bg-primary rounded-full py-3.5 items-center mb-4"
                    style={{ opacity: loading ? 0.7 : 1 }}
                >
                    <Text className="text-white text-base font-bold">
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Text>
                </TouchableOpacity>

                <View className="flex-row justify-center items-center mt-4">
                    <Text className="text-gray-600 text-sm">Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                        <Text className="text-primary text-sm font-bold">Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;
