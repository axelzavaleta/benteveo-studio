import "reflect-metadata"
import { DataSource } from "typeorm";
import { User } from "../entities/user.entity";
import UserRole from "../entities/userRole.entity";
import UserStatus from "../entities/userStatus.entity";
import "dotenv/config";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || "postgres",
  database: process.env.DB_DATABASE || "benteveo_studio_db",
  password: process.env.DB_PASSWORD || "",
  logging: true,
  synchronize: true,
  entities: [User, UserRole, UserStatus]
})