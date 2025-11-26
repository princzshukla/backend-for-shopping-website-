import express from "express";
import cors from "cors";
import cookieparser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));
app.use(cookieparser());

import userRoutes from "./routes/user.routes.js";
import orderRoutes from "./routes/order.routes.js"
import productRoutes from "./routes/product.routes.js"

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/products", productRoutes);


export { app };
