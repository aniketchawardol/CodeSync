import http from "http";
import express from "express";
import path from "path";
import {Server} from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

//Socket io
io.on('connection', (client) => {
  console.log("new user connected", client.id);
  client.on('code', (message) => {
    io.emit('code', message);
  });
});


server.listen(3000, () => {
  console.log("Server is running on port 3000");
});

const _dirname = path.resolve();

app.use(express.static(path.join(_dirname, "/frontend/dist")));

app.get('*', (_,res) => {
  res.sendFile(path.resolve(_dirname, "frontend", "dist", "index.html"));
});