import { Router } from "express";
import multer from "multer";
import { createNote, getNotesByChapter, deleteNote } from "./note.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = Router();

// Configure Multer to use memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // Limit to 50MB
  },
});

// Admin endpoint to upload/add notes (supports multiple files)
router.post("/", protect, upload.array("files", 10), createNote);

// Student/authenticated user endpoint to fetch notes chapter-wise
router.get("/:chapterId", protect, getNotesByChapter);

// Admin endpoint to delete a note
router.delete("/:id", protect, deleteNote);

export default router;
