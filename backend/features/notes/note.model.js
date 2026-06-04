import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    fileId: {
      type: String, // Google Drive File ID
      required: true,
    },
    fileUrl: {
      type: String, // Google Drive Web View Link
      required: true,
    },
    downloadUrl: {
      type: String, // Google Drive Direct Download Link
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Note", noteSchema);
