import express from "express";

import userController from "../controller/userController";

const router = express.Router();

router.get("/users", userController.getAllUsers);
router.post("/auth/register", userController.register);

export default router;
