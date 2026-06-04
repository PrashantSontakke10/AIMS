import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "./auth.model.js";

import { generateAccessToken, generateRefreshToken} from "../../utils/generateTokens.js";

// Helper function to validate mobile format (10-15 digits, optional leading +)
const validateMobile = (mobile) => {
  const mobileRegex = /^\+?[0-9]{10,15}$/;
  return mobileRegex.test(mobile);
};

export const login = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({
        message: "Mobile number is required",
      });
    }

    const cleanedMobile = mobile.trim();
    if (!validateMobile(cleanedMobile)) {
      return res.status(400).json({
        message: "Invalid mobile number format. Must be 10-15 digits, optionally starting with '+'",
      });
    }

    // Check if the user already exists
    let user = await User.findOne({ mobile: cleanedMobile });

    const adminMobiles = process.env.ADMIN_MOBILES ? process.env.ADMIN_MOBILES.split(",") : [];
    const isAdminMobile = adminMobiles.includes(cleanedMobile);

    if (!user) {
      // Create new user if not found (Signup)
      user = await User.create({
        mobile: cleanedMobile,
        role: isAdminMobile ? "admin" : "student",
        status: isAdminMobile ? "active" : "pending",
      });
    } else {
      // Check if user is blocked
      if (user.status === "blocked") {
        return res.status(403).json({
          message: "Access denied. Your account is blocked. Please contact the administrator.",
        });
      }

      if (isAdminMobile && user.role !== "admin") {
        // Automatically promote to admin if mobile is added to .env
        user.role = "admin";
        user.status = "active";
        await user.save();
      }
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

    // Check if user is blocked
    if (user.status === "blocked") {
      return res.status(403).json({
        message: "Access denied. Your account is blocked.",
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
  try {
    const { userId } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "A valid userId is required",
      });
    }

    await User.findByIdAndUpdate(userId, {
      refreshToken: null,
    });

    res.json({
      message: "Logged out",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};