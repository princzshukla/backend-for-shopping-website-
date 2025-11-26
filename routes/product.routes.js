import { Router } from "express";
import {
  getAllProducts,
  getProductDetails,
  updateProduct,
  deleteProduct,
  getProductReviews,
  deleteReview,
  createProductReview,
  createProduct,
  adminProducts,
  getProducts,
} from "../controllers/product.controllers.js";
import { verifyJwt, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/products").get(getAllProducts);
router.route("/products/all").get(getProducts);

router
  .route("/admin/products")
  .get(verifyJwt, authorizeRoles("admin"), adminProducts);
router
  .route("/admin/product/new")
  .post(verifyJwt, authorizeRoles("admin"), createProduct);

router
  .route("/admin/product/:id")
  .put(verifyJwt, authorizeRoles("admin"), updateProduct)
  .delete(verifyJwt, authorizeRoles("admin"), deleteProduct);

router.route("/product/:id").get(getProductDetails);

router.route("/review").put(verifyJwt, createProductReview);

router
  .route("/admin/reviews")
  .get(getProductReviews)
  .delete(verifyJwt, deleteReview);

export default router;
