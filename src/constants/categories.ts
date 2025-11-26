/**
 * Event service categories
 */

export interface Category {
    id: string;
    name: string;
    icon: string;
    description: string;
    color: string;
}

export const CATEGORIES: Category[] = [
    {
        id: 'event-planners',
        name: 'Event Planners',
        icon: 'calendar-outline',
        description: 'Professional event planning and coordination services',
        color: '#6366F1',
    },
    {
        id: 'photographers',
        name: 'Photographers',
        icon: 'camera-outline',
        description: 'Professional photography and videography services',
        color: '#EC4899',
    },
    {
        id: 'caterers',
        name: 'Caterers',
        icon: 'restaurant-outline',
        description: 'Catering and food services for events',
        color: '#10B981',
    },
    {
        id: 'decorators',
        name: 'Decorators',
        icon: 'color-palette-outline',
        description: 'Event decoration and styling services',
        color: '#F59E0B',
    },
    {
        id: 'venues',
        name: 'Venues',
        icon: 'location-outline',
        description: 'Event venues and spaces for rent',
        color: '#3B82F6',
    },
    {
        id: 'entertainment',
        name: 'Entertainment',
        icon: 'musical-notes-outline',
        description: 'DJs, bands, and entertainment services',
        color: '#8B5CF6',
    },
    {
        id: 'florists',
        name: 'Florists',
        icon: 'flower-outline',
        description: 'Floral arrangements and decorations',
        color: '#EC4899',
    },
    {
        id: 'makeup-artists',
        name: 'Makeup Artists',
        icon: 'brush-outline',
        description: 'Professional makeup and styling services',
        color: '#F472B6',
    },
    {
        id: 'transportation',
        name: 'Transportation',
        icon: 'car-outline',
        description: 'Event transportation and vehicle rental',
        color: '#6B7280',
    },
    {
        id: 'invitations',
        name: 'Invitations',
        icon: 'mail-outline',
        description: 'Custom invitation design and printing',
        color: '#14B8A6',
    },
];

/**
 * Get category by ID
 */
export const getCategoryById = (id: string): Category | undefined => {
    return CATEGORIES.find((category) => category.id === id);
};

/**
 * Get category name by ID
 */
export const getCategoryName = (id: string): string => {
    const category = getCategoryById(id);
    return category ? category.name : 'Unknown Category';
};

/**
 * Get all category IDs
 */
export const getAllCategoryIds = (): string[] => {
    return CATEGORIES.map((category) => category.id);
};

/**
 * Get all category names
 */
export const getAllCategoryNames = (): string[] => {
    return CATEGORIES.map((category) => category.name);
};

export default CATEGORIES;
