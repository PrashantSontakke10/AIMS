import jwt from "jsonwebtoken";
import User from "./auth.model.js";

import { generateAccessToken, generateRefreshToken} from "../../utils/generateTokens.js";

export const login = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({
        message: "Mobile number is required",
      });
    }

    // Check if the user already exists
    let user = await User.findOne({ mobile });

    const adminMobiles = process.env.ADMIN_MOBILES ? process.env.ADMIN_MOBILES.split(",") : [];
    const isAdminMobile = adminMobiles.includes(mobile);

    if (!user) {
      // Create new user if not found (Signup)
      user = await User.create({
        mobile,
        role: isAdminMobile ? "admin" : "student",
        status: isAdminMobile ? "active" : "pending",
      });
    } else if (isAdminMobile && user.role !== "admin") {
      // Automatically promote to admin if mobile is added to .env
      user.role = "admin";
      user.status = "active";
      await user.save();
    }

    // Generate fresh tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Overwriting the refresh token in the database implements the single-device restriction:
    // If they sign in on another device, this gets overwritten, invalidating the previous session.
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: "Authentication successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        mobile: user.mobile,
        role: user.role,
        status: user.status,
        assignedCourses: user.assignedCourses,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const refreshAccessToken = async (
  req,
  res
) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token missing",
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(
      decoded.id
    );

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    if (
      user.refreshToken !== refreshToken
    ) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    const accessToken =
      generateAccessToken(user);

    return res.json({
      accessToken,
    });
  } catch (error) {
    return res.status(401).json({
      message: "Invalid refresh token",
    });
  }
};


export const logout = async (req, res) => {
    
  const { userId } = req.body;

  await User.findByIdAndUpdate(userId, {
    refreshToken: null,
  });

  res.json({
    message: "Logged out",
  });
};