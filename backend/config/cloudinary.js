import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isImage = file.mimetype && file.mimetype.startsWith('image/');
    
    // Extract the original extension from the file name
    const originalName = file.originalname || '';
    const extension = originalName.split('.').pop()?.toLowerCase();
    
    return {
      folder: 'pulse-forms',
      resource_type: isImage ? 'image' : 'raw',
      ...(isImage ? { transformation: [{ width: 1200, height: 1200, crop: 'limit' }] } : {
        // Cloudinary requires the original extension in the public_id for raw files
        // to recognize their format properly.
        public_id: `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      })
    };
  },
});

export { cloudinary, storage };
