import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const roomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    folder: {
      type: Object,
      default: {
        src: {
          type: "folder",
          children: {
            "index.js": {
              type: "file",
              content: "// Welcome to CodeSathi",
              language: "javascript",
              status: "unchanged",
            },
          },
        },
      },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const Room = mongoose.model("Room", roomSchema);

export {User,Room};