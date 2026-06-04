import mongoose from "mongoose";
import User from "../auth/auth.model.js";
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

// GET /api/admin/students
export const getStudents = async (req, res) => {
  try {
    if (!checkAdmin(req, res)) return;

    const { status } = req.query;
    const query = { role: "student" };
    if (status) {
      query.status = status;
    }

    const students = await User.find(query).populate("assignedCourses");
    return res.status(200).json(students);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// PATCH /api/admin/approve
export const approveStudent = async (req, res) => {
  try {
    if (!checkAdmin(req, res)) return;

    const { userId } = req.body;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "A valid userId is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role !== "student") {
      return res.status(400).json({
        message: "Only student accounts can be approved",
      });
    }

    user.status = "active";
    await user.save();

    return res.status(200).json({
      message: "Student approved successfully",
      user: {
        id: user._id,
        mobile: user.mobile,
        role: user.role,
        status: user.status,
        assignedCourses: user.assignedCourses,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// PATCH /api/admin/block
export const blockStudent = async (req, res) => {
  try {
    if (!checkAdmin(req, res)) return;

    const { userId } = req.body;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "A valid userId is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role !== "student") {
      return res.status(400).json({
        message: "Only student accounts can be blocked",
      });
    }

    user.status = "blocked";
    user.refreshToken = null; // Invalidate current session
    await user.save();

    return res.status(200).json({
      message: "Student blocked successfully",
      user: {
        id: user._id,
        mobile: user.mobile,
        role: user.role,
        status: user.status,
        assignedCourses: user.assignedCourses,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// PATCH /api/admin/assign-course
export const assignCourse = async (req, res) => {
  try {
    if (!checkAdmin(req, res)) return;

    const { userId, courseId } = req.body;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "A valid userId is required",
      });
    }
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        message: "A valid courseId is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role !== "student") {
      return res.status(400).json({
        message: "Courses can only be assigned to students",
      });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Add course if not already assigned
    if (!user.assignedCourses.includes(courseId)) {
      user.assignedCourses.push(courseId);
    }

    // Promotes pending status to active as soon as a course is assigned
    if (user.status === "pending") {
      user.status = "active";
    }

    await user.save();

    return res.status(200).json({
      message: "Course assigned successfully",
      user: {
        id: user._id,
        mobile: user.mobile,
        role: user.role,
        status: user.status,
        assignedCourses: user.assignedCourses,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// PATCH /api/admin/remove-course
export const removeCourse = async (req, res) => {
  try {
    if (!checkAdmin(req, res)) return;

    const { userId, courseId } = req.body;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "A valid userId is required",
      });
    }
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        message: "A valid courseId is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role !== "student") {
      return res.status(400).json({
        message: "Courses can only be removed from students",
      });
    }

    user.assignedCourses = user.assignedCourses.filter(
      (id) => id.toString() !== courseId.toString()
    );

    await user.save();

    return res.status(200).json({
      message: "Course removed successfully",
      user: {
        id: user._id,
        mobile: user.mobile,
        role: user.role,
        status: user.status,
        assignedCourses: user.assignedCourses,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Keep backwards-compatibility for assignCoursesAndApprove
export const assignCoursesAndApprove = async (req, res) => {
  try {
    if (!checkAdmin(req, res)) return;

    const { userId, courseIds } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "A valid userId is required",
      });
    }

    if (!Array.isArray(courseIds)) {
      return res.status(400).json({
        message: "courseIds must be an array",
      });
    }

    for (const id of courseIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: `Invalid courseId format: ${id}`,
        });
      }
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role !== "student") {
      return res.status(400).json({
        message: "Courses can only be assigned to students",
      });
    }

    user.assignedCourses = courseIds;
    user.status = "active";

    await user.save();

    return res.status(200).json({
      message: "User approved and courses assigned successfully",
      user: {
        id: user._id,
        mobile: user.mobile,
        role: user.role,
        status: user.status,
        assignedCourses: user.assignedCourses,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
