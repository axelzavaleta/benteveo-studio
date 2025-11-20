import { AppDataSource } from "../config/database"
import UserStatus from "../entities/userStatus.entity"
import UserRole from "../entities/userRole.entity"
import Product from "../entities/product.entity";

const userStatusRepo = AppDataSource.getRepository(UserStatus);
const userRoleRepo = AppDataSource.getRepository(UserRole);
const productRepo = AppDataSource.getRepository(Product);

export const seedInitialData = async () => {
  const statusCount = await userStatusRepo.count();
  const roleCount = await userRoleRepo.count();
  const productCount = await productRepo.count();

  if (statusCount > 0 && roleCount > 0 && productCount > 0) return console.log("INITIAL DATA ALREADY EXIST");

  console.log("SEEDING INITIAL DATA...");

  if (statusCount === 0) {
    const statuses = userStatusRepo.create([
      { userStatusName: "activo" },
      { userStatusName: "inactivo" }
    ])

    await userStatusRepo.save(statuses);
  }

  if (roleCount === 0) {
    const roles = userRoleRepo.create([
      { userRoleName: "user" },
      { userRoleName: "admin" }
    ])

    await userRoleRepo.save(roles);
  }

  if (productCount === 0) {
    const products = productRepo.create([
      {
        productName: "Incógnita",
        productDesc: "Usa las botas espaciales de un detective y resuelve misterios con el poder de las ecuaciones en este único juego de investigación.",
        productPrice: 10000,
        productImageUrl: "/src/assets/incognita-logo-grande.png",
        productSize: 1000,
        productIsActive: true
      },
      {
        productName: "Cyber Alberdi",
        productDesc: "Usa las botas espaciales de un detective y resuelve misterios con el poder de las ecuaciones en este único juego de investigación.",
        productPrice: 7000,
        productImageUrl: "/src/assets/cyber-alberdi-icon.png",
        productSize: 2000,
        productIsActive: true
      },
      {
        productName: "Call Of Duty",
        productDesc: "Usa las botas espaciales de un detective y resuelve misterios con el poder de las ecuaciones en este único juego de investigación.",
        productPrice: 23500,
        productImageUrl: "/src/assets/game.avif",
        productSize: 50000,
        productIsActive: true
      },
    ])
  
    await productRepo.save(products);
  }

  console.log("INITIAL DATA SEEDED SUCCESSFULLY");
}