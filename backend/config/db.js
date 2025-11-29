import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME;

const connectDB = async () => {
  try {
    if (!MONGODB_URI) {
      console.warn('[DB] MONGODB_URI not set, running without database');
      return;
    }

    const options = {
      ...(MONGO_DB_NAME && { dbName: MONGO_DB_NAME }),
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    };

    console.log('[DB] Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI, options);
    console.log('[DB] ✅ MongoDB connected successfully');
    console.log('[DB] Database:', mongoose.connection.db?.databaseName || 'unknown');
  } catch (error) {
    console.error('[DB] ❌ MongoDB connection error:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('IP') || error.message.includes('whitelist')) {
      console.error('[DB] 💡 Solution: Add your IP address to MongoDB Atlas Network Access whitelist');
      console.error('[DB]   1. Go to: https://cloud.mongodb.com/');
      console.error('[DB]   2. Navigate to: Network Access → Add IP Address');
      console.error('[DB]   3. Add your current IP or use 0.0.0.0/0 for development (not recommended for production)');
    } else if (error.message.includes('authentication')) {
      console.error('[DB] 💡 Solution: Check your MongoDB username and password in MONGODB_URI');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('DNS')) {
      console.error('[DB] 💡 Solution: Check your MongoDB cluster URL in MONGODB_URI');
    }
    
    console.warn('[DB] Continuing without database connection');
  }
};

export default connectDB;

