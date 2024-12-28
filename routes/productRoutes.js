import express, { Router } from 'express';
import { createProduct, getAllProducts,getAllProductsByCategory,getProdByName,deleteProduct } from '../controllers/ProductController.js';
import {registerUser, verifyEmail,loginUser,AddUpdate, findUser, logoutUser} from '../controllers/user.controller.js'
import {verifyJWT} from '../middlewarwes/auth.middleware.js'
import {upload} from '../middlewarwes/multer.middleware.js'


const router = express.Router();


router.get('/products', getAllProducts);
router.get('/products/:category',getAllProductsByCategory)
router.get('/item/:Name',getProdByName)
router.post('/register',registerUser)
router.post('/verify',verifyEmail)
router.post('/login',loginUser)
router.post('/update',AddUpdate)
router.post('/finduser',findUser)
router.delete('/products/:id', deleteProduct);
router.post('/logout',verifyJWT, logoutUser);


router.route('/addProducts')
  .post(
    upload.fields([
      { name: "Image",maxCount: 1 },
      { name: "subImages", maxCount: 5 },
    ]),
    createProduct
  );

export default router; 
