import express from "express";

import userController from "../controller/userController";
import {
  accessValidation,
  adminValidation,
} from "../middleware/authMiddleware";
import upload from "../middleware/uploadMiddleware";

const router = express.Router();

router.get("/users", userController.getAllUsers);
router.post("/auth/register", upload, userController.register);
router.post("/auth/login", userController.login);
router.get("/auth/profile", accessValidation, userController.getProfile);
router.put(
  "/users/update/:npm",
  accessValidation,
  adminValidation,
  upload,
  userController.update
);
router.delete(
  "/users/delete/:npm",
  accessValidation,
  adminValidation,
  userController.delete
);

export default router;
