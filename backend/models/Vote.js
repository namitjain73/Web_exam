import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true
    },
    question: {
      type: String,
      required: true
    },
    options: [
      {
        text: String,
        votes: [
          {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User"
            },
            votedAt: {
              type: Date,
              default: Date.now
            }
          }
        ]
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    expiresAt: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Vote", voteSchema);

