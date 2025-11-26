import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from './config';

// Flag to check if Storage is enabled
// Set to false if you haven't enabled Firebase Storage yet
const STORAGE_ENABLED = true;

export interface UploadProgress {
    progress: number;
    downloadURL?: string;
    error?: string;
}

/**
 * Upload a single image to Firebase Storage
 * @param uri - Local file URI
 * @param path - Storage path (e.g., 'profiles/userId/image.jpg')
 * @param onProgress - Callback for upload progress
 * @returns Download URL of uploaded image
 */
export const uploadImage = async (
    uri: string,
    path: string,
    onProgress?: (progress: number) => void
): Promise<{ success: boolean; url?: string; error?: string }> => {
    // Check if Storage is enabled
    if (!STORAGE_ENABLED) {
        console.warn('⚠️ Firebase Storage is not enabled. Image upload skipped.');
        return {
            success: false,
            error: 'Image upload is currently disabled. Please enable Firebase Storage to upload images.',
        };
    }

    try {
        // Check if storage is initialized
        if (!storage) {
            return {
                success: false,
                error: 'Firebase Storage is not initialized',
            };
        }

        // Fetch the image as a blob
        const response = await fetch(uri);
        const blob = await response.blob();

        // Create storage reference
        const storageRef = ref(storage, path);

        // Upload file
        const uploadTask = uploadBytesResumable(storageRef, blob);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    // Calculate progress
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    if (onProgress) {
                        onProgress(progress);
                    }
                },
                (error) => {
                    // Handle upload errors
                    console.error('Upload error:', error);
                    resolve({
                        success: false,
                        error: error.message || 'Failed to upload image',
                    });
                },
                async () => {
                    // Upload completed successfully
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve({
                            success: true,
                            url: downloadURL,
                        });
                    } catch (error: any) {
                        resolve({
                            success: false,
                            error: error.message || 'Failed to get download URL',
                        });
                    }
                }
            );
        });
    } catch (error: any) {
        console.error('Error uploading image:', error);
        return {
            success: false,
            error: error.message || 'Failed to upload image',
        };
    }
};

/**
 * Upload multiple images to Firebase Storage
 * @param uris - Array of local file URIs
 * @param basePath - Base storage path (e.g., 'services/userId/')
 * @param onProgress - Callback for overall progress
 * @returns Array of download URLs
 */
export const uploadMultipleImages = async (
    uris: string[],
    basePath: string,
    onProgress?: (progress: number) => void
): Promise<{ success: boolean; urls?: string[]; error?: string }> => {
    // Check if Storage is enabled
    if (!STORAGE_ENABLED) {
        console.warn('⚠️ Firebase Storage is not enabled. Multiple image upload skipped.');
        return {
            success: false,
            error: 'Image upload is currently disabled. Please enable Firebase Storage to upload images.',
        };
    }

    try {
        const uploadPromises = uris.map((uri, index) => {
            const fileName = `image_${Date.now()}_${index}.jpg`;
            const path = `${basePath}${fileName}`;
            return uploadImage(uri, path);
        });

        const results = await Promise.all(uploadPromises);

        // Check if all uploads succeeded
        const failedUploads = results.filter((r) => !r.success);
        if (failedUploads.length > 0) {
            return {
                success: false,
                error: `${failedUploads.length} image(s) failed to upload`,
            };
        }

        const urls = results.map((r) => r.url!);
        if (onProgress) {
            onProgress(100);
        }

        return {
            success: true,
            urls,
        };
    } catch (error: any) {
        console.error('Error uploading multiple images:', error);
        return {
            success: false,
            error: error.message || 'Failed to upload images',
        };
    }
};

/**
 * Delete an image from Firebase Storage
 * @param url - Download URL of the image to delete
 */
export const deleteImage = async (
    url: string
): Promise<{ success: boolean; error?: string }> => {
    // Check if Storage is enabled
    if (!STORAGE_ENABLED) {
        console.warn('⚠️ Firebase Storage is not enabled. Image deletion skipped.');
        return {
            success: true, // Return success to not break the flow
        };
    }

    try {
        // Check if storage is initialized
        if (!storage) {
            return {
                success: false,
                error: 'Firebase Storage is not initialized',
            };
        }

        // Extract path from URL
        const path = extractPathFromURL(url);
        if (!path) {
            return {
                success: false,
                error: 'Invalid image URL',
            };
        }

        const storageRef = ref(storage, path);
        await deleteObject(storageRef);

        return { success: true };
    } catch (error: any) {
        console.error('Error deleting image:', error);
        return {
            success: false,
            error: error.message || 'Failed to delete image',
        };
    }
};

/**
 * Extract storage path from download URL
 */
const extractPathFromURL = (url: string): string | null => {
    try {
        const decodedURL = decodeURIComponent(url);
        const match = decodedURL.match(/\/o\/(.+?)\?/);
        return match ? match[1] : null;
    } catch (error) {
        console.error('Error extracting path from URL:', error);
        return null;
    }
};

/**
 * Generate a unique path for image upload
 */
export const generateImagePath = (userId: string, folder: string, fileName?: string): string => {
    const timestamp = Date.now();
    const name = fileName || `image_${timestamp}.jpg`;
    return `${folder}/${userId}/${name}`;
};

// Export the Storage enabled flag for UI components to check
export { STORAGE_ENABLED };

