import http from "http";
import express from "express";
import path from "path";
import cors from "cors";
import { Server } from "socket.io";
import mongoose from "mongoose";
import User from "./database.js";
import 'dotenv/config'; 

const app = express();
app.use(express.json());
const server = http.createServer(app);

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));

app.post("/api/user", async (req, res) => {
  const { name, email } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("User already exists:", existingUser);
      return res.status(200).json({ message: "User already exists", user: existingUser });
    } else {
      // Create a new user if not found
      const newUser = new User({ name, email });
      await newUser.save();
      console.log("New user created:", newUser);
      return res.status(201).json({ message: "New user created", user: newUser });
    }
  } catch (error) {
    console.error("Error handling user login/signup:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on("code-update", ({ roomId, code }) => {
    socket.to(roomId).emit("receive-code", code);
  });

  socket.on("cursor-update", ({ roomId, userName, cursorPosition }) => {
    socket.to(roomId).emit("cursor-update", { userName, cursorPosition });
  });

  socket.on("chat-send", ({ roomId, userName, text }) => {
    socket.to(roomId).emit("receive-chat", { userName, text });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const dbURI = process.env.MONGO_URI;

mongoose.connect(dbURI)
  .then((result)=>{server.listen(3000, () => {
    console.log("Server is running on port 3000");
  })})
  .catch((err)=>{console.log(err)});

const _dirname = path.resolve();

app.use(express.static(path.join(_dirname, "/frontend/dist")));

app.get('*', (_, res) => {
  res.sendFile(path.resolve(_dirname, "frontend", "dist", "index.html"));
});
