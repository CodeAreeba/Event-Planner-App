import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface ModalWrapperProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    showCloseButton?: boolean;
    size?: 'small' | 'medium' | 'large' | 'full';
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({
    visible,
    onClose,
    title,
    children,
    showCloseButton = true,
    size = 'medium',
}) => {
    const getSizeClass = () => {
        switch (size) {
            case 'small':
                return 'w-[80%] max-h-[50%]';
            case 'medium':
                return 'w-[90%] max-h-[70%]';
            case 'large':
                return 'w-[95%] max-h-[85%]';
            case 'full':
                return 'w-full h-full';
            default:
                return 'w-[90%] max-h-[70%]';
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 justify-center items-center p-4">
                <View className={`bg-white rounded-2xl ${getSizeClass()}`}>
                    {/* Header */}
                    {(title || showCloseButton) && (
                        <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
                            {title && (
                                <Text className="text-gray-900 text-lg font-bold flex-1">
                                    {title}
                                </Text>
                            )}
                            {showCloseButton && (
                                <TouchableOpacity
                                    onPress={onClose}
                                    className="bg-gray-100 p-2 rounded-full"
                                >
                                    <Ionicons name="close" size={20} color="#374151" />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* Content */}
                    <ScrollView
                        className="flex-1"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ padding: 16 }}
                    >
                        {children}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export default ModalWrapper;
