import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
// import {uploadOnCloudinary} from '../utils/cloudinary.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'
import {transporter} from '../utils/nodemailer.js'
import { log } from 'console'

export const registerUser= async (req,res)=>{
//get user details
const {name,email,password}=req.body;
console.log(req.body)
//validations
if([name,password,email].some((field)=>
field?.trim()=="")){
    throw new ApiError(400, "All fields are required");
}
//if user already exists
const existingUser= await User.findOne({
   email
})
if(existingUser){
 return res.status(400).json({
    success:false,
    message:"User already exists"
})
}
const verificationToken=Math.floor(100000+Math.random()*900000).toString(); 

const user=await User.create({
    name:name,
    email,
    password,
    verificationToken,
    addresses: {},
   
})

const mailOptions = {
    from: "anonymous52839626@gmail.com", // Your email
    to: email, // User's email
    subject: "Verify Your Email",
    html: `
      <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Verify Your Email</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>Thank you for signing up! Your verification code is:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50;">${verificationToken}</span>
    </div>
    <p>Enter this code on the verification page to complete your registration.</p>
    <p>This code will expire in 15 minutes for security reasons.</p>
    <p>If you didn't create an account with us, please ignore this email.</p>
    <p>Best regards,<br>StylesSphere</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
    `,
  };

  await transporter.sendMail(mailOptions);

const createdUser= await User.findById(user._id).select("-password")
if(!createdUser){
    return res.status(400).json(new ApiResponse(400,{},"User not exist "))
}

const userResponse = {
    _id: createdUser._id,
    username: createdUser.name,
    email: createdUser.email,
    verificationToken: createdUser.verificationToken,
    addressess: createdUser.addresses,
  };
return res.status(200).json(
    new ApiResponse(200,userResponse,"User Created Sucessfully")
)
}




const generateAccessAndRefreshToken=async(userId)=>{
    try {
        const user= await User.findById(userId);
        console.log(user);
        
        const accessToken= await user.generateAccessToken();
        const refreshToken=await user.generateRefreshToken();
        console.log(refreshToken);

        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}

        
    } catch (error) {
        console.log("Error in generating Tokens",error);
        
        
    }
}





export const refreshAccessToken=async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken||req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }
   try {
     const decodedToken=  jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
     if(!decodedToken){
         throw new ApiError(401,"Invalid Token")
     }
     const user=await User.findById(decodedToken?._id)
     if(!user){
         throw new ApiError(401,"Token Is used or expired")
     }
 if(incomingRefreshToken!==user?.refreshToken){
     throw new ApiError(401,"Expired Token")
 }
 const options={
     httpOnly:true,
     secure:true}
 
     const {accessToken,newrefreshToken}=await generateAccessAndRefreshToken(user._id)
 
     return res.status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",newrefreshToken,options)
     .json(
         new ApiResponse(200,{accessToken,refreshToken:newrefreshToken},"Token generated Sucessfully")
     )
   } catch (error) {
    console.log("error occured in generating refreshToken",error)
    
   }


}

export const changeCurrentPassword=async(req,res)=>{
    const {oldPassword,newPassword}=req.body;
    console.log(req);
    
    const user= await User.findById(req.user?._id);
    console.log(user);
    

   const PasswordCorrect= await user.IsPasswordCorrect(oldPassword);
   console.log(PasswordCorrect);
   

   if(!IsPasswordCorrect){
    throw new ApiError(400,"Password is not valid")
   }
   user.password=newPassword;

   await user.save({validateBeforeSave:false})

    return res.status(200)
    .json(new ApiResponse( 200, {},"Password Sucessfully Changed"))

}

export const getCurrentUser=asyncHandler(async(req,res)=>{
    return res.status(200).
    json(new ApiResponse(200,req.user,"user fetched Sucessfully"))
})

export const UpdateAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.files?.avatar[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }
    const Avatar= await uploadOnCloudinary(avatarLocalPath);
    if(!Avatar.url){
        throw new ApiError(404,"Avatar is missing for cloudinary")
    }
    const user= await User.findByIdAndUpdate(req.user._id,{
        avatar:Avatar.url
    },{new:true}).select("-password ")
    return res.status(200).json(new ApiResponse(200,user,"Avatar Updated Sucessfully"))
})

