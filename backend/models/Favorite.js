const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
    {
        videoId: { type: String, required: true, trim: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, default: "" },
        channelId: { type: String, default: "" },
        channelTitle: { type: String, default: "" },
        publishedAt: { type: Date, default: null },
        thumbnail: { type: String, default: "" },
        views: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        comments: { type: Number, default: 0 },
        duration: { type: String, default: null },
        youtubeUrl: { type: String, default: "" },
        embedUrl: { type: String, default: "" },
        rank: { type: Number, default: null },
        aiScore: { type: Number, default: null },
        intentMatch: { type: Boolean, default: false },
        aiReason: { type: String, default: "" },
        learningLevel: { type: String, default: "" },
        contentType: { type: String, default: "" },
    },
    { _id: false }
);

const favoriteSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        video: {
            type: videoSchema,
            required: true,
        },
    },
    { timestamps: true }
);

favoriteSchema.index(
    { userId: 1, "video.videoId": 1 },
    { unique: true }
);

favoriteSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Favorite", favoriteSchema);
