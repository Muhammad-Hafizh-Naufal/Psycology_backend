import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

async function main() {
  try {
    const app = express();
    const PORT = 3000;
    const prisma = new PrismaClient();

    const checkConnection = await prisma.$connect();
    console.log("Database status", checkConnection);

    app.use(cors());
    app.use(bodyParser.json());

    app.get("/", (req, res) => {
      res.send("Hello World!");
    });

    app.listen(PORT, () => {
      console.log(`Server is running on  http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log("Server status", error);
  }
}

main();
