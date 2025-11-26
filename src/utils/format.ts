/**
 * Formatting utility functions
 */

/**
 * Format date to readable string
 */
export const formatDate = (date: any): string => {
    if (!date) return 'N/A';

    let d: Date;

    if (typeof date === 'string') {
        d = new Date(date);
    } else if (date && typeof date.toDate === 'function') {
        // Handle Firestore Timestamp
        d = date.toDate();
    } else if (date instanceof Date) {
        d = date;
    } else {
        return 'Invalid Date';
    }

    // Check if date is valid
    if (isNaN(d.getTime())) return 'Invalid Date';

    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };

    return d.toLocaleDateString('en-US', options);
};

/**
 * Format date to short format (MM/DD/YYYY)
 */
export const formatDateShort = (date: any): string => {
    if (!date) return 'N/A';

    let d: Date;

    if (typeof date === 'string') {
        d = new Date(date);
    } else if (date && typeof date.toDate === 'function') {
        d = date.toDate();
    } else if (date instanceof Date) {
        d = date;
    } else {
        return 'N/A';
    }

    if (isNaN(d.getTime())) return 'N/A';

    return d.toLocaleDateString('en-US');
};

/**
 * Format time to readable string (12-hour format)
 */
export const formatTime = (time: any): string => {
    if (!time) return 'N/A';

    if (typeof time === 'string') {
        // Check if it's a date string or HH:MM
        if (time.includes('T') || time.includes('-') || time.includes('/')) {
            const d = new Date(time);
            if (!isNaN(d.getTime())) {
                return d.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                });
            }
        }

        // Assume time is in HH:MM format
        const parts = time.split(':');
        if (parts.length >= 2) {
            const hours = parseInt(parts[0], 10);
            const minutes = parseInt(parts[1], 10);
            if (!isNaN(hours) && !isNaN(minutes)) {
                const period = hours >= 12 ? 'PM' : 'AM';
                const displayHours = hours % 12 || 12;
                return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
            }
        }
        return time;
    }

    let d: Date;
    if (time && typeof time.toDate === 'function') {
        d = time.toDate();
    } else if (time instanceof Date) {
        d = time;
    } else {
        return 'N/A';
    }

    if (isNaN(d.getTime())) return 'N/A';

    return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};

/**
 * Format currency (PKR - Pakistani Rupee)
 */
export const formatCurrency = (amount: number): string => {
    return `Rs. ${amount.toLocaleString('en-PK')}`;
};

/**
 * Format currency in USD
 */
export const formatCurrencyUSD = (amount: number): string => {
    return `$${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX for 10 digits
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }

    // Format as +X (XXX) XXX-XXXX for 11 digits
    if (cleaned.length === 11) {
        return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(
            4,
            7
        )}-${cleaned.slice(7)}`;
    }

    // Return as-is if not standard length
    return phone;
};

/**
 * Format relative time (e.g., "2 hours ago", "3 days ago")
 */
export const formatRelativeTime = (date: any): string => {
    if (!date) return '';

    let d: Date;
    if (typeof date === 'string') {
        d = new Date(date);
    } else if (date && typeof date.toDate === 'function') {
        d = date.toDate();
    } else if (date instanceof Date) {
        d = date;
    } else {
        return '';
    }

    if (isNaN(d.getTime())) return '';

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
        return 'Just now';
    } else if (diffMin < 60) {
        return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
        return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffDay < 7) {
        return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else {
        return formatDateShort(d);
    }
};

/**
 * Format booking status for display
 */
export const formatBookingStatus = (
    status: 'pending' | 'confirmed' | 'accepted' | 'rejected' | 'completed' | 'cancelled'
): string => {
    const statusMap = {
        pending: 'Pending',
        confirmed: 'Confirmed',
        accepted: 'Accepted',
        rejected: 'Rejected',
        completed: 'Completed',
        cancelled: 'Cancelled',
    };
    return statusMap[status] || status;
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) {
        return text;
    }
    return text.slice(0, maxLength) + '...';
};

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (text: string): string => {
    return text
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

/**
 * Format rating (e.g., 4.5 → "4.5 ★")
 */
export const formatRating = (rating: number): string => {
    return `${rating.toFixed(1)} ★`;
};
