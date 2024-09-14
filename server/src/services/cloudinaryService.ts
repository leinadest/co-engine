import { v2 as cloudinary, type UploadApiOptions } from 'cloudinary';
import { type FileUpload } from 'graphql-upload/processRequest.js';

import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} from '../config/environment';

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImage(
  fileUpload: FileUpload,
  options?: UploadApiOptions
): Promise<{
  publicId: string;
  url: string;
}> {
  const executor = (
    resolve: (reason?: any) => void,
    reject: (reason?: any) => void
  ): void => {
    const stream = cloudinary.uploader.upload_stream(
      {
        ...options,
        ...fileUpload,
        use_filename: true,
      },
      (error, result) => {
        if (error !== undefined) {
          reject(error);
        }
        if (result !== undefined) {
          resolve(result);
        }
      }
    );
    fileUpload.createReadStream().pipe(stream);
  };

  const result = await new Promise<{ public_id: string; url: string }>(
    executor
  );

  return { publicId: result.public_id, url: result.url };
}

export async function deleteImage(publicId: string): Promise<any> {
  return await cloudinary.uploader.destroy(publicId);
}

export function createImageTag(publicId: string, transformation = {}): string {
  return cloudinary.image(publicId, transformation);
}
