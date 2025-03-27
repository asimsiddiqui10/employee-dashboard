import mongoose from 'mongoose';
import { config } from 'dotenv';

// Load environment variables
config();

const connectToDatabase = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error('MONGO_URI is not defined');
        }
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB")
        return mongoose.connection
    } catch (error) {
        console.error("MongoDB connection error:", error)
        throw error
    }
}

export default connectToDatabase;