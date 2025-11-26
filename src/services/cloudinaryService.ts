/**
 * Cloudinary Service
 * Handles image uploads to Cloudinary
 */

const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export interface CloudinaryUploadResult {
    success: boolean;
    url?: string;
    error?: string;
    publicId?: string;
}

/**
 * Upload image to Cloudinary
 * @param imageUri - Local image URI from ImagePicker
 * @param folder - Optional folder name in Cloudinary (default: 'profiles')
 * @returns Promise with upload result
 */
export const uploadToCloudinary = async (
    imageUri: string,
    folder: string = 'profiles'
): Promise<CloudinaryUploadResult> => {
    try {
        // Validate configuration
        if (!CLOUDINARY_CLOUD_NAME || CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
            return {
                success: false,
                error: 'Cloudinary cloud name not configured. Please update .env file.',
            };
        }

        if (!CLOUDINARY_UPLOAD_PRESET) {
            return {
                success: false,
                error: 'Cloudinary upload preset not configured. Please update .env file.',
            };
        }

        // Create form data
        const formData = new FormData();
        
        // Extract filename from URI
        const filename = imageUri.split('/').pop() || 'profile.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        // Append image file
        formData.append('file', {
            uri: imageUri,
            type: type,
            name: filename,
        } as any);

        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', folder);

        // Upload to Cloudinary
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

        const response = await fetch(cloudinaryUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Cloudinary upload error:', errorData);
            return {
                success: false,
                error: errorData.error?.message || 'Failed to upload image to Cloudinary',
            };
        }

        const data = await response.json();

        return {
            success: true,
            url: data.secure_url,
            publicId: data.public_id,
        };
    } catch (error: any) {
        console.error('Cloudinary upload error:', error);
        return {
            success: false,
            error: error.message || 'An unexpected error occurred during upload',
        };
    }
};

/**
 * Get optimized image URL from Cloudinary
 * @param publicId - Cloudinary public ID
 * @param transformations - Optional transformations (width, height, crop, quality)
 * @returns Optimized image URL
 */
export const getOptimizedImageUrl = (
    publicId: string,
    transformations?: {
        width?: number;
        height?: number;
        crop?: 'fill' | 'fit' | 'scale' | 'thumb';
        quality?: 'auto' | number;
    }
): string => {
    if (!CLOUDINARY_CLOUD_NAME || CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
        return '';
    }

    const { width = 500, height = 500, crop = 'fill', quality = 'auto' } = transformations || {};

    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/w_${width},h_${height},c_${crop},q_${quality}/${publicId}`;
};

/**
 * Delete image from Cloudinary
 * Note: This requires authenticated requests with API key/secret
 * For unsigned uploads, deletion should be handled via Cloudinary dashboard or backend
 * @param publicId - Cloudinary public ID
 */
export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
    console.warn('Delete operation requires authenticated API. Please delete from Cloudinary dashboard or implement backend endpoint.');
    return false;
};
