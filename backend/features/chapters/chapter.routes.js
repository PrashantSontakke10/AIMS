import { Router } from "express";
import {
  createChapter,
  getChaptersByCourse,
  updateChapter,
  deleteChapter,
} from "./chapter.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = Router();

// Routes for chapters management (mounted at /chapters)
router.post("/", protect, createChapter);
router.get("/:courseId", protect, getChaptersByCourse);
router.patch("/:id", protect, updateChapter);
router.delete("/:id", protect, deleteChapter);

export default router;
