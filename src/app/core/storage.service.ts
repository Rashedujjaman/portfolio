import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage;

  constructor() {
    const app = initializeApp(environment.firebase);
    this.storage = getStorage(app);
  }

  /**
   * Upload a file to Firebase Storage
   * @param file - The file to upload
   * @param path - The storage path (e.g., 'projects/project-id/image.jpg')
   * @param onProgress - Optional callback for upload progress
   * @returns Promise<string> - The download URL
   */
  async uploadFile(
    file: File, 
    path: string, 
    onProgress?: (progress: number) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const storageRef = ref(this.storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Calculate progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(Math.round(progress));
          }
        },
        (error) => {
          console.error('Upload failed:', error);
          reject(error);
        },
        async () => {
          // Upload completed successfully
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }

  /**
   * Delete a file from Firebase Storage
   * @param url - The download URL or storage path
   */
  async deleteFile(url: string): Promise<void> {
    try {
      // If it's a download URL, extract the path
      if (url.includes('firebase')) {
        const storageRef = ref(this.storage, url);
        await deleteObject(storageRef);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  }

  /**
   * Generate a unique filename
   * @param originalName - Original filename
   * @param prefix - Optional prefix for the filename
   */
  generateUniqueFilename(originalName: string, prefix?: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    const baseName = originalName.split('.').slice(0, -1).join('.');
    
    const cleanBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const prefixPart = prefix ? `${prefix}-` : '';
    
    return `${prefixPart}${cleanBaseName}-${timestamp}-${randomString}.${extension}`;
  }

  /**
   * Get storage path for project images
   * @param projectId - The project ID
   * @param filename - The filename
   */
  getProjectImagePath(projectId: string, filename: string): string {
    return `projects/${projectId}/images/${filename}`;
  }
}
