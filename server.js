import express from 'express';
import dotenv from 'dotenv';
const app=express();
import cors from  'cors'
import { errorHandler } from './middlewarwes/errorHandler.js';

dotenv.config();

import {connectDB} from "./config/db.js";
app.use(cors({
  origin: 'https://frontend-shopping-1mc5.vercel.app/', // Replace with your frontend's origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  credentials: true // If you use cookies or HTTP authentication
}));
import productRoutes from './routes/productRoutes.js';



// Middleware
app.use(express.json());
app.use(errorHandler);

// Connect to database


// Routes
app.use('/api/v1', productRoutes);

// Error handler
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  {
    connectDB();
   console.log(`Server running on port ${PORT}`)
  })

