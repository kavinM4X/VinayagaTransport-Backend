import { Router } from "express";
import { body } from "express-validator";
import { login, register, refreshToken } from "../controllers/auth.controller.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", [
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
], validateRequest, register);

router.post("/login", [
  body("email").isEmail(),
  body("password").notEmpty(),
], validateRequest, login);

router.post("/refresh", requireAuth, refreshToken);

export default router;
