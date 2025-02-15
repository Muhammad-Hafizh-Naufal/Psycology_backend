// authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET as string;

interface CustomRequest extends Request {
  userData?: {
    id: string;
    role: string;
  };
}

export const accessValidation = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Access Denied, Token Required" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as any;
    req.userData = decoded;
    next();
  } catch (error) {
    const err = error as Error;
    res.status(403).json({ message: "Invalid Token", error: err.message });
  }
};

export const adminValidation = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.userData?.role !== "admin") {
    res.status(403).json({ message: "Access Denied, Admin Only" });
    return;
  }
  next();
};
