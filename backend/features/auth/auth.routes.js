import { Router } from "express";

import {
  login,
  refreshAccessToken,
  logout,
} from "./auth.controller.js";

const router = Router();

router.post("/login", login);

router.post(
  "/refresh-token",
  refreshAccessToken
);

router.post("/logout", logout);

export default router;