import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../types/auth";
import { Request, Response } from "express";
import * as yup from "yup";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET as string;

type TRegister = {
  fullName: string;
  npm: string;
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

type TLogin = {
  email: string;
  password: string;
};

const registerValidateSchema = yup.object({
  fullName: yup.string().required(),
  npm: yup.string().required(),
  jurusan: yup.string().required(),
  lokasiKampus: yup.string().required(),
  tempatLahir: yup.string().required(),
  tanggalLahir: yup.date().required(),
  jenisKelamin: yup.string().required(),
  alamat: yup.string().required(),
  role: yup.string().oneOf(["user", "asisten", "programmer"]).required(),
  email: yup.string().email().required(),
  password: yup.string().required(),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Password not match")
    .required(),
});

function generateToken(user: any) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    SECRET_KEY,
    {
      expiresIn: "1h",
    }
  );
}

export default {
  // List All User
  async getAllUsers(req: Request, res: Response) {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  },

  // Register
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

    const fileUrl = req.file ? req.file.filename : null;

    try {
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
        confirmPassword: password,
      });

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ npm: npm }, { email: email }],
        },
      });

      if (existingUser) {
        if (existingUser.npm === npm) {
          res.status(409).json({ message: "NPM already exists" });
          return;
        }
        res.status(409).json({ message: "Email already exists" });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await prisma.user.create({
        data: {
          fullName,
          npm,
          jurusan,
          lokasiKampus,
          tempatLahir,
          tanggalLahir: new Date(tanggalLahir),
          jenisKelamin,
          alamat,
          role,
          email,
          fileUrl,
          password: hashedPassword,
        },
      });

      res.status(200).json({ message: "Success Registration", data: result });
    } catch (error) {
      const err = error as Error;
      res.status(400).json({
        message: "Failed Registration",
        error: err.message,
        data: req.body,
      });
    }
  },

  // Login
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body as TLogin;

      // ambil data berdasarkan email
      const user = await prisma.user.findUnique({
        where: { email: email },
      });

      if (!user) {
        res.status(404).json({ message: "User Not Found" });
        return;
      }

      // cek password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        res.status(401).json({ message: "Invalid Password" });
        return;
      }

      // Generate JWT token
      const token = generateToken(user);

      res.status(200).json({ message: "Success Login", data: user, token });
    } catch (error) {
      const err = error as Error;
      res.status(400).json({ message: "Failed Login", err });
    }
  },

  // //  Me
  // async me(req: Request, res: Response) {},

  // Get Profile
  async getProfile(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;

    if (!userId) {
      return res.status(404).json({ message: "User Not Found" });
    }

    try {
      const userData = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          fullName: true,
          npm: true,
          jurusan: true,
          lokasiKampus: true,
          tempatLahir: true,
          tanggalLahir: true,
          jenisKelamin: true,
          alamat: true,
          email: true,
          role: true,
          fileUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!userData) {
        return res.status(404).json({ message: "User Not Found" });
      }

      res.status(200).json({ message: "User Profile", data: userData });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error: error });
    }
  },

  // Update
  async update(req: Request, res: Response) {
    try {
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

      await registerValidateSchema.validate({
        fullName,
        npm,
        jurusan,
        lokasiKampus,
        tempatLahir,
        tanggalLahir: new Date(tanggalLahir),
        jenisKelamin,
        alamat,
        role,
        email,
        password,
        confirmPassword: password,
      });

      const checkUser = await prisma.user.findUnique({
        where: { npm: npm },
      });

      if (!checkUser) {
        res.status(404).json({ message: "User Not Found" });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await prisma.user.update({
        where: { npm: checkUser.npm },
        data: {
          fullName,
          jurusan,
          lokasiKampus,
          tempatLahir,
          tanggalLahir: new Date(tanggalLahir),
          jenisKelamin,
          alamat,
          role,
          email,
          password: hashedPassword,
        },
      });

      res.status(200).json({ message: "User updated successfully", result });
    } catch (error) {
      const err = error as Error;
      res.status(400).json({
        message: "Failed Update",
        err,

        data: req.body,
      });
    }
  },

  // Delete
  async delete(req: Request, res: Response) {
    const { npm } = req.params;

    try {
      const checkUser = await prisma.user.findUnique({
        where: { npm: npm },
      });

      if (!checkUser) {
        res.status(404).json({ message: "User Not Found" });
        return;
      }

      const result = await prisma.user.delete({
        where: { npm: npm },
      });

      res.status(200).json({ message: "User deleted successfully", result });
    } catch (error) {
      const err = error as Error;
      res.status(400).json({ message: "Failed Delete User", err });
    }
  },
};
