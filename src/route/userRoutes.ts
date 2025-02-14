import express from "express";

import userController from "../controller/userController";
import { accessValidation } from "../middleware/authMiddleware";
import upload from "../middleware/uploadMiddleware";

const router = express.Router();

router.get("/users", userController.getAllUsers);
router.post(
  "/auth/register",
  upload.single("fileUrl"),
  userController.register
);
router.post("/auth/login", userController.login);
router.get("/auth/profile", accessValidation, userController.getProfile);
router.put("/users/update/:npm", userController.update);
router.delete("/users/delete/:npm", userController.delete);

export default router;
