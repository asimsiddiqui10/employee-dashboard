import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import authRouter from "./routes/auth.js"
import employeeRouter from "./routes/employeeRoutes.js"
import connectToDatabase from "./db/db.js"


const app = express()
app.use(cors())
app.use(express.json())

// Connect to MongoDB Atlas
connectToDatabase()
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err))

// Routes
app.use('/api/auth', authRouter)
app.use('/api/employees', employeeRouter)

// Add some debug logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});


  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})


