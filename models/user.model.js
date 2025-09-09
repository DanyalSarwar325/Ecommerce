import mongoose from 'mongoose';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
 
  accessToken:{
    type:String
  },
  refreshToken:{
    type:String
  },
  // isVerified:{
  //   type:Boolean,
  //   default:false
  // },
  role:{
    type:String,
 enum:["Admin","User"],
 default:"User"
  },
  addresses: [
    {
      _id: false,
      country: { type: String,  },
      state: { type: String,  },
      postalcode: { type: String, },
      address: { type: String, },
      phone: { type: Number, },
    },
  ],
 

});

UserSchema.methods.IsPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password)
}

UserSchema.methods.generateAccessToken = function () {
 return  jwt.sign(
    {
      _id: this._id,
      name:this.name,
      email: this.email,
      
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  )
}
UserSchema.methods.generateRefreshToken = function () {
  return  jwt.sign(
        {
          _id: this._id,
       
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
      )
}
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  this.password =  await bcrypt.hash(this.password, 10)
  next()
})

UserSchema.pre('save', function(next) {
  if (!this.addresses) {
    this.addresses = []; // Initialize as an empty array
  }
  next();
});
 export const User= mongoose.model('User', UserSchema);
