import { Alert } from 'react-native';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
    message: string;
    type?: ToastType;
    duration?: number;
    onDismiss?: () => void;
}

/**
 * Show a success toast message
 */
export const showSuccessToast = (message: string, onDismiss?: () => void) => {
    Alert.alert('Success', message, [
        {
            text: 'OK',
            onPress: onDismiss,
        },
    ]);
};

/**
 * Show an error toast message
 */
export const showErrorToast = (message: string) => {
    Alert.alert('Error', message, [{ text: 'OK' }]);
};

/**
 * Show an info toast message
 */
export const showInfoToast = (message: string) => {
    Alert.alert('Info', message, [{ text: 'OK' }]);
};

/**
 * Show a toast with auto-dismiss and callback
 */
export const showToastWithCallback = (
    message: string,
    type: ToastType = 'success',
    duration: number = 2000,
    onDismiss?: () => void
) => {
    const title = type.charAt(0).toUpperCase() + type.slice(1);

    Alert.alert(title, message, [
        {
            text: 'OK',
            onPress: onDismiss,
        },
    ]);

    // Auto-dismiss after duration
    if (onDismiss) {
        setTimeout(() => {
            onDismiss();
        }, duration);
    }
};

/**
 * Show a confirmation dialog
 */
export const showConfirmDialog = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
) => {
    Alert.alert(title, message, [
        {
            text: 'Cancel',
            style: 'cancel',
            onPress: onCancel,
        },
        {
            text: 'Confirm',
            onPress: onConfirm,
        },
    ]);
};
