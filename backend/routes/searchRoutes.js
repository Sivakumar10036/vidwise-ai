const express = require("express");

const {
    getSearchHistory,
    deleteSearchHistory,
    deleteAllSearchHistory,
} = require("../controllers/searchController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// GET ALL SEARCH HISTORY
// ==========================================

router.get(
    "/history",
    protect,
    getSearchHistory
);


// ==========================================
// DELETE ONE SEARCH
// ==========================================

router.delete(
    "/history/:id",
    protect,
    deleteSearchHistory
);


// ==========================================
// DELETE ALL SEARCHES
// ==========================================

router.delete(
    "/history",
    protect,
    deleteAllSearchHistory
);


module.exports = router;    