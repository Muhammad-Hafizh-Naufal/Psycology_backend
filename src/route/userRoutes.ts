import express from "express";

import userController from "../controller/userController";

const router = express.Router();

router.get("/users", userController.getAllUsers);
router.post("/auth/register", userController.register);
router.put("/users/update/:npm", userController.update);
router.delete("/users/delete/:npm", userController.delete);

export default router;
