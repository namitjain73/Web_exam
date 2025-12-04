import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: true,
      trim: true
    },

    teamImage: {
      type: String, // URL
      default: ""
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    pendingRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Team", teamSchema);
