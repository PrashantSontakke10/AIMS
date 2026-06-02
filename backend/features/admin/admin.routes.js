import { Router } from "express";
import { assignCoursesAndApprove } from "./admin.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = Router();

// Endpoint to approve a user and assign courses (Admin only, verified via JWT)
router.post("/assign-courses", protect, assignCoursesAndApprove);

export default router;
