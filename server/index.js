import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Import routes
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employeeRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import timeClockRoutes from './routes/timeClockRoutes.js';
import requestRoutes from './routes/requestRoutes.js';

// Load environment variables
config();

const app = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',  // Local development
  'http://localhost:3000',  // Local production build
  'https://act-vj78.onrender.com',  // Render production backend URL
  'https://dev-staging.onrender.com', // Render dev backend URL
  'https://employee-dashboard-sable.vercel.app',  // Main Vercel deployment
  'https://employee-dashboard-git-dev-asims-projects-56557ef2.vercel.app', // Dev deployment
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all Vercel preview deployments
    if (origin.includes('vercel.app')) {
      return callback(null, true);
    }

    // Check if the origin matches any allowed patterns
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads', 'profile-pics');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/time-clock', timeClockRoutes);
app.use('/api/requests', requestRoutes);

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

// Debug logging (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const errorResponse = {
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  };
  res.status(err.status || 500).json(errorResponse);
});

// Start server
const PORT = process.env.PORT || 3000;

// MongoDB connection with retry logic
const connectDB = async (retries = 5) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    if (retries > 0) {
      console.log(`MongoDB connection failed. Retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      return connectDB(retries - 1);
    }
    console.error('MongoDB connection failed after all retries:', error);
    process.exit(1);
  }
};

connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
});


