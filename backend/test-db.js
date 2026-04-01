import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const testConnection = async () => {
    try {
        console.log('Testing MongoDB connection...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('SUCCESS: Connected to MongoDB ATLAS!');
        process.exit(0);
    } catch (err) {
        console.error('FAILURE: Could not connect to MongoDB:', err.message);
        process.exit(1);
    }
};

testConnection();
