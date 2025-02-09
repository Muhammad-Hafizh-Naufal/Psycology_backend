import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

import * as yup from "yup";

const prisma = new PrismaClient();

type TRegister = {
  fullName: string;
  npm: number;
  jurusan: string;
  lokasiKampus: string;
  tempatLahir: string;
  tanggalLahir: Date;
  jenisKelamin: string;
  alamat: string;
  email: string;
  role: string;
  password: string;
  confirmPassword: string;
};

const registerValidateSchema = yup.object({
  fullName: yup.string().required(),
  npm: yup.number().required(),
  jurusan: yup.string().required(),
  lokasiKampus: yup.string().required(),
  tempatLahir: yup.string().required(),
  tanggalLahir: yup.date().required(),
  jenisKelamin: yup.string().required(),
  alamat: yup.string().required(),
  role: yup.string().oneOf(["user", "asisten", "programmer"]).required(),
  email: yup.string().email().required(),
  password: yup.string().required(),
});

export default {
  async getAllUsers(req: Request, res: Response) {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  },

  async register(req: Request, res: Response) {
    const {
      fullName,
      npm,
      jurusan,
      lokasiKampus,
      tempatLahir,
      tanggalLahir,
      jenisKelamin,
      alamat,
      role,
      email,
      password,
    } = req.body as TRegister;

    try {
      console.log(req.body);
      await registerValidateSchema.validate({
        fullName,
        npm,
        jurusan,
        lokasiKampus,
        tempatLahir,
        tanggalLahir,
        jenisKelamin,
        alamat,
        role,
        email,
        password,
      });

      const result = await prisma.user.create({
        data: {
          fullName,
          npm,
          jurusan,
          lokasiKampus,
          tempatLahir,
          tanggalLahir,
          jenisKelamin,
          alamat,
          role,
          email,
          password,
        },
      });

      res.status(200).json({ message: "Success Registration", data: result });
    } catch (error) {
      const err = error as Error;
      res
        .status(400)
        .json({ message: "Failed Registration", error: err.message });
    }
  },
};
