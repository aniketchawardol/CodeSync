import http from "http";
import express from "express";
import path from "path";
import cors from "cors";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { User, Room } from "./database.js";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";

const app = express();
app.use(express.json());
const server = http.createServer(app);

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);

// ✅ CREATE ROOM (POST: /api/room)
app.post("/api/room", async (req, res) => {
  try {
    const { roomId, createdBy, folder } = req.body;
    if (!createdBy)
      return res.status(400).json({ error: "CreatedBy is required" });

    const newRoom = new Room({ roomId, createdBy, folder });
    await newRoom.save();

    res.status(201).json({ message: "Room created successfully", roomId });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ JOIN ROOM (GET: /api/room/:roomId)
app.get("/api/room/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ roomId });

    if (!room) return res.status(404).json({ error: "Room not found" });

    res.json(room);
  } catch (error) {
    console.error("Error finding room:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ CREATE OR UPDATE USER (POST: /api/user)
app.post("/api/user", async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findOneAndUpdate(
      { email },
      { name },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: "User found or created", user });
  } catch (error) {
    console.error("Error handling user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ GET USER DATA (GET: /api/user/:email)
app.get("/api/user/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select(
      "+folder"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ SOCKET.IO CONFIGURATION
const io = new Server(server, { 
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// Store room data
// const roomData = new Map();
// const activeRooms = {}; // Store folder structures per room

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  // Join room and sync folder
  socket.on("join-room", async (roomId) => {
    try {
      // Find the room in the database
      const room = await Room.findOne({ roomId });
      
      if (room && room.folder) {
        // Store the current folder state in memory
        // activeRooms[roomId] = room.folder;
        
        // Join the socket room
        socket.join(roomId);
        
        // Send the current folder structure to the joining user
        socket.emit("initialize-folder", room.folder);
      }
    } catch (error) {
      console.error("Error joining room:", error);
    }
  });

  // Handle folder updates
  socket.on("update-folder", async ({ roomId, updatedFolder }) => {
    try {
      // Update the in-memory folder state
      // activeRooms[roomId] = updatedFolder;

      // Update the database
      await Room.findOneAndUpdate(
        { roomId },
        { folder: updatedFolder },
        { new: true }
      );

      // Broadcast the update to all other users in the room
      socket.broadcast.to(roomId).emit("folder-updated", updatedFolder);
    } catch (error) {
      console.error("Folder update error:", error);
    }
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

mongoose
  .connect(
    "mongodb+srv://dbUser:codesync@codesync.tjq43.mongodb.net/codesync?retryWrites=true&w=majority&appName=codesync"
  )
  .then((result) => {
    server.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.log(err);
  });

const _dirname = path.resolve();

app.use(express.static(path.join(_dirname, "/frontend/dist")));

app.get("*", (_, res) => {
  res.sendFile(path.resolve(_dirname, "frontend", "dist", "index.html"));
});
