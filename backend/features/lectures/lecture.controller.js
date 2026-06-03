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

    // Verify chapter exists
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({
        message: "Chapter not found",
      });
    }

    const lecture = await Lecture.create({
      title,
      description,
      videoUrl,
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

    // Verify chapter exists
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({
        message: "Chapter not found",
      });
    }

    const lectures = await Lecture.find({ chapter: chapterId });
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

    const lecture = await Lecture.findById(id);
    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found",
      });
    }

    if (title !== undefined) lecture.title = title;
    if (description !== undefined) lecture.description = description;
    if (videoUrl !== undefined) lecture.videoUrl = videoUrl;

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
