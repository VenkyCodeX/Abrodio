require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

const allowedOrigins = [
  "http://localhost:3000",
  "https://abrodio.vercel.app",
  "https://abrodio-production.up.railway.app",
  /\.vercel\.app$/,
];

const app = express();
app.use(cors({ origin: allowedOrigins, methods: ["GET", "POST"] }));
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/location", require("./routes/location"));
app.use("/api/messages", require("./routes/messages"));

// Socket.IO
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

require("./socket/handler")(io);

// MongoDB + Start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    server.listen(process.env.PORT || 4000, () =>
      console.log(`Server running on port ${process.env.PORT || 4000}`)
    );
  })
  .catch((e) => { console.error("MongoDB error:", e.message); process.exit(1); });
