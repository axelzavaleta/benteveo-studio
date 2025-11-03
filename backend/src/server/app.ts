import "reflect-metadata"
import express from "express";
import morgan from "morgan";
import cors from "cors";
import userRoutes from "../routes/user.routes";

const server = express();

server.use(morgan("dev"));
server.use(cors());
server.use(express.json());

server.use("/user", userRoutes);

export default server;