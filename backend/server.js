import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import formRoutes from './routes/formRoutes.js';
import responseRoutes from './routes/responseRoutes.js';
import authRoutes from './routes/authRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { sendInvites } from './controllers/emailController.js';
import { protect } from './middleware/authMiddleware.js';

dotenv.config();

const app = express();

// CORS — allow all .onrender.com origins + localhost for dev + vercel backup
const allowedOriginPattern = /\.onrender\.com$/;
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (
      allowedOriginPattern.test(new URL(origin).hostname) ||
      origin.startsWith('http://localhost') ||
      origin === 'survey-application-japan.vercel.app'
    ) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');

    // Drop the old unique index on shareToken if it exists
    try {
      const Form = mongoose.model('Form');
      const indexes = await Form.collection.indexes();
      const shareTokenIndex = indexes.find(
        (idx) => idx.key && idx.key.shareToken && idx.unique
      );
      if (shareTokenIndex) {
        await Form.collection.dropIndex(shareTokenIndex.name);
        console.log('Dropped old shareToken unique index');
      }
    } catch (indexErr) {
      // Index doesn't exist or already dropped — that's fine
    }
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api', formRoutes);
app.use('/api', responseRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', uploadRoutes); // Register /api/upload

// Email route — defined directly to avoid Express 5 router import issues
app.post('/api/email/invite', protect, sendInvites);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
