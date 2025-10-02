/**
 * Document Upload Utility
 * Handles document selection, camera capture, and file validation for order completion
 */

import { Alert, Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

// Types for document upload
export interface DocumentFile {
  uri: string;
  type: string;
  name: string;
  size: number;
}

export interface DocumentUploadOptions {
  allowMultiple?: boolean;
  maxSizeInMB?: number;
  allowedTypes?: string[];
}

/**
 * Request camera permission
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  const permission = Platform.OS === 'ios' 
    ? PERMISSIONS.IOS.CAMERA 
    : PERMISSIONS.ANDROID.CAMERA;

  const result = await check(permission);
  
  if (result === RESULTS.GRANTED) {
    return true;
  }
  
  if (result === RESULTS.DENIED) {
    const requestResult = await request(permission);
    return requestResult === RESULTS.GRANTED;
  }
  
  return false;
};

/**
 * Request photo library permission
 */
export const requestPhotoLibraryPermission = async (): Promise<boolean> => {
  const permission = Platform.OS === 'ios' 
    ? PERMISSIONS.IOS.PHOTO_LIBRARY 
    : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;

  const result = await check(permission);
  
  if (result === RESULTS.GRANTED) {
    return true;
  }
  
  if (result === RESULTS.DENIED) {
    const requestResult = await request(permission);
    return requestResult === RESULTS.GRANTED;
  }
  
  return false;
};

/**
 * Validate file size
 */
export const validateFileSize = (file: DocumentFile, maxSizeInMB: number = 10): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

/**
 * Validate file type
 */
export const validateFileType = (file: DocumentFile, allowedTypes: string[] = ['image/jpeg', 'image/png', 'application/pdf']): boolean => {
  return allowedTypes.includes(file.type);
};

/**
 * Show document selection options
 */
export const showDocumentOptions = (
  onCamera: () => void,
  onGallery: () => void,
  onDocument: () => void
) => {
  Alert.alert(
    'Select Document',
    'Choose how you want to add your document',
    [
      {
        text: 'Camera',
        onPress: onCamera,
      },
      {
        text: 'Gallery',
        onPress: onGallery,
      },
      {
        text: 'Files',
        onPress: onDocument,
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]
  );
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file extension from URI
 */
export const getFileExtension = (uri: string): string => {
  return uri.split('.').pop()?.toLowerCase() || '';
};

/**
 * Check if file is an image
 */
export const isImageFile = (file: DocumentFile): boolean => {
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return imageTypes.includes(file.type);
};

/**
 * Check if file is a PDF
 */
export const isPDFFile = (file: DocumentFile): boolean => {
  return file.type === 'application/pdf';
};

// Example usage in a component:
/*
import DocumentPicker from 'react-native-document-picker';
import ImagePicker from 'react-native-image-picker';
import { showDocumentOptions, requestCameraPermission, validateFileSize } from './documentUpload';

const handleDocumentUpload = () => {
  showDocumentOptions(
    // Camera
    async () => {
      const hasPermission = await requestCameraPermission();
      if (hasPermission) {
        ImagePicker.launchCamera(
          {
            mediaType: 'photo',
            quality: 0.8,
          },
          (response) => {
            if (response.assets && response.assets[0]) {
              const file = response.assets[0];
              // Handle the captured image
            }
          }
        );
      }
    },
    // Gallery
    () => {
      ImagePicker.launchImageLibrary(
        {
          mediaType: 'photo',
          quality: 0.8,
        },
        (response) => {
          if (response.assets && response.assets[0]) {
            const file = response.assets[0];
            // Handle the selected image
          }
        }
      );
    },
    // Documents
    async () => {
      try {
        const res = await DocumentPicker.pick({
          type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
        });
        // Handle the selected document
      } catch (err) {
        if (DocumentPicker.isCancel(err)) {
          // User cancelled
        } else {
          console.error('DocumentPicker Error: ', err);
        }
      }
    }
  );
};
*/