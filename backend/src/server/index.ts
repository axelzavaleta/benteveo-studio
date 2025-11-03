import "reflect-metadata";
import server from "./app";
import { AppDataSource } from "../config/database";
import "dotenv/config"
import { seedInitialData } from "../seeds/initial-data";

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(async () => {
    console.log("Base de datos conectada");

    await seedInitialData();

    server.listen(PORT, () => {
      console.log(`Server is listening on http://localhost:${PORT}`);
    })
  })
  .catch((err) => {
    console.log(err);
  })
