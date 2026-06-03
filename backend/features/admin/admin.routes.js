import { Router } from "express";
import {
  getStudents,
  approveStudent,
  blockStudent,
  assignCourse,
  removeCourse,
  assignCoursesAndApprove,
} from "./admin.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = Router();

// GET /api/admin/students
router.get("/students", protect, getStudents);

// PATCH /api/admin/approve
router.patch("/approve", protect, approveStudent);

// PATCH /api/admin/block
router.patch("/block", protect, blockStudent);

// PATCH /api/admin/assign-course
router.patch("/assign-course", protect, assignCourse);

// PATCH /api/admin/remove-course
router.patch("/remove-course", protect, removeCourse);

// Legacy POST endpoint for backward-compatibility
router.post("/assign-courses", protect, assignCoursesAndApprove);

export default router;
