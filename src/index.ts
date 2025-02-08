import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

import userRoutes from "./route/userRoutes";

dotenv.config();

async function main() {
  try {
    const app = express();
    const PORT = 3000;
    const prisma = new PrismaClient();

    const checkConnection = await prisma.$connect();
    console.log("Database status", checkConnection);

    app.use(cors());
    app.use(bodyParser.json());

    app.use("/api/users", userRoutes);

    app.listen(PORT, () => {
      console.log(`Server is running on  http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log("Server status", error);
  }
}

main();
