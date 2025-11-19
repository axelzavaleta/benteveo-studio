import "reflect-metadata"
import express from "express";
import morgan from "morgan";
import cors from "cors";
import userRoutes from "../routes/user.routes";
import authRoutes from "../routes/auth.routes";
import paymentRoutes from "../routes/payment.routes";
import productRoutes from "../routes/product.routes";

const server = express();

server.use(morgan("dev"));
server.use(cors());
server.use(express.json());

server.use("/user", userRoutes);
server.use("/auth", authRoutes);
server.use("/payment", paymentRoutes);
server.use("/product", productRoutes);

export default server;