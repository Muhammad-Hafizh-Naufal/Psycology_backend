import express from "express";

import userController from "../controller/userController";
import upload from "../middleware/uploadMiddleware";

const router = express.Router();

router.get("/users", userController.getAllUsers);
router.post(
  "/auth/register",
  upload.single("fileUrl"),
  userController.register
);
router.put("/users/update/:npm", userController.update);
router.delete("/users/delete/:npm", userController.delete);

export default router;
