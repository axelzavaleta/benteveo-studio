import express from "express";
import morgan from "morgan";
import cors from "cors";
import "reflect-metadata"

const server = express();

server.use(morgan("dev"));
server.use(cors());

export default server;