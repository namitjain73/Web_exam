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
    ,
    // optional trip fields
    destination: {
      type: String,
      default: ""
    },

    documents: [
      {
        name: String,
        url: String,
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],

    polls: [
      {
        question: String,
        options: [
          {
            text: String,
            votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
          }
        ],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now }
      }
    ],

    activityLogs: [
      {
        message: String,
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        at: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Team", teamSchema);
