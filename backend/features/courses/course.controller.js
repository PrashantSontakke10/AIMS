import Course from "./course.model.js";
import User from "../auth/auth.model.js";

// POST /api/courses
export const createCourse = async (req, res) => {
  try {
    // Restrict access to administrators only
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admins only.",
      });
    }

    const { title, description, code, grade } = req.body;
    
    const trimmedTitle = title ? title.trim() : "";
    if (!trimmedTitle) {
      return res.status(400).json({
        message: "Course title is required and cannot be empty",
      });
    }

    if (grade && !["5th", "6th", "7th", "8th", "9th", "10th", "free", "all"].includes(grade.trim())) {
      return res.status(400).json({
        message: "Invalid grade selection",
      });
    }

    const trimmedCode = code ? code.trim() : undefined;
    if (trimmedCode) {
      const existingCourse = await Course.findOne({ code: trimmedCode });
      if (existingCourse) {
        return res.status(400).json({
          message: `Course with code '${trimmedCode}' already exists`,
        });
      }
    }

    const course = await Course.create({ 
      title: trimmedTitle, 
      description: description ? description.trim() : undefined, 
      code: trimmedCode,
      grade: grade ? grade.trim() : undefined
    });
    return res.status(201).json(course);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// GET /api/courses
export const getCourses = async (req, res) => {
  try {
    const isFreeTrial = process.env.FREE_TRIAL_MODE !== "false"; // Default to true for free trial

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    let query = {};
    if (req.user && req.user.role === "student" && !isFreeTrial) {
      const student = await User.findById(req.user.id).select("assignedCourses").lean();
      if (!student) {
        return res.status(404).json({
          message: "Student user not found",
        });
      }

      // Filter courses to only show assigned ones
      query = { _id: { $in: student.assignedCourses || [] } };
    }

    // Return paginated courses, selecting only mandatory fields (lean for maximum speed)
    const courses = await Course.find(query)
      .select("title description code grade")
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json(courses);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE /api/courses/:id
export const deleteCourse = async (req, res) => {
  try {
    // Restrict access to administrators only
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admins only.",
      });
    }

    const { id } = req.params;

    if (!id || id.length !== 24) {
      return res.status(400).json({
        message: "Invalid course ID format",
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    await Course.deleteOne({ _id: id });

    return res.status(200).json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};