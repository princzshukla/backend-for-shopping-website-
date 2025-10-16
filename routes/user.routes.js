import { Router } from "express";
import {
registerUser, 
loginUser, 
LogoutUser,
refreshAcessToken 
    } 
from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();




