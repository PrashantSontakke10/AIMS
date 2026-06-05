import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "./auth.model.js";

import { generateAccessToken, generateRefreshToken} from "../../utils/generateTokens.js";

// Helper function to validate mobile format (exactly 10 digits)
const validateMobile = (mobile) => {
  const cleaned = mobile.replace(/\D/g, "");
  return cleaned.length === 10;
};

export const login = async (req, res) => {
  try {
    const { mobile, password, firstName, lastName, address, role } = req.body;

    if (!mobile) {
      return res.status(400).json({
        message: "Mobile number is required",
      });
    }

    const cleanedMobile = mobile.replace(/\D/g, "").slice(-10);
    if (cleanedMobile.length !== 10) {
      return res.status(400).json({
        message: "Invalid mobile number format. Must be exactly 10 digits.",
      });
    }

    const adminMobiles = process.env.ADMIN_MOBILES ? process.env.ADMIN_MOBILES.split(",").map(m => m.replace(/\D/g, "").slice(-10)) : [];
    const isAdminMobile = adminMobiles.includes(cleanedMobile);

    // If user wants to log in as admin, or is an admin mobile logging in
    if (role === "admin" || isAdminMobile) {
      if (!isAdminMobile) {
        return res.status(403).json({
          message: "Access denied. This mobile number is not registered as admin.",
        });
      }
      if (!password || password !== process.env.ADMIN_PASS) {
        return res.status(401).json({
          message: "Invalid admin password.",
        });
      }
    }

    // Check if the user already exists
    let user = await User.findOne({ mobile: cleanedMobile });

    if (!user) {
      // Create new user if not found (Signup)
      if (role === "admin" || isAdminMobile) {
        user = await User.create({
          mobile: cleanedMobile,
          role: "admin",
          status: "active",
        });
      } else {
        // Student signup - require registration fields
        if (!firstName || !lastName || !address) {
          return res.status(200).json({
            requiresRegistration: true,
            message: "Please complete registration to continue.",
          });
        }
        user = await User.create({
          mobile: cleanedMobile,
          firstName,
          lastName,
          address,
          name: `${firstName} ${lastName}`.trim(),
          role: "student",
          status: "active", // Direct access after details input
        });
      }
    } else {
      // Check if user is blocked
      if (user.status === "blocked") {
        return res.status(403).json({
          message: "Access denied. Your account is blocked. Please contact the administrator.",
        });
      }

      if ((role === "admin" || isAdminMobile) && user.role !== "admin") {
        // Automatically promote to admin if mobile is added to .env
        user.role = "admin";
        user.status = "active";
        await user.save();
      }
    }

    // Generate fresh tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: "Authentication successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        mobile: user.mobile,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        address: user.address,
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

export const updateProfile = async (req, res) => {
  try {
    const { userId, firstName, lastName, address, email } = req.body;
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

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (address !== undefined) user.address = address;
    if (email !== undefined) user.email = email;
    if (firstName !== undefined || lastName !== undefined) {
      user.name = `${firstName || ""} ${lastName || ""}`.trim() || user.name;
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        address: user.address,
        email: user.email,
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