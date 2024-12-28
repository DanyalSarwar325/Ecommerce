// import {Product }from '../models/product.js';
import { Product } from '../models/product.model.js';
import express from 'express'
const app=express();
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import fs from 'fs'
import { log } from 'console';


app.use(express.json())

app.use(express.urlencoded({ extended: true }));

const createProduct = async (req, res) => {
  console.log(req.body);
  
  try {
    const { Name, Description, Price, Category ,Rating} = req.body;
    if (!Name || !Description || !Price || !Category) {
      return res.status(400).json({ error: "All fields are required" });
      toast
    }
    log(Name, Description, Price, Category, Rating);
// Add a new product
const files = req.files;
console.log(files);

    const image = files?.Image?.[0]; // Single image
    const subImages = files?.subImages || []; // Array of sub-images

    if (!image) {
      return res.status(400).json({ error: "Main image is required" });
    }

    // Upload main image
    const mainImageUpload = await uploadOnCloudinary(image.path);
    console.log(mainImageUpload);
    

    // Upload sub-images
    const subImageUploads = await Promise.all(
      subImages.map(async (file) => {
        return await uploadOnCloudinary(file.path);
      })
    );

    // Construct product data
    const product = new Product({
      Name,
      Description,
      Price,
      Category,
      Rating,
      Image: mainImageUpload.url,
      subImages: subImageUploads.map((img) => img.url),
    });

    const savedProduct = await product.save();
    console.log("Product saved:", savedProduct);
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error("Error in creating product:", err);
    res.status(500).json({ error: err.message });
  }
};
// Get all products
const getAllProducts = async (req, res) => {
    const { category } = req.query; // Extract category from query
    try {
      const products = category
        ? await Product.find({ Name:category }) // Filter by category
        : await Product.find(); // Fetch all products
      res.status(200).json(products); // Respond with data
    } catch (err) {
      res.status(500).json({ message: 'Error fetching products', error: err });
    }
  };
  

const getAllProductsByCategory=async(req,res)=>{
  try{

    const {category}=req.params;
    console.log({category});
  if(!category){
    return res.status(400).json({
      success:"false",
      message:"No Products Found"
    })
  }
  const products = await Product.find({ Category: category });
  console.log(products);
  
  if(category.length==0){
    return res.status(400).json({
      success:"false",

      message:"No products Exist in this Categort"
    })
  }
  res.status(200).json(products)
    
  }
  catch(error){
    console.log("Error in fetching Data", error)


  }
}

const getProdByName=async(req,res)=>{
  const {Name}=req.params;
  console.log(Name);
  
  try{
    if(!Name){
      return res.status(404).json({
        succcess:"false",
        message:"Please Provide Product Name"
      })

    }
    
const prod=await Product.find({Name:Name})
if(prod.length===0)
  { return res.status(404).json({
    success:"false",
    message:"No items found "
  })
  
}
res.status(200).json(prod)



  }
  catch(error){

  }

}
 const deleteProduct=async(req,res)=>{
  const {id}=req.params;
  if(!id){
    return res.status(400).json({
      success:"false",
      message:"Please Provide Product Id"
    })
  }
  const product=await Product.findByIdAndDelete(id);
  if(!product){
    return res.status(400).json({
      success:"false",
      message:"No Product Found"
    })
  }
  res.status(200).json({
    success:"true",
    message:"Product Deleted Successfully"
  })
}

const payment=async(req,res)=>{
  const { amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "inr",
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }

}
export { createProduct, getAllProducts,getAllProductsByCategory,getProdByName,payment,deleteProduct
 };

