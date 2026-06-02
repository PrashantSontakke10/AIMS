import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },

    email: {
      type: String,
      required: false,
      sparse: true,
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: false,
    },

    role: {
      type: String,
      enum: ["admin", "student"],
      default: "student",
    },

    status: {
      type: String,
      enum: ["pending", "active", "blocked"],
      default: "pending",
    },

    assignedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    refreshToken: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);