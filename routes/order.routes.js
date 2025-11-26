import { Router } from "express";
import {
  createOrder,
  getrSingleOrderDetails,
  myOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/order.controllers.js";
import { verifyJwt, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/order/new").post(verifyJwt, createOrder);
router.route("/order/:id").get(verifyJwt, getrSingleOrderDetails);
router.route("/orders/me").get(verifyJwt, myOrders);

router
  .route("/admin/orders")
  .get(verifyJwt, authorizeRoles("admin"), getAllOrders);

router
  .route("/admin/order/:id")
  .put(verifyJwt, authorizeRoles("admin"), updateOrderStatus)
  .delete(verifyJwt, authorizeRoles("admin"), deleteOrder);

export default router;
