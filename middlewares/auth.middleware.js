import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierror.js";
import jwt from "jsonwebtoken";
import User from "../models/user.models.js";

export const verifyJwt = asynchandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.headers("Authorization")?.replace("Bearer ","")
        if(!token)
        {throw new ApiError(401,"access token is required")}
        const decodeToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodeToken._id).select("-password -refreshToken")
        if(!user)
        {throw new ApiError(401,"user not found with this token")}
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401,error?.message || "invalid access token")
    }
})