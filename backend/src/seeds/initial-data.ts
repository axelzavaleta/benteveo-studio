import { AppDataSource } from "../config/database"
import UserStatus from "../entities/userStatus.entity"
import UserRole from "../entities/userRole.entity"
import Product from "../entities/product.entity";
import { Tag } from "../entities/productTag.entity";
import { Platform } from "../entities/platform.entity";
import { Language } from "../entities/language.entity";
import { DeepPartial } from "typeorm";
import { User } from "../entities/user.entity";
import bcrypt from "bcrypt";

const userRepo = AppDataSource.getRepository(User);
const userStatusRepo = AppDataSource.getRepository(UserStatus);
const userRoleRepo = AppDataSource.getRepository(UserRole);
const tagRepo = AppDataSource.getRepository(Tag);
const platformRepo = AppDataSource.getRepository(Platform);
const languageRepo = AppDataSource.getRepository(Language);
const productRepo = AppDataSource.getRepository(Product);

export const seedInitialData = async () => {
  const userCount = await userRepo.count();
  const statusCount = await userStatusRepo.count();
  const roleCount = await userRoleRepo.count();
  const tagCount = await tagRepo.count();
  const platformCount = await platformRepo.count();
  const languageCount = await languageRepo.count();
  const productCount = await productRepo.count();

  if (
    userCount > 0 &&
    statusCount > 0 && 
    roleCount > 0 && 
    productCount > 0 && 
    tagCount > 0 && 
    platformCount > 0 && 
    languageCount > 0
  ) return console.log("INITIAL DATA ALREADY EXIST");

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

  if (tagCount === 0) {
    const tags = tagRepo.create([
      { tagName: "Educativo" },
      { tagName: "Puzzle" },
      { tagName: "Misterio" },
      { tagName: "Aventura" },
      { tagName: "Estrategia" }
    ])

    await tagRepo.save(tags);
  }

  if (platformCount === 0) {
    const platforms = platformRepo.create([
      { platformName: "PC" },
      { platformName: "PlayStation 5" },
      { platformName: "Nintengo Switch" },
      { platformName: "Xbox One" },
      { platformName: "Mobile" }
    ])

    await platformRepo.save(platforms);
  }

  if (languageCount === 0) {
    const languages = languageRepo.create([
      { languageName: "Español" },
      { languageName: "Ingles" }
    ])

    await languageRepo.save(languages);
  }

  if (productCount === 0) {
    const tag1 = await tagRepo.findOneBy({ tagId: 1 });
    const tag2 = await tagRepo.findOneBy({ tagId: 2 }); 
    const tag3 = await tagRepo.findOneBy({ tagId: 3 }); 
    const tag4 = await tagRepo.findOneBy({ tagId: 4 }); 
    const tag5 = await tagRepo.findOneBy({ tagId: 5 }); 

    const platform1 = await platformRepo.findOneBy({ platformId: 1 });
    const platform2 = await platformRepo.findOneBy({ platformId: 2 });
    const platform3 = await platformRepo.findOneBy({ platformId: 3 });
    const platform4 = await platformRepo.findOneBy({ platformId: 4 });
    const platform5 = await platformRepo.findOneBy({ platformId: 5 });
    
    const language1 = await languageRepo.findOneBy({ languageId: 1 });
    const language2 = await languageRepo.findOneBy({ languageId: 2 });
        
    const productsData = [
      {
        productName: "Incógnita",
        productShortDesc: "Usa las botas espaciales de un detective y resuelve misterios con el poder de las ecuaciones en este único juego de investigación.",
        productLongDesc: "Incógnita es una experiencia educativa ambientada en el espacio. Como jugador deberás usar el poder de las ecuaciones para conseguir pistas y resolver el misterio que atormenta a toda la galaxia, o incluso el universo.¡Es ideal para apoyar a los jóvenes en su aprendizaje de las matemáticas! Captando su curiosidad y ayudándoles a descubrir la utilidad de las ecuaciones.",
        productSize: 1000,
        productDeveloper: "Benteveo Studio",
        productCatalogImageUrl: "/src/assets/incognita-logo-grande.png",
        productCoverImageUrl: "/src/assets/incognita-portada-hor.jpeg",
        productPrice: 10000,
        productIsActive: true,
        productReleasedDate: "2025-07-18",
        tags: [tag1, tag2, tag3],
        platforms: [platform1],
        languages: [language1],
      },
      {
        productName: "Cyber Alberdi",
        productShortDesc: "CyberAlberdi es un juego de ciberseguridad ambientado en un mundo cyberpunk.",
        productLongDesc: "CyberAlberdi es un juego de ciberseguridad ambientado en un mundo cyberpunk. El jugador debe enfrentar distintos enemigos que representan ataques cibernéticos, acompañado por ROB-erTo, un compañero robot. Juntos buscan conseguir cristales con un propósito peculiar.",
        productSize: 1000,
        productDeveloper: "Pablo Santellan",
        productCatalogImageUrl: "/src/assets/cyber-alberdi-icon.png",
        productCoverImageUrl: "/src/assets/Alberdi.jpg",
        productPrice: 7000,
        productIsActive: true,
        productReleasedDate: "2024-12-18",
        tags: [tag2, tag3, tag4],
        platforms: [platform1, platform5, platform4],
        languages: [language1, language2]
      },
      {
        productName: "Call Of Duty",
        productShortDesc: "Call Of Duty es una popular franquicia de videojuegos de disparos en primera persona.",
        productLongDesc: "Originalmente ambientado en la Segunda Guerra Mundial, la saga ha evolucionado para incluir conflictos modernos, futuristas e incluso espaciales, ofreciendo una variedad de experiencias en tierra, mar y aire.",
        productSize: 25000,
        productDeveloper: "Activision",
        productCatalogImageUrl: "/src/assets/game.avif",
        productCoverImageUrl: "/src/assets/blackop7.jpg",
        productPrice: 20000,
        productIsActive: true,
        productReleasedDate: "2003-10-29",
        tags: [tag1, tag2, tag3, tag4, tag5],
        platforms: [platform1, platform2, platform3, platform5],
        languages: [language1, language2]
      },
    ]

    if (userCount === 0) {
      const hashedPass = await bcrypt.hash("contra", 10);

      const users = userRepo.create([
        { 
          userName: "Admin", 
          userEmail: "admin@admin.com", 
          userPassword: hashedPass, 
          userIsVerified: true, 
          userRoleId: 2,
          userStatusId: 1
        },
      ])

      await userRepo.save(users);
    }

    const products = productRepo.create(productsData as DeepPartial<Product[]>)
  
    await productRepo.save(products);
  }

  console.log("INITIAL DATA SEEDED SUCCESSFULLY");
}