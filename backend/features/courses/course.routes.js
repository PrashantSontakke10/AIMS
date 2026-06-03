import { Router } from "express";
import { createCourse, getCourses } from "./course.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = Router();

// Routes for courses management
router.post("/", protect, createCourse);
router.get("/", protect, getCourses);

export default router;