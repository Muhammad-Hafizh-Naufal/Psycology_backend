import { PrismaClient } from "@prisma/client";

import { Request, Response, NextFunction } from "express";
import * as yup from "yup";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET as string;

// Custom Request
interface CustomRequest extends Request {
  userData?: {
    id: string;
    role: string;
  };
}

type TRegister = {
  fullName: string;
  npm: string;
  kelas: string;
  jurusan: string;
  lokasiKampus: string;
  tempatLahir: string;
  tanggalLahir: Date;
  jenisKelamin: string;
  alamat: string;
  noHP: string;
  email: string;
  ipk: string;
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
  kelas: yup.string().required(),
  jurusan: yup.string().required(),
  lokasiKampus: yup.string().required(),
  tempatLahir: yup.string().required(),
  tanggalLahir: yup.date().required(),
  jenisKelamin: yup.string().required(),
  alamat: yup.string().required(),
  noHP: yup.string().required(),
  email: yup.string().email().required(),
  ipk: yup.string().required(),
  role: yup.string().oneOf(["user", "asisten", "programmer"]).required(),
  password: yup.string().required(),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Password not match")
    .required(),
});

const updateValidateSchema = yup.object({
  fullName: yup.string().optional(),
  npm: yup.string().optional(),
  kelas: yup.string().optional(),
  jurusan: yup.string().optional(),
  lokasiKampus: yup.string().optional(),
  tempatLahir: yup.string().optional(),
  tanggalLahir: yup.date().optional(),
  jenisKelamin: yup.string().optional(),
  alamat: yup.string().optional(),
  noHP: yup.string().optional(),
  email: yup.string().email().optional(),
  ipk: yup.string().optional(),
  role: yup.string().oneOf(["user", "asisten", "programmer"]).optional(),
  password: yup.string().optional(),
});

