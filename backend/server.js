const express = require("express");
const cors = require("cors");

require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const youtubeRoutes = require("./routes/youtubeRoutes");
const searchRoutes = require("./routes/searchRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");

const app = express();

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) {
                return callback(null, true);
            }

            if (
                origin === "http://localhost:5173" ||
                origin === "https://vidwise-ai.vercel.app" ||
                origin.endsWith(".vercel.app")
            ) {
                return callback(null, true);
            }

            return callback(
                new Error("Not allowed by CORS")
            );
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ],
        credentials: true
    })
);

app.options("*", cors());

app.use(express.json());

connectDB();

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to VidWise AI 🚀"
    });
});

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "VidWise AI backend is running"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/youtube", youtubeRoutes);
app.use("/api/searches", searchRoutes);
app.use("/api/favorites", favoriteRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `VidWise AI server running on port ${PORT}`
    );
});