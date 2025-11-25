import { SearchFeatures } from "../utils/searchFeatures.js";
import { Product } from "../models/product.models.js";
import {ApiError} from "../utils/apierror.js"
import { ApiResponse } from "../utils/apiresponse.js";
import { asynchandler } from "../utils/asynchandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";

const getAllProducts = asynchandler(async(req,res)=>{
  const resultPerPage = 12;
  const productCount = await Product.countDocuments();
  // here we use seachFeatures for utils to seach and filter the products categories
  const searchFeatures = new SearchFeatures(Product.find(), req.query)
    .search()
    .filter();
  // and here we counts the seach products categories
  let products = await searchFeatures.query;
  let filterProductsCount = products.length;

  // it basically shows the filtered products in a page at what no.of pages assign to show on one page
  searchFeatures.pagination(resultPerPage);
  //.clone() creates a copy of the query so you can execute it again safely.
      products = await searchFeatures.query.clone();
      return res
      .status(200)
      .json(new ApiResponse(200,products,productCount,resultPerPage ,filterProductsCount,"all products are shown and categories also ") )

})
// get all products -- product sliders
const getProducts = asynchandler(async(req,res)=>{
    const products = await Product.find()
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          products,
          "all productsAll products retrieved successfully "
        )
      );

})
//getProductDetails
const getProductDetails = asynchandler(async(req,res)=>{
    const product = await Product.findById(req.params.id)
    if(!product)
    {throw new ApiError(404,"product not found ")}
    return res
    .status(200)
    .json(new ApiResponse(200,product,"product deyails are shown successfully"))
})
//get all products --- admin

const adminProducts = asynchandler(async(req,res)=>{
    const product = await Product.find();
    if(!product)
    {
        throw new ApiError(400,"product not found ")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,product,"all the products "))

})
//create products -- admin 
const createProduct = asynchandler(async(req,res)=>{
    
})
 
//updateProduct -- admin
const updateProduct = asynchandler(async(req,res)=>{

})
//delete product
const deleteProduct = asynchandler(async(req,res)=>{
    const product = await Product.findById(req.params.id)
    if(!product)
    {throw new ApiError(400,"product not found")}

     for (let i = 0; i < product.images.length; i++) {
       await cloudinary.v2.uploader.destroy(product.images[i].public_id);
     }
     await product.remove()
     return res
     .status(200)
     .json(new ApiResponse(200,deleteProduct,"delte product successfully"))

})
  

export {getAllProducts,getProducts,getProductDetails,adminProducts}
