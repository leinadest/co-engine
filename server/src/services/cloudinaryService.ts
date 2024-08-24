import { v2 as cloudinary } from 'cloudinary';

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

export async function uploadImage({
  filename,
  mimetype,
  encoding,
  createReadStream,
}: {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => NodeJS.ReadableStream;
}): Promise<{
  publicId: string;
  url: string;
}> {
  const options = { use_filename: true, filename, mimetype, encoding };
  try {
    const result = await new Promise<{ public_id: string; url: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          options,
          (error, result) => {
            if (error !== undefined) {
              reject(error);
            }
            if (result !== undefined) {
              resolve(result);
            }
          }
        );
        createReadStream().pipe(stream);
      }
    );
    console.log(result);
    return { publicId: result.public_id, url: result.url };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deleteImage(publicId: string): Promise<any> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export function createImageTag(publicId: string, transformation = {}): string {
  return cloudinary.image(publicId, transformation);
}
