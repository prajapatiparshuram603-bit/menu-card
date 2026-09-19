import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../lib/firebase';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export type StorageCategory = 'logo' | 'cover' | 'menu';

export interface UploadImageResult {
  url: string;
  path: string;
}

/**
 * Validates and uploads an image to Firebase Storage under the restaurant's path
 */
export async function uploadRestaurantImage(
  restaurantId: string,
  category: StorageCategory,
  file: File
): Promise<UploadImageResult> {
  if (!restaurantId || !restaurantId.trim()) {
    throw new Error('Restaurant ID is required for storage operations.');
  }

  // 1. Content Type Check
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Invalid file format. Only JPG, PNG, and WebP images are allowed.');
  }

  // 2. File Size Check (Max 5MB)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('File size exceeds the 5MB maximum limit.');
  }

  // 3. Path sanitization
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `restaurants/${restaurantId}/${category}/${Date.now()}_${cleanFileName}`;
  const storageRef = ref(storage, path);

  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type,
    customMetadata: {
      restaurantId,
      uploadedAt: new Date().toISOString(),
    },
  });

  const url = await getDownloadURL(snapshot.ref);
  return { url, path };
}

/**
 * Safely delete an image from Firebase Storage if it belongs to this restaurant
 */
export async function deleteRestaurantImage(storagePath: string): Promise<void> {
  if (!storagePath) return;
  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  } catch (err) {
    console.warn('Could not delete file from storage:', err);
  }
}
