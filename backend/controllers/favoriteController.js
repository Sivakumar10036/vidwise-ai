const Favorite = require("../models/Favorite");

const getFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.find({
            userId: req.userId,
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: favorites.length,
            favorites,
        });
    } catch (error) {
        console.error("Get Favorites Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch favorites",
        });
    }
};

const addFavorite = async (req, res) => {
    try {
        const { video } = req.body;

        if (!video?.videoId || !video?.title) {
            return res.status(400).json({
                success: false,
                message: "Valid video data is required",
            });
        }

        const existing = await Favorite.findOne({
            userId: req.userId,
            "video.videoId": video.videoId,
        });

        if (existing) {
            return res.status(200).json({
                success: true,
                message: "Video is already in favorites",
                favorite: existing,
                alreadyExists: true,
            });
        }

        const favorite = await Favorite.create({
            userId: req.userId,
            video: {
                videoId: video.videoId,
                title: video.title,
                description: video.description || "",
                channelId: video.channelId || "",
                channelTitle: video.channelTitle || "",
                publishedAt: video.publishedAt || null,
                thumbnail: video.thumbnail || "",
                views: Number(video.views || 0),
                likes: Number(video.likes || 0),
                comments: Number(video.comments || 0),
                duration: video.duration || null,
                youtubeUrl: video.youtubeUrl || "",
                embedUrl: video.embedUrl || "",
                rank: video.rank != null ? Number(video.rank) : null,
                aiScore: video.aiScore != null ? Number(video.aiScore) : null,
                intentMatch: video.intentMatch === true,
                aiReason: video.aiReason || "",
                learningLevel: video.learningLevel || "",
                contentType: video.contentType || "",
            },
        });

        res.status(201).json({
            success: true,
            message: "Video added to favorites",
            favorite,
        });
    } catch (error) {
        console.error("Add Favorite Error:", error.message);

        if (error.code === 11000) {
            return res.status(200).json({
                success: true,
                message: "Video is already in favorites",
                alreadyExists: true,
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to add favorite",
        });
    }
};

const deleteFavorite = async (req, res) => {
    try {
        const { videoId } = req.params;

        const favorite = await Favorite.findOneAndDelete({
            userId: req.userId,
            "video.videoId": videoId,
        });

        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: "Favorite not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Video removed from favorites",
        });
    } catch (error) {
        console.error("Delete Favorite Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to remove favorite",
        });
    }
};

const deleteAllFavorites = async (req, res) => {
    try {
        await Favorite.deleteMany({
            userId: req.userId,
        });

        res.status(200).json({
            success: true,
            message: "All favorites deleted successfully",
        });
    } catch (error) {
        console.error("Delete All Favorites Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to delete all favorites",
        });
    }
};

module.exports = {
    getFavorites,
    addFavorite,
    deleteFavorite,
    deleteAllFavorites,
};
