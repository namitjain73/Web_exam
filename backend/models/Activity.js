import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ""
    },
    date: {
      type: Date,
      required: true
    },
    startTime: {
      type: String,
      default: ""
    },
    endTime: {
      type: String,
      default: ""
    },
    location: {
      name: String,
      address: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    order: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["suggested", "approved", "rejected"],
      default: "suggested"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Activity", activitySchema);

