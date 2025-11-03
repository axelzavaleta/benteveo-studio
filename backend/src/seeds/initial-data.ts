import { AppDataSource } from "../config/database"
import { UserStatus } from "../entities/userStatus.entity"
import { UserRole } from "../entities/userRole.entity"

const userStatusRepo = AppDataSource.getRepository(UserStatus);
const userRoleRepo = AppDataSource.getRepository(UserRole);

export const seedInitialData = async () => {
  const statusCount = await userStatusRepo.count();
  const roleCount = await userRoleRepo.count();

  if (statusCount > 0 && roleCount > 0) return console.log("INITIAL DATA ALREADY EXIST");

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
      { userRoleName: "admin" },
      { userRoleName: "user" }
    ])

    await userRoleRepo.save(roles);
  }

  console.log("INITIAL DATA SEEDED SUCCESSFULLY");
}