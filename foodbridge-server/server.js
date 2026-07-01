const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

dotenv.config();

// Connect MongoDB
connectDB();

const app = express();

const server = http.createServer(app);


// ---------------- CORS ----------------

const allowedOrigins = [
  "http://localhost:5173",
  "https://foodbridge-hdgst4j8y-sourish0112-archs-projects.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);


// ---------------- Middleware ----------------

app.use(express.json());


// ---------------- Routes ----------------

app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/listings", require("./routes/listingRoutes"));

app.use("/api/impact", require("./routes/impactRoutes"));


// ---------------- Health Check ----------------

app.get("/", (req, res) => {
  res.json({
    message: "FoodBridge backend is running ✅",
  });
});


// ---------------- Socket.io ----------------

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});


io.on("connection", (socket) => {

  console.log("User connected:", socket.id);


  socket.on("join", (userId) => {

    socket.join(userId);

    console.log(`User ${userId} joined their room`);

  });


  socket.on("disconnect", () => {

    console.log("User disconnected");

  });

});


app.set("io", io);


// ---------------- Start Server ----------------

const PORT = process.env.PORT || 5000;


server.listen(PORT, () => {

  console.log(`Server running on port ${PORT}`);

});