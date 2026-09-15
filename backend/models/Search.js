const mongoose = require("mongoose");


// ======================================================
// VIDEO SCHEMA
// ======================================================

const videoSchema = new mongoose.Schema(
    {
        videoId: {
            type: String,
            required: true,
            trim: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
        },

        channelId: {
            type: String,
            default: "",
        },

        channelTitle: {
            type: String,
            default: "",
        },

        publishedAt: {
            type: Date,
            default: null,
        },

        thumbnail: {
            type: String,
            default: "",
        },

        views: {
            type: Number,
            default: 0,
        },

        likes: {
            type: Number,
            default: 0,
        },

        comments: {
            type: Number,
            default: 0,
        },

        duration: {
            type: String,
            default: null,
        },

        youtubeUrl: {
            type: String,
            default: "",
        },

        embedUrl: {
            type: String,
            default: "",
        },
    },

    {
        _id: false,
    }
);


// ======================================================
// SEARCH SCHEMA
// ======================================================

const searchSchema = new mongoose.Schema(
    {
        // ----------------------------------------------
        // USER WHO PERFORMED THE SEARCH
        // ----------------------------------------------

        userId: {
            type: mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true,

            index: true,
        },


        // ----------------------------------------------
        // SEARCH QUERY
        // ----------------------------------------------

        query: {
            type: String,

            required: true,

            trim: true,

            minlength: 1,
        },


        // ----------------------------------------------
        // NUMBER OF RESULTS
        // ----------------------------------------------

        resultCount: {
            type: Number,

            default: 0,

            min: 0,
        },


        // ----------------------------------------------
        // YOUTUBE VIDEOS
        // ----------------------------------------------

        videos: {
            type: [videoSchema],

            default: [],
        },
    },


    // ----------------------------------------------
    // AUTOMATIC CREATED / UPDATED DATES
    // ----------------------------------------------

    {
        timestamps: true,
    }
);


// ======================================================
// INDEXES
// ======================================================

// Quickly fetch a user's latest searches
searchSchema.index({
    userId: 1,
    createdAt: -1,
});


// ======================================================
// EXPORT MODEL
// ======================================================

module.exports = mongoose.model(
    "Search",
    searchSchema
);