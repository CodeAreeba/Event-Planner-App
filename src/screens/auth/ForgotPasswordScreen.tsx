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
import { resetPassword } from '../../firebase/auth';
import { AuthStackNavigationProp } from '../../types/navigation';
import { showSuccessToast } from '../../utils/toast';
import { validateEmail } from '../../utils/validation';

const ForgotPasswordScreen: React.FC = () => {
    const navigation = useNavigation<AuthStackNavigationProp>();
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleResetPassword = async () => {
        try {
            setEmailError('');
            setErrorMessage('');

            const emailValidation = validateEmail(email);

            if (!emailValidation.valid) {
                setEmailError(emailValidation.error || 'Invalid email');
                return;
            }

            setLoading(true);
            const { success, error } = await resetPassword(email);
            setLoading(false);

            if (success) {
                setEmailSent(true);
                showSuccessToast('Password reset email sent. Please check your inbox.');
            } else {
                setErrorMessage(error || 'Failed to send email');
            }
        } catch (error) {
            setLoading(false);
            setErrorMessage('An unexpected error occurred. Please try again.');
        }
    };

    if (emailSent) {
        return (
            <View className="flex-1 justify-center items-center px-6" style={{ backgroundColor: '#F9FAFB' }}>
                <View className="bg-green-100 w-24 h-24 rounded-full items-center justify-center mb-6">
                    <Ionicons name="checkmark-circle" size={64} color="#10B981" />
                </View>

                <Text className="text-gray-900 text-2xl font-bold text-center mb-2">
                    Check Your Email
                </Text>

                <Text className="text-gray-600 text-sm text-center mb-1">
                    Password reset email sent.
                </Text>

                <Text className="text-gray-600 text-sm text-center mb-1">
                    Please check your inbox at
                </Text>

                <Text className="text-primary text-sm font-bold text-center mb-8">
                    {email}
                </Text>

                <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                    className="bg-primary rounded-full py-3.5 px-8 items-center mb-3"
                >
                    <Text className="text-white text-base font-bold">Back to Login</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setEmailSent(false)}>
                    <Text className="text-gray-600 text-sm">
                        Didn't receive? <Text className="text-primary font-semibold">Resend</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 justify-center px-6"
            style={{ backgroundColor: '#F9FAFB' }}
        >
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="absolute top-12 left-6 flex-row items-center"
            >
                <Ionicons name="arrow-back" size={24} color="#6366F1" />
            </TouchableOpacity>

            {/* Logo */}
            <View className="items-center mb-8">
                <View className="bg-primary w-16 h-16 rounded-full items-center justify-center mb-3">
                    <Ionicons name="key" size={28} color="white" />
                </View>
                <Text className="text-gray-900 text-3xl font-bold">Forgot Password?</Text>
                <Text className="text-gray-500 text-sm mt-1 text-center">
                    Enter your email to reset
                </Text>
            </View>

            {/* Error Alert */}
            {errorMessage && (
                <View className="bg-red-50 border border-red-200 rounded-2xl p-3 mb-4 flex-row items-start">
                    <Ionicons name="alert-circle" size={18} color="#EF4444" style={{ marginTop: 2 }} />
                    <View className="flex-1 ml-2">
                        <Text className="text-red-800 text-xs font-semibold">{errorMessage}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setErrorMessage('')}>
                        <Ionicons name="close" size={16} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            )}

            {/* Form */}
            <View>
                <View className="mb-6">
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

                <TouchableOpacity
                    onPress={handleResetPassword}
                    disabled={loading}
                    className="bg-primary rounded-full py-3.5 items-center mb-4"
                    style={{ opacity: loading ? 0.7 : 1 }}
                >
                    <Text className="text-white text-base font-bold">
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </Text>
                </TouchableOpacity>

                <View className="flex-row justify-center items-center mt-2">
                    <Text className="text-gray-600 text-sm">Remember password? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text className="text-primary text-sm font-bold">Sign In</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

export default ForgotPasswordScreen;
