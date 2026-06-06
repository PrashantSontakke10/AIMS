import mongoose from "mongoose";
import Lecture from "./lecture.model.js";
import Chapter from "../chapters/chapter.model.js";

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

// POST /lectures
export const createLecture = async (req, res) => {
  try {
    if (!checkAdmin(req, res)) return;

    const { title, description, videoUrl, chapterId } = req.body;
    if (!title || !videoUrl || !chapterId) {
      return res.status(400).json({
        message: "title, videoUrl, and chapterId are required",
      });
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return res.status(400).json({
        message: "title cannot be empty",
      });
    }

    const trimmedVideoUrl = videoUrl.trim();
    if (!trimmedVideoUrl) {
      return res.status(400).json({
        message: "videoUrl cannot be empty",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(chapterId)) {
      return res.status(400).json({
        message: "Invalid chapterId format",
      });
    }

    // Verify chapter exists
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({
        message: "Chapter not found",
      });
    }

    const lecture = await Lecture.create({
      title: trimmedTitle,
      description: description ? description.trim() : undefined,
      videoUrl: trimmedVideoUrl,
      chapter: chapterId,
    });

    return res.status(201).json(lecture);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// GET /lectures/:chapterId
export const getLecturesByChapter = async (req, res) => {
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

    const lectures = await Lecture.find({ chapter: chapterId })
      .select("title description videoUrl chapter")
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json(lectures);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// PATCH /lectures/:id
export const updateLecture = async (req, res) => {
  try {
    if (!checkAdmin(req, res)) return;

    const { id } = req.params;
    const { title, description, videoUrl } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid lecture ID format",
      });
    }

    const lecture = await Lecture.findById(id);
    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found",
      });
    }

    if (title !== undefined) {
      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        return res.status(400).json({
          message: "title cannot be empty",
        });
      }
      lecture.title = trimmedTitle;
    }
    if (description !== undefined) {
      lecture.description = description.trim();
    }
    if (videoUrl !== undefined) {
      const trimmedVideoUrl = videoUrl.trim();
      if (!trimmedVideoUrl) {
        return res.status(400).json({
          message: "videoUrl cannot be empty",
        });
      }
      lecture.videoUrl = trimmedVideoUrl;
    }

    await lecture.save();

    return res.status(200).json(lecture);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE /lectures/:id
export const deleteLecture = async (req, res) => {
  try {
    if (!checkAdmin(req, res)) return;

    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid lecture ID format",
      });
    }

    const lecture = await Lecture.findById(id);
    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found",
      });
    }

    await Lecture.deleteOne({ _id: id });

    return res.status(200).json({
      message: "Lecture deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
