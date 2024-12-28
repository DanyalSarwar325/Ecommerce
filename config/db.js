import mongoose from "mongoose";
export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            // serverSelectionTimeoutMS: 100000 // Increase the timeout if needed
        });
        console.log('MongoDB connected:', mongoose.connection.host);
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1); // Exit if the connection fails
    }
};