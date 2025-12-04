import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
        
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6
    },

    dob: {
      type: Date,
      required: false
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: false
    }
  },
  { timestamps: true }
);

// Password hash before save


export default mongoose.model("User", userSchema);
