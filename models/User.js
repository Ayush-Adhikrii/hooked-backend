import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: false,
      unique: true
    },
    phoneNumber: {
      type: String,
      required: false,
      unique: true
    },
    userName: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: false
    },
    birthDate: {
      type: String,
      required: false
    },
    starSign: {
      type: String,
      required: false
    },
    bio: {
      type: String,
      maxlength: 100,
      required: false
    },
    profilePhoto: {
      type: String,
      required: false
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    matches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);


const User = mongoose.model("User", userSchema);

export default User;
