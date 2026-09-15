const { searchYouTube } = require("../services/youtubeService");
const { recommendVideos } = require("../services/geminiService");
const Search = require("../models/Search");

const searchVideos = async (req, res) => {
    try {
        const { query } = req.query;

        // --------------------------------------------------
        // 1. Validate search query
        // --------------------------------------------------

        if (!query || query.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Search query is required",
            });
        }

        const cleanQuery = query.trim();

        // --------------------------------------------------
        // 2. Fetch videos from YouTube
        // --------------------------------------------------

        console.log(
            `🔎 Searching YouTube for: ${cleanQuery}`
        );

        const videos = await searchYouTube(cleanQuery);

        if (!videos || videos.length === 0) {
            return res.status(200).json({
                success: true,
                query: cleanQuery,
                count: 0,
                searchId: null,
                aiRecommended: false,
                videos: [],
            });
        }

        console.log(
            `📺 YouTube returned ${videos.length} videos`
        );

        // --------------------------------------------------
        // 3. Gemini analyzes learning intent
        // --------------------------------------------------

        console.log(
            "🤖 Analyzing learning intent with Gemini..."
        );

        const aiVideos = await recommendVideos(
            cleanQuery,
            videos
        );

        // --------------------------------------------------
        // 4. Use Gemini information when available
        // --------------------------------------------------

        let finalVideos;

        if (aiVideos && aiVideos.length > 0) {
            finalVideos = aiVideos;

            console.log(
                `🧠 Gemini analyzed ${aiVideos.length} videos`
            );
        } else {
            finalVideos = videos.map((video) => ({
                ...video,

                aiScore: 0,

                intentMatch: false,

                aiReason:
                    "AI analysis was unavailable for this search.",

                learningLevel: "intermediate",

                contentType: "other",
            }));

            console.log(
                "⚠️ Gemini unavailable. Using YouTube results."
            );
        }

        // --------------------------------------------------
        // 5. FINAL VIDWISE RANKING
        //
        // Priority:
        //
        // 1. Direct learning intent
        // 2. Views
        // 3. Likes
        // 4. Comments
        // 5. AI relevance
        // 6. Recency
        // --------------------------------------------------

        finalVideos.sort((a, b) => {

            // ----------------------------------------------
            // 1. DIRECT LEARNING INTENT
            // ----------------------------------------------

            const intentA =
                a.intentMatch === true ? 1 : 0;

            const intentB =
                b.intentMatch === true ? 1 : 0;

            if (intentB !== intentA) {
                return intentB - intentA;
            }

            // ----------------------------------------------
            // 2. VIEWS
            // ----------------------------------------------

            const viewsA =
                Number(a.views || 0);

            const viewsB =
                Number(b.views || 0);

            if (viewsB !== viewsA) {
                return viewsB - viewsA;
            }

            // ----------------------------------------------
            // 3. LIKES
            // ----------------------------------------------

            const likesA =
                Number(a.likes || 0);

            const likesB =
                Number(b.likes || 0);

            if (likesB !== likesA) {
                return likesB - likesA;
            }

            // ----------------------------------------------
            // 4. COMMENTS
            // ----------------------------------------------

            const commentsA =
                Number(a.comments || 0);

            const commentsB =
                Number(b.comments || 0);

            if (commentsB !== commentsA) {
                return commentsB - commentsA;
            }

            // ----------------------------------------------
            // 5. AI RELEVANCE
            // ----------------------------------------------

            const aiScoreA =
                Number(a.aiScore || 0);

            const aiScoreB =
                Number(b.aiScore || 0);

            if (aiScoreB !== aiScoreA) {
                return aiScoreB - aiScoreA;
            }

            // ----------------------------------------------
            // 6. RECENCY
            // ----------------------------------------------

            return (
                new Date(b.publishedAt || 0) -
                new Date(a.publishedAt || 0)
            );
        });

        // --------------------------------------------------
        // 6. Add dynamic ranking number
        // --------------------------------------------------

        finalVideos = finalVideos.map(
            (video, index) => ({
                ...video,
                rank: index + 1,
            })
        );

        // --------------------------------------------------
        // 7. Save search history
        // --------------------------------------------------

        const savedSearch = await Search.create({
            userId: req.userId,
            query: cleanQuery,
            resultCount: finalVideos.length,
            videos: finalVideos,
        });

        // --------------------------------------------------
        // 8. Send response
        // --------------------------------------------------

        res.status(200).json({
            success: true,

            query: cleanQuery,

            count: finalVideos.length,

            searchId: savedSearch._id,

            aiRecommended:
                aiVideos &&
                aiVideos.length > 0,

            rankingOrder: [
                "directLearningIntent",
                "views",
                "likes",
                "comments",
                "aiRelevance",
                "recency",
            ],

            videos: finalVideos,
        });

    } catch (error) {
        console.error(
            "YouTube Controller Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to search YouTube videos",
        });
    }
};

module.exports = {
    searchVideos,
};