export default {
  // List All User

  // List All User dengan Fitur Search
  async getAllUsers(req: Request, res: Response) {
    const { search } = req.query; // Ambil parameter search dari query

    try {
      const searchTerm = (search as string)?.toLowerCase();
      const users = await prisma.user.findMany({
        where: searchTerm
          ? {
              OR: [
                { fullName: { contains: searchTerm } }, // Cari berdasarkan nama
                { npm: { contains: searchTerm } }, // Cari berdasarkan NPM
                { email: { contains: searchTerm } }, // Cari berdasarkan email
              ],
            }
          : {},
        select: {
          id: true,
          fullName: true,
          npm: true,
          kelas: true,
          jurusan: true,
          lokasiKampus: true,
          tempatLahir: true,
          tanggalLahir: true,
          jenisKelamin: true,
          alamat: true,
          noHP: true,
          email: true,
          ipk: true,
          role: true,
          cvUrl: true,
          krsUrl: true,
          pasFotoUrl: true,
          ktmUrl: true,
          ktpUrl: true,
          rangkumanNilaiUrl: true,
          certificateUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const baseUrl = "http://localhost:3000/api/uploads/";
      const usersWithImageUrl = users.map((user) => ({
        ...user,
        cvUrl: user.cvUrl ? `${baseUrl}${user.cvUrl}` : null,
        krsUrl: user.krsUrl ? `${baseUrl}${user.krsUrl}` : null,
        pasFotoUrl: user.pasFotoUrl ? `${baseUrl}${user.pasFotoUrl}` : null,
        ktmUrl: user.ktmUrl ? `${baseUrl}${user.ktmUrl}` : null,
        ktpUrl: user.ktpUrl ? `${baseUrl}${user.ktpUrl}` : null,
        rangkumanNilaiUrl: user.rangkumanNilaiUrl
          ? `${baseUrl}${user.rangkumanNilaiUrl}`
          : null,
        certificateUrl: user.certificateUrl
          ? `${baseUrl}${user.certificateUrl}`
          : null,
      }));

      res.status(200).json(usersWithImageUrl);
    } catch (error) {
      const err = error as Error;
      res
        .status(500)
        .json({ message: "Internal Server Error", error: err.message });
    }
  },

  // Get User by npm
  async getUserByNpm(req: Request, res: Response) {
    const { npm } = req.params;
    try {
      const user = await prisma.user.findUnique({
        where: {
          npm,
        },
      });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.status(200).json(user);
    } catch (error) {
      const err = error as Error;
      res
        .status(500)
        .json({ message: "Internal Server Error", error: err.message });
    }
  },

  // Register
  async register(req: Request, res: Response) {
    const {
      fullName,
      npm,
      kelas,
      jurusan,
      lokasiKampus,
      tempatLahir,
      tanggalLahir,
      jenisKelamin,
      alamat,
      noHP,
      email,
      ipk,
      role,
      password,
    } = req.body as TRegister;

    // Ambil File
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const cvUrl = files["cv"] ? files["cv"][0].filename : null;
    const krsUrl = files["krs"] ? files["krs"][0].filename : null;
    const pasFotoUrl = files["pasFoto"] ? files["pasFoto"][0].filename : null;
    const ktmUrl = files["ktm"] ? files["ktm"][0].filename : null;
    const ktpUrl = files["ktp"] ? files["ktp"][0].filename : null;
    const rangkumanNilaiUrl = files["rangkumanNilai"]
      ? files["rangkumanNilai"][0].filename
      : null;
    const certificateUrl = files["certificate"]
      ? files["certificate"][0].filename
      : null;

    try {
      await registerValidateSchema.validate({
        fullName,
        npm,
        kelas,
        jurusan,
        lokasiKampus,
        tempatLahir,
        tanggalLahir,
        jenisKelamin,
        alamat,
        noHP,
        email,
        ipk,
        role,
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
          kelas,
          jurusan,
          lokasiKampus,
          tempatLahir,
          tanggalLahir: new Date(tanggalLahir),
          jenisKelamin,
          alamat,
          noHP,
          email,
          ipk,
          role,
          cvUrl,
          krsUrl,
          pasFotoUrl,
          ktmUrl,
          ktpUrl,
          rangkumanNilaiUrl,
          certificateUrl,
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

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        SECRET_KEY,
        {
          expiresIn: "1h",
        }
      );

      res.status(200).json({
        message: "Success Login",
        data: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      const err = error as Error;
      res.status(400).json({ message: "Failed Login", err });
    }
  },

  // Get Profile
  async getProfile(req: CustomRequest, res: Response) {
    const userId = req.userData?.id;

    if (!userId) {
      res.status(404).json({ message: "User Not Found" });
      return; // Ensure the function exits after sending the response
    }

    try {
      const userData = await prisma.user.findUnique({
        where: { id: Number(userId) },
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
          noHP: true,
          email: true,
          role: true,
          cvUrl: true,
          krsUrl: true,
          pasFotoUrl: true,
          ktmUrl: true,
          ktpUrl: true,
          rangkumanNilaiUrl: true,
          certificateUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!userData) {
        res.status(404).json({ message: "User Not Found" });
        return; // Ensure the function exits after sending the response
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
        kelas,
        jurusan,
        lokasiKampus,
        tempatLahir,
        tanggalLahir,
        jenisKelamin,
        alamat,
        noHP,
        email,
        ipk,
        role,
        password,
      } = req.body as TRegister;

      await updateValidateSchema.validate({
        fullName,
        npm,
        kelas,
        jurusan,
        lokasiKampus,
        tempatLahir,
        tanggalLahir,
        jenisKelamin,
        alamat,
        noHP,
        email,
        ipk,
        role,
        password,
      });

      const checkUser = await prisma.user.findUnique({
        where: { npm: npm },
      });

      if (!checkUser) {
        res.status(404).json({ message: "User Not Found" });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Ambil file yang diunggah (jika ada)
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const cvUrl = files["cv"] ? files["cv"][0].filename : checkUser.cvUrl;
      const krsUrl = files["krs"] ? files["krs"][0].filename : checkUser.krsUrl;
      const pasFotoUrl = files["pasFoto"]
        ? files["pasFoto"][0].filename
        : checkUser.pasFotoUrl;
      const ktmUrl = files["ktm"] ? files["ktm"][0].filename : checkUser.ktmUrl;
      const ktpUrl = files["ktp"] ? files["ktp"][0].filename : checkUser.ktpUrl;
      const rangkumanNilaiUrl = files["rangkumanNilai"]
        ? files["rangkumanNilai"][0].filename
        : checkUser.rangkumanNilaiUrl;
      const certificateUrl = files["certificate"]
        ? files["certificate"][0].filename
        : checkUser.certificateUrl;

      const result = await prisma.user.update({
        where: { npm: checkUser.npm },
        data: {
          fullName,
          npm,
          kelas,
          jurusan,
          lokasiKampus,
          tempatLahir,
          tanggalLahir: new Date(tanggalLahir),
          jenisKelamin,
          alamat,
          noHP,
          email,
          ipk,
          role,
          cvUrl,
          krsUrl,
          pasFotoUrl,
          ktmUrl,
          ktpUrl,
          rangkumanNilaiUrl,
          certificateUrl,
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
