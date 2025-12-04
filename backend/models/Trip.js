import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    destination: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    coverImage: {
      type: String,
      default: ""
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        role: {
          type: String,
          enum: ["admin", "editor", "viewer"],
          default: "viewer"
        },
        joinedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    joinCode: {
      type: String,
      unique: true,
      required: true
    },
    joinLink: {
      type: String,
      unique: true
    },
    isFinalized: {
      type: Boolean,
      default: false
    },
    currency: {
      type: String,
      default: "USD"
    }
  },
  { timestamps: true }
);

// Generate join code before save
tripSchema.pre("save", async function (next) {
  if (!this.joinCode) {
    this.joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  if (!this.joinLink) {
    this.joinLink = `trip-${this._id}`;
  }
  next();
});

export default mongoose.model("Trip", tripSchema);

