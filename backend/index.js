import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import apiRouter from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL;

app.use(
  cors({
    origin: CLIENT_URL ? [CLIENT_URL] : '*'
  })
);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB if provided
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URL;
if (MONGODB_URI) {
  mongoose.set('bufferCommands', false);
  mongoose
    .connect(MONGODB_URI, { dbName: process.env.MONGO_DB_NAME || undefined })
    .then(() => console.log('Connected to MongoDB'))
    .catch((e) => console.error('MongoDB connect error', e));
} else {
  console.warn('MONGODB_URI not set. Analysis history will not be persisted.');
  // Disable buffering when MongoDB is not configured
  mongoose.set('bufferCommands', false);
}

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mongo: Boolean(mongoose.connection.readyState === 1),
    openai: Boolean(process.env.OPENAI_API_KEY),
    version: 'v1'
  });
});

// mount API routes
app.use('/api', apiRouter);

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
