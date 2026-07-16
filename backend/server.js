import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import itemRoutes from './routes/items.js';
import claimRoutes from './routes/claims.js';
import notificationRoutes from './routes/notifications.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';

// Load environment variables
dotenv.config();

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

// Enable CORS for all origins (restrict in production)
app.use(cors());

// Parse JSON request bodies (limit 10mb for base64 images if needed)
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Health-check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// Global Error Handler
// ---------------------------------------------------------------------------

// Serve the frontend React build
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route to serve the React app for non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

// ---------------------------------------------------------------------------
// Global Error Handler
// ---------------------------------------------------------------------------

// Centralized error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(', ');
    return res.status(400).json({
      success: false,
      message: `Duplicate value for field(s): ${field}`,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ---------------------------------------------------------------------------
// Start Server
// ---------------------------------------------------------------------------

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

export default app;