export const UpdateCoverImage=asyncHandler(async(req,res)=>{
    const coverImageLocalPath=req.files?.avatar[0]?.path;
    if(!coverImageLocalPath){
        throw new ApiError(400,"coverImage is required")
    }
    const coverImage= await uploadOnCloudinary(coverImageLocalPath);
    if(!coverImage.url){
        throw new ApiError(404,"coverImage is missing for cloudinary")
    }
    const user= await User.findByIdAndUpdate(req.user._id,{
        coverImage:coverImage.url
    },{new:true}).select("-password ")
    return res.status(200).json(new ApiResponse(200,user,"coverImage Updated Sucessfully"))
})

export const verifyEmail =async (req, res) => {
 
    
    const {verificationCode}=req.body;

    if(!verificationCode){
        return res.status(400).json({
            success:false,
            message:"Verification code is required"
        })
    }
    console.log('Verification code from req.body:', req.body.verificationCode);
    console.log('Verification code data type:', typeof req.body.verificationCode);
    try {
        
   
    const user= await User.findOne({
        verificationToken:verificationCode,
    
    });

    
// console.log("verificationToken" ,user.verificationToken);   

    console.log(user)
    
    if(!user){
        return res.status(400).json({
            success:false,
            message:"Invalid or expired verification code"
        })
    } 


    
     user.isVerified=true;
    user.verificationToken=undefined;
 
     await user.save();
    
   

    return res.status(200).json({
        success: true,
        message: "Email verified successfully"
    });
    


} catch (error) {
    console.error('Error in verifyEmail controller:', error);
    res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
    });
}
   
}



  const GenerateAccessAndRefreshToken=async(userId)=>{
    console.log(userId)
    try {
        const user= await User.findById(userId);
        console.log(user);
        
        const accessToken= await user.generateAccessToken();
        const refreshToken=await user.generateRefreshToken();
        console.log(refreshToken);

        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}

        
    } catch (error) {
        console.log("Error in generating Tokens",error);
        
        
    }
}

export const loginUser=async(req,res,next)=>{
    try {
        const {email,password}=req.body;
        console.log(email,password);
        if(!email){
            throw new ApiError(400,"Provide email")
        }
        const user=await User.findOne({email
        })
         console.log(user);
        
        if(!user){
            throw new ApiError(401,"User not exist")
        }
        
        const PasswordValid= await user.IsPasswordCorrect(password);
        console.log(PasswordValid);
        
        if(!PasswordValid){
            throw new ApiError(400,"Invalid Credentials")
        }
    const {accessToken,refreshToken} = await GenerateAccessAndRefreshToken(user._id);
    // console.log(accessToken,refreshToken);
    
    const loggedInUser= await User.findById(user._id).select("-password -refreshToken")
    // console.log(loggedInUser);
    
    
    const options = {
        httpOnly: false, // Allows the frontend to access the cookie (make it true if you only need server-side access)
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Allow cross-origin requests in production
    };
    return res.status(200)
    .cookie("refreshToken",refreshToken,options)
    .cookie("accessToken",accessToken,options)
    .cookie("userInfo", JSON.stringify(loggedInUser), options) 
    .json(new ApiResponse(200,{
        user:loggedInUser,accessToken,refreshToken
    },"User Logged Succesfully"))


    } catch (error) {
        next(error);
        
    }
}

export const AddUpdate = async (req, res) => {
    const { country, state, postalcode, address,phone ,id } = req.body;
    console.log(req.body);
  
    // Validate required fields
    if (!country || !state || !postalcode || !address||!phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
  
    try {
      // Find the user by ID
      const user = await User.findOne({_id: id});
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",

        });
      }
  
      // Add the new address
      user.addresses={
        country,
        state,
        postalcode,
        address,
        phone,
      }
  
      // Save the updated user
      await user.save();
  
      return res.status(200).json({
        success: true,
        message: "Address updated successfully",
      });
    } catch (error) {
      console.error("Error updating address:", error);
      return res.status(500).json({
        success: false,
        message: "Server error. Please try again later.",
      });
    }
  };
  

export const findUser=async(req,res)=>{
    const{ID}=req.body;
    console.log(ID);
    
    if(!ID){
        return res.status(400).json({
            success:false,
            message:"Provide id"
        })
    }
    const user=await User.findOne({_id:ID});
    if(!user){
        return res.status(400).json({
            success:false,
            message:"User not found"
        })
    }
    return res.status(200).json({
        success:true,
        user
    })

}
export const logoutUser=async(req,res)=>{
    try {
        await User.findByIdAndUpdate(req.user._id,{
            refreshToken:undefined,
        },{new:true})
        const options={
            httpOnly:true,
            secure:true
        }
        res.status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(new ApiResponse(200,{},"User logged out Sucessfully"))
    } catch (error) {
        throw new ApiError(500,"Error In logging")
    }
}