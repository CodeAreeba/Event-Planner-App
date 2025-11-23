/**
 * Validation utility functions (Pure TypeScript - No Formik/Yup)
 */

export interface ValidationResult {
    valid: boolean;
    error?: string;
}

export interface MultiFieldValidationResult {
    valid: boolean;
    errors: Record<string, string>;
}

/**
 * Validate email format
 */
export const validateEmail = (email: string): ValidationResult => {
    if (!email || email.trim() === '') {
        return { valid: false, error: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, error: 'Invalid email format' };
    }

    return { valid: true };
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): ValidationResult => {
    if (!password || password.trim() === '') {
        return { valid: false, error: 'Password is required' };
    }

    if (password.length < 6) {
        return { valid: false, error: 'Password must be at least 6 characters' };
    }

    if (password.length > 50) {
        return { valid: false, error: 'Password must be less than 50 characters' };
    }

    return { valid: true };
};

/**
 * Validate password confirmation
 */
export const validatePasswordMatch = (
    password: string,
    confirmPassword: string
): ValidationResult => {
    if (password !== confirmPassword) {
        return { valid: false, error: 'Passwords do not match' };
    }
    return { valid: true };
};

/**
 * Validate required fields
 */
export const validateRequiredFields = (
    fields: Record<string, any>
): MultiFieldValidationResult => {
    const errors: Record<string, string> = {};

    Object.keys(fields).forEach((key) => {
        const value = fields[key];
        if (
            value === null ||
            value === undefined ||
            (typeof value === 'string' && value.trim() === '')
        ) {
            errors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
        }
    });

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
};

/**
 * Validate phone number
 */
export const validatePhone = (phone: string): ValidationResult => {
    if (!phone || phone.trim() === '') {
        return { valid: false, error: 'Phone number is required' };
    }

    // Remove spaces and dashes
    const cleanPhone = phone.replace(/[\s-]/g, '');

    // Check if it's a valid phone number (10-15 digits)
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(cleanPhone)) {
        return { valid: false, error: 'Invalid phone number format' };
    }

    return { valid: true };
};

/**
 * Validate service fields
 */
export const validateServiceFields = (serviceData: {
    name?: string;
    category?: string;
    description?: string;
    price?: number;
    contact?: string;
    location?: string;
}): MultiFieldValidationResult => {
    const errors: Record<string, string> = {};

    if (!serviceData.name || serviceData.name.trim() === '') {
        errors.name = 'Service name is required';
    }

    if (!serviceData.category || serviceData.category.trim() === '') {
        errors.category = 'Category is required';
    }

    if (!serviceData.description || serviceData.description.trim() === '') {
        errors.description = 'Description is required';
    } else if (serviceData.description.length < 10) {
        errors.description = 'Description must be at least 10 characters';
    }

    if (!serviceData.price || serviceData.price <= 0) {
        errors.price = 'Price must be greater than 0';
    }

    if (!serviceData.contact || serviceData.contact.trim() === '') {
        errors.contact = 'Contact information is required';
    }

    if (!serviceData.location || serviceData.location.trim() === '') {
        errors.location = 'Location is required';
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
};

/**
 * Validate booking fields
 */
export const validateBookingFields = (bookingData: {
    date?: Date | string;
    time?: string;
    serviceId?: string;
}): MultiFieldValidationResult => {
    const errors: Record<string, string> = {};

    if (!bookingData.serviceId || bookingData.serviceId.trim() === '') {
        errors.serviceId = 'Service selection is required';
    }

    if (!bookingData.date) {
        errors.date = 'Date is required';
    } else {
        const selectedDate = new Date(bookingData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            errors.date = 'Date cannot be in the past';
        }
    }

    if (!bookingData.time || bookingData.time.trim() === '') {
        errors.time = 'Time is required';
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
};

/**
 * Validate price range
 */
export const validatePriceRange = (
    minPrice?: number,
    maxPrice?: number
): ValidationResult => {
    if (minPrice !== undefined && maxPrice !== undefined) {
        if (minPrice < 0) {
            return { valid: false, error: 'Minimum price cannot be negative' };
        }
        if (maxPrice < 0) {
            return { valid: false, error: 'Maximum price cannot be negative' };
        }
        if (minPrice > maxPrice) {
            return { valid: false, error: 'Minimum price cannot exceed maximum price' };
        }
    }

    return { valid: true };
};

/**
 * Validate name (for user profiles)
 */
export const validateName = (name: string): ValidationResult => {
    if (!name || name.trim() === '') {
        return { valid: false, error: 'Name is required' };
    }

    if (name.length < 2) {
        return { valid: false, error: 'Name must be at least 2 characters' };
    }

    if (name.length > 50) {
        return { valid: false, error: 'Name must be less than 50 characters' };
    }

    return { valid: true };
};
