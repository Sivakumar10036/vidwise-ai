const express = require("express");

const {
    searchVideos,
} = require("../controllers/youtubeController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/search",
    protect,
    searchVideos
);

module.exports = router;