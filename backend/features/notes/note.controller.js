import mongoose from "mongoose";
import Note from "./note.model.js";
import Chapter from "../chapters/chapter.model.js";
import { findOrCreateFolder, uploadFile, deleteFile } from "../../utils/googleDrive.js";

// Helper check for admin role
const checkAdmin = (req, res) => {
  if (req.user.role !== "admin") {
    res.status(403).json({
      message: "Access denied. Admins only.",
    });
    return false;
  }
  return true;
};

// Allowed MIME types for educational notes
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/markdown",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/zip",
  "application/x-zip-compressed"
];

// POST /notes - Admin only
export const createNote = async (req, res) => {
  try {
    if (!checkAdmin(req, res)) return;

    const { title, description, chapterId } = req.body;

    if (!chapterId) {
      return res.status(400).json({
        message: "chapterId is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(chapterId)) {
      return res.status(400).json({
        message: "Invalid chapterId format",
      });
    }

    if (title && title.trim().length > 100) {
      return res.status(400).json({
        message: "Custom title cannot exceed 100 characters",
      });
    }

    if (description && description.trim().length > 500) {
      return res.status(400).json({
        message: "Description cannot exceed 500 characters",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "At least one file upload is required under the key 'files'",
      });
    }

    // Validate MIME types of all files before initiating uploads
    for (const file of req.files) {
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return res.status(400).json({
          message: `File type '${file.mimetype}' is not allowed. Only documents, spreadsheets, slides, PDFs, TXT, common images, and ZIP files are accepted.`,
        });
      }
    }

    // Verify chapter exists and populate course details
    const chapter = await Chapter.findById(chapterId).populate("course");
    if (!chapter) {
      return res.status(404).json({
        message: "Chapter not found",
      });
    }

    const course = chapter.course;
    if (!course || !course.title) {
      return res.status(400).json({
        message: "Associated course or course title is missing",
      });
    }

    const courseTitle = course.title.trim();
    const parentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!parentFolderId) {
      return res.status(500).json({
        message: "Server configuration error: GOOGLE_DRIVE_FOLDER_ID is missing in environment variables",
      });
    }

    // Find or create course folder inside parent folder
    const courseFolderId = await findOrCreateFolder(courseTitle, parentFolderId);

    // Find or create chapter folder inside course folder
    const chapterTitle = chapter.title.trim();
    const chapterFolderId = await findOrCreateFolder(chapterTitle, courseFolderId);

    const createdNotes = [];
    const uploadedDriveFileIds = [];

    try {
      // Loop and upload all files
      for (const file of req.files) {
        // Determine note title: if body.title is provided, prefix or use it
        let noteTitle = file.originalname;
        if (title && title.trim()) {
          noteTitle = req.files.length === 1 
            ? title.trim() 
            : `${title.trim()} - ${file.originalname}`;
        }

        // Upload note file to Google Drive (into the chapter folder)
        const driveFile = await uploadFile(
          file.buffer,
          file.originalname,
          file.mimetype,
          chapterFolderId
        );

        // Keep track of uploaded drive files in case we need to roll back
        uploadedDriveFileIds.push(driveFile.fileId);

        // Create Note record in database
        const note = await Note.create({
          title: noteTitle,
          description: description ? description.trim() : undefined,
          fileId: driveFile.fileId,
          fileUrl: driveFile.webViewLink,
          downloadUrl: driveFile.webContentLink,
          chapter: chapterId,
        });

        createdNotes.push(note);
      }
    } catch (uploadError) {
      // Transactional Rollback: Delete any successfully uploaded files from Google Drive
      for (const fileId of uploadedDriveFileIds) {
        try {
          await deleteFile(fileId);
        } catch (delErr) {
          console.error(`Rollback failed to delete file ${fileId} from Google Drive:`, delErr);
        }
      }
      throw uploadError;
    }

    return res.status(201).json(createdNotes);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// GET /notes/:chapterId - Accessible by all authenticated users
export const getNotesByChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;

    if (!chapterId || !mongoose.Types.ObjectId.isValid(chapterId)) {
      return res.status(400).json({
        message: "Invalid chapterId format",
      });
    }

    // Verify chapter exists (fast existence check)
    const chapterExists = await Chapter.exists({ _id: chapterId });
    if (!chapterExists) {
      return res.status(404).json({
        message: "Chapter not found",
      });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const notes = await Note.find({ chapter: chapterId })
      .select("title description fileId fileUrl downloadUrl chapter")
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json(notes);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE /notes/:id - Admin only
export const deleteNote = async (req, res) => {
  try {
    if (!checkAdmin(req, res)) return;

    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid note ID format",
      });
    }

    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    // Delete file from Google Drive
    await deleteFile(note.fileId);

    // Delete record from database
    await Note.deleteOne({ _id: id });

    return res.status(200).json({
      message: "Note deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
