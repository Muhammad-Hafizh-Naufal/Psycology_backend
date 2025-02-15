import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

import userRoutes from "./route/userRoutes";

dotenv.config();

async function main() {
  const app = express();
  const PORT = 3000;
  const prisma = new PrismaClient();

  const checkConnection = await prisma.$connect();
  console.log("Database status", checkConnection);

  try {
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.get("/", (req, res) => {
      res.status(200).json({ message: "Server is running" });
    });

    app.use("/api", userRoutes);

    app.listen(PORT, () => {
      console.log(`Server is running on  http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log("Server status", error);
  }
}

main();
