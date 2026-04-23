const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

// In-memory store: { "city_London": [{sender, text, isAdmin}], ... }
const messages = {};

io.on("connection", (socket) => {
  socket.on("join_room", ({ room }) => {
    socket.join(room);
    socket.emit("room_history", messages[room] || []);
  });

  socket.on("send_message", ({ room, message }) => {
    if (!messages[room]) messages[room] = [];
    messages[room].push(message);
    io.to(room).emit("receive_message", message);
  });

  // Broadcast typing to everyone in the room except the sender
  socket.on("typing", ({ room, sender, isTyping }) => {
    socket.to(room).emit("typing", { sender, isTyping });
  });
});

server.listen(4000, () => console.log("Server running on http://localhost:4000"));
