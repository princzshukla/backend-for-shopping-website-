import { Order } from "../models/order.models";
import { ApiError } from "../utils/apierror.js";
import { asynchandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { Product } from "../models/product.models.js";
import { sendEmail } from "../utils/sendEmail.js";
//Create new Order

const createOrder = asynchandler(async (req, res) => {
  const { shippingInfo, orderItems, paymentInfo, totalPrice } = req.body;
  if (!shippingInfo || !orderItems || !paymentInfo || !totalPrice) {
    throw new ApiError(400, "all fields are required");
  }
  const orderExist = await Order.findOne({ paymentInfo });
  if (!orderExist) {
    throw new ApiError(400, "order does not exist");
  }

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    totalPrice,
    user: req.user._id,
    paidAt: Date.now(),
  });
  await sendEmail({
    email: req.user.email,
    templateId: process.env.SENDGRID_ORDER_TEMPLATEID,
    data: {
      name: req.user.name,
      shippingInfo,
      orderItems,
      totalPrice,
      oid: order._id,
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, order, "order created successfully"));
});
//Get single order

const getrSingleOrderDetails = asynchandler(async (req, res) => {
  const order = await Order.findById(req.params._id).populate(
    "user",
    "name email"
  );
  if (!order) {
    throw new ApiError(400, "oder does not exist with this id ");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, order, "order fetched successfully"));
});
//get logged in user orders

const myOrders = asynchandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  if (!orders) {
    throw new ApiError(400, "no orders found for this user");
  }
});
//get all orders --admin

const getAllOrders = asynchandler(async (req, res) => {
  const orders = await Order.find();
  if (!orders) {
    throw new ApiError(400, "no orders found");
  }
  let totalAmount = 0;
  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalAmount, orders },
        "orders fetched successfully"
      )
    );
});
//Update order status -- admin
const updateOrderStatus = asynchandler(async (req, res) => {
  const order = await Order.findById(req.params._id);
  if (!order) {
    throw new ApiError(400, "order not found with this id");
  }
  if (order.orderStatus === "Delivered") {
    throw new ApiError(400, "you have already delivered this order");
  }
  if (req.body.status === "Shipped") {
    order.shippedAt = Date.now();
    order.orderItems.forEach(async (i) => {
      await updateStock(i.product, i.quantity);
    });
  }
  order.orderStatus = req.body.status;
  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }
  await order.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, order, "order status updated successfully"));
});

//delete order -- admin
const deleteOrder = asynchandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new ApiError(400, "order not found ");
  }
  order.remove();
  return res
    .status(200)
    .json(new ApiResponse(200, deleteOrder, "order are deleted successfully"));
});

export {
  createOrder,
  getrSingleOrderDetails,
  myOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
};
