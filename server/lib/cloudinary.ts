import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'riteshpatidar08',
  api_key: process.env.CLOUDINARY_API_KEY || 'mock_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'mock_secret',
});

/**
 * Uploads a file buffer to Cloudinary or saves it locally as a fallback.
 * @param fileBuffer - The file buffer from multer.
 * @param originalName - Original name of the uploaded file.
 * @returns - The public URL of the uploaded image.
 */
export const uploadToCloudinary = (fileBuffer: Buffer, originalName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // If Cloudinary keys are mock, save locally as a reliable fallback
    const isMock = !process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'riteshpatidar08';
    
    if (isMock) {
      try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        const fileName = `${Date.now()}-${originalName.replace(/\s+/g, '-')}`;
        const filePath = path.join(uploadDir, fileName);
        
        fs.writeFileSync(filePath, fileBuffer);
        
        // Return local relative URL
        resolve(`http://localhost:3000/public/uploads/${fileName}`);
        return;
      } catch (err: any) {
        reject(new Error(`Local fallback upload failed: ${err.message}`));
        return;
      }
    }

    // Standard Cloudinary upload stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'society_management_profile',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result?.secure_url || '');
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};
