import mongoose from "mongoose";
import Chapter from "./chapter.model.js";
import Course from "../courses/course.model.js";

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

// POST /chapters
export const createChapter = async (req, res) => {
  try {
    if (!checkAdmin(req, res)) return;

    const { title, description, courseId } = req.body;
    if (!title || !courseId) {
      return res.status(400).json({
        message: "title and courseId are required",
      });
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return res.status(400).json({
        message: "title cannot be empty",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        message: "Invalid courseId format",
      });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    const chapter = await Chapter.create({
      title: trimmedTitle,
      description: description ? description.trim() : undefined,
      course: courseId,
    });

    return res.status(201).json(chapter);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// GET /chapters/:courseId
export const getChaptersByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        message: "Invalid courseId format",
      });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    const chapters = await Chapter.find({ course: courseId });
    return res.status(200).json(chapters);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// PATCH /chapters/:id
export const updateChapter = async (req, res) => {
  try {
    if (!checkAdmin(req, res)) return;

    const { id } = req.params;
    const { title, description } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid chapter ID format",
      });
    }

    const chapter = await Chapter.findById(id);
    if (!chapter) {
      return res.status(404).json({
        message: "Chapter not found",
      });
    }

    if (title !== undefined) {
      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        return res.status(400).json({
          message: "title cannot be empty",
        });
      }
      chapter.title = trimmedTitle;
    }
    if (description !== undefined) {
      chapter.description = description.trim();
    }

    await chapter.save();

    return res.status(200).json(chapter);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE /chapters/:id
export const deleteChapter = async (req, res) => {
  try {
    if (!checkAdmin(req, res)) return;

    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid chapter ID format",
      });
    }

    const chapter = await Chapter.findById(id);
    if (!chapter) {
      return res.status(404).json({
        message: "Chapter not found",
      });
    }

    await Chapter.deleteOne({ _id: id });

    return res.status(200).json({
      message: "Chapter deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
