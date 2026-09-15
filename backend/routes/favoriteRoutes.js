const express = require("express");

const {
    getFavorites,
    addFavorite,
    deleteFavorite,
    deleteAllFavorites,
} = require("../controllers/favoriteController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getFavorites);
router.post("/", protect, addFavorite);
router.delete("/:videoId", protect, deleteFavorite);
router.delete("/", protect, deleteAllFavorites);

module.exports = router;
