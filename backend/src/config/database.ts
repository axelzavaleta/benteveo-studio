import { DataSource } from "typeorm";
import { UserRole } from "../entities/userRole.entity.ts";
import { UserStatus } from "../entities/userStatus.entity.ts";
import { User } from "../entities/user.entity.ts";
import "dotenv/config";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || "postgres",
  database: process.env.DB_DATABASE || "benteveo_studio_db",
  password: process.env.DB_PASSWORD || "",
  logging: true,
  synchronize: false,
  entities: [User, UserRole, UserStatus]
})