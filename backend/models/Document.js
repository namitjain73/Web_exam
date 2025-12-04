import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true
    },
    activity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity",
      default: null
    },
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ["ticket", "voucher", "id", "receipt", "other"],
      default: "other"
    },
    fileUrl: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      default: "application/pdf"
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model("Document", documentSchema);

