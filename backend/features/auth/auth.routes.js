import { Router } from "express";

import {
  login,
  refreshAccessToken,
  logout,
  updateProfile,
} from "./auth.controller.js";

const router = Router();

router.post("/login", login);

router.post(
  "/refresh-token",
  refreshAccessToken
);

router.post("/logout", logout);

router.post("/update-profile", updateProfile);

export default router;