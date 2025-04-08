import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import authRouter from "./routes/auth.js"
import employeeRouter from "./routes/employeeRoutes.js"
import connectToDatabase from "./db/db.js"
import { config } from 'dotenv';
import notificationRoutes from './routes/notificationRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables
config();

const app = express()
app.use(cors())
app.use(express.json())

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads', 'profile-pics');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Connect to MongoDB Atlas
connectToDatabase()
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err))

// Routes
app.use('/api/auth', authRouter)
app.use('/api/employees', employeeRouter)
app.use('/api/notifications', notificationRoutes)

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add some debug logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});


  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})


