import express from 'express';
import multer from 'multer';
import { storage } from '../config/cloudinary.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage });

// Open upload route for both authenticated creators and public form submitters
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    res.json({
      success: true,
      url: req.file.path, // multer-storage-cloudinary gives us the URL here
      secure_url: req.file.path,
      public_id: req.file.filename,
      original_filename: req.file.originalname,
      resource_type: req.file.mimetype.startsWith('image/') ? 'image' : 'raw',
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload image', error: error.message });
  }
});

export default router;
