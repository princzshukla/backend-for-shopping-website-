import { Router } from "express";
import {
  registerUser,
  loginUser,
  LogoutUser,
  refreshAccessToken,
  forgetPassword,
  resetPassword,
  updatePassword,
  updateProfile,
  getAllUsers,
  singleUser,
  updateUserRole,
  deleteUser,
} from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";


router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(LogoutUser);

router.route("/me").get(verifyJwt, getUserDetails);

router.route("/password/forgot").post(forgetPassword);
router.route("/password/reset/:token").put(resetPassword);

router.route("/password/update").put(verifyJwt, updatePassword);

router.route("/me/update").put(verifyJwt, updateProfile);

router
  .route("/admin/users")
  .get(verifyJwt, authorizeRoles("admin"), getAllUsers);

router
  .route("/admin/user/:id")
  .get(verifyJwt, authorizeRoles("admin"), singleUser)
  .put(verifyJwt, authorizeRoles("admin"), updateUserRole)
  .delete(verifyJwt, authorizeRoles("admin"), deleteUser);



const router = Router();




