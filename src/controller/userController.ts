import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export default {
  async getAllUsers(req: Request, res: Response) {
    const users = await prisma.User.findMany();
    res.status(200).json(users);
  },
};
