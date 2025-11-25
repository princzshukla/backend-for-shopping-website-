import { Router } from "express";
import {
  registerUser,
  loginUser,
  LogoutUser,
  getUserDetails,
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

const router = Router();

router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(verifyJwt, LogoutUser);

router.route("/me").get(verifyJwt, getUserDetails);

router.route("/password/forgot").post(forgetPassword);
router.route("/password/reset/:token").put(resetPassword);

router.route("/password/update").put(verifyJwt, updatePassword);

router
  .route("/me/update")
  .put(verifyJwt, upload.single("avatar"), updateProfile);

router.route("/admin/users").get(verifyJwt, getAllUsers);

router
  .route("/admin/user/:id")
  .get(verifyJwt, singleUser)
  .put(verifyJwt, updateUserRole)
  .delete(verifyJwt, deleteUser);

export default router;
