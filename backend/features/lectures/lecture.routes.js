import { Router } from "express";
import {
  createLecture,
  getLecturesByChapter,
  updateLecture,
  deleteLecture,
} from "./lecture.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = Router();

// Routes for lectures management (mounted at /lectures)
router.post("/", protect, createLecture);
router.get("/:chapterId", protect, getLecturesByChapter);
router.patch("/:id", protect, updateLecture);
router.delete("/:id", protect, deleteLecture);

export default router;
