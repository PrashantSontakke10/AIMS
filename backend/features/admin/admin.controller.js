import User from "../auth/auth.model.js";

export const assignCoursesAndApprove = async (req, res) => {
  try {
    // Restrict access to administrators only
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admins only.",
      });
    }

    const { userId, courseIds } = req.body;

    if (!userId || !Array.isArray(courseIds)) {
      return res.status(400).json({
        message: "userId and courseIds (array) are required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Assign the courses and approve the user
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
