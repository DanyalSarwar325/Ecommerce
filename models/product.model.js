import mongoose from 'mongoose';
// import UpdatedProducts from './UpdateProducts.js';
// // import Products from './products.js';
import { UpdatedProducts } from './shamir.products.js';
const MONGO_URI="mongodb+srv://danyal:dasaramongo@cluster0.p70jt.mongodb.net/"

const productSchema = new mongoose.Schema({

  Name: {
    type: String,
    required: true,
    trim: true,
  },
  Rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5,
  },
  Description: {
    type: String,
    required: true,
  },
  Price: {
    type: Number,
    required: true,
    min: 0,
  },
  Tag: {
    type: String,
    default: "Regular",
  },
  Category: {
    type: String,
    required: true,
  },
  subCategory: {
    type: String,
  },
  Image: {
    type: String,
    required: true,
  },
  subImages:
   {
    type:Array,


   },
   orignalPrice:{
    type:Number,
    
   },
   Discount:{
    type:Number
   },
   DiscountAllowed:{
    type:Number
   },
   tagLine:{
    type:String,
   },
  
}, { timestamps: true });

const Product=mongoose.model('Product',productSchema);


const addProducts=async ()=>{
  try{
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');
    const result = await Product.insertMany(UpdatedProducts);
    console.log('Products added successfully:', result);
  } catch (error) {
    console.error('Error adding products:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
}

// addProducts();
export {Product};
  


