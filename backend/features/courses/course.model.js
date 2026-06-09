import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    code: {
      type: String,
      unique: true,
      sparse: true,
    },
    grade: {
      type: String,
      enum: ["5th", "6th", "7th", "8th", "9th", "10th", "free", "all"],
      required: true,
      default: "all",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Course", courseSchema);