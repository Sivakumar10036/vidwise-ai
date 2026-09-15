const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const MODEL_NAME = "gemini-3.5-flash-lite";

const recommendVideos = async (query, videos) => {
    try {
        if (!query || !videos || videos.length === 0) {
            return [];
        }

        // --------------------------------------------------
        // Prepare YouTube data for Gemini
        // --------------------------------------------------

        const videoData = videos.map((video, index) => ({
            index: index + 1,
            videoId: video.videoId,
            title: video.title,
            description: video.description
                ? video.description.substring(0, 700)
                : "",
            channelTitle: video.channelTitle,
        }));

        // --------------------------------------------------
        // Gemini Prompt
        // --------------------------------------------------

        const prompt = `
You are VidWise AI, an intelligent learning-focused
YouTube recommendation system.

USER SEARCH:
"${query}"

Your task is to understand what the user wants to learn
from the search query and evaluate every provided video.

IMPORTANT:

The user is searching because they want to learn or
understand the requested topic unless the query clearly
asks for something else.

You must distinguish between:

1. A video that DIRECTLY teaches the requested topic.
2. A video that explains an important concept related
   to the requested topic.
3. A video that USES the requested topic to solve another
   problem.
4. A video that only mentions the requested topic.
5. An unrelated video.

A video should NOT receive a high relevance score merely
because the search keyword appears in its title or
description.

The main question is:

"Would this video help the user learn the thing they
actually searched for?"

For example, if a user searches for a general programming
topic, a tutorial explaining that topic should be preferred
over a problem-solving video that merely uses that topic.

However, do NOT assume any particular topic. Analyze the
actual user query dynamically.

--------------------------------------------------
INTENT MATCH
--------------------------------------------------

Set intentMatch to TRUE only when the video directly
teaches, explains, or substantially covers what the user
is asking for.

Set intentMatch to FALSE when the video mainly:

- applies the topic to another problem
- solves coding problems using the topic
- contains interview questions about the topic
- mentions the topic without teaching it
- discusses a related but different topic
- is otherwise not suitable for the user's learning intent

Do not use views, likes, comments, or popularity to
determine intentMatch.

--------------------------------------------------
RELEVANCE SCORE
--------------------------------------------------

Give a relevanceScore from 0 to 100.

90-100:
Excellent direct match for the user's learning goal.

75-89:
Strong match and useful for learning the requested topic.

50-74:
Related and potentially useful, but not a direct
learning resource.

25-49:
Weakly related.

0-24:
Mostly unrelated.

--------------------------------------------------
CONTENT TYPE
--------------------------------------------------

Classify each video as one of:

"topic_tutorial"
"topic_explanation"
"topic_course"
"topic_advanced"
"application"
"problem_solving"
"interview"
"other"

--------------------------------------------------
LEARNING LEVEL
--------------------------------------------------

Classify each video as:

"beginner"
"intermediate"
"advanced"

--------------------------------------------------
REASON
--------------------------------------------------

Give a short, natural explanation for why the video is
or is not useful for the user's search.

The reason must be based only on the information provided
about the video.

Do not invent facts about the video's content.

--------------------------------------------------
IMPORTANT OUTPUT RULES
--------------------------------------------------

- Return every provided video.
- Do not invent video IDs.
- Every videoId must exactly match one of the provided IDs.
- Do not sort the results.
- Do not use views to determine the relevanceScore.
- Do not use likes to determine the relevanceScore.
- Do not use comments to determine the relevanceScore.
- VidWise will perform the final numerical ranking itself.

VIDEOS:

${JSON.stringify(videoData, null, 2)}
        `;

        // --------------------------------------------------
        // Gemini request
        // --------------------------------------------------

        const response = await ai.models.generateContent({
            model: MODEL_NAME,

            contents: prompt,

            config: {
                temperature: 0.1,

                maxOutputTokens: 4000,

                responseMimeType: "application/json",

                responseSchema: {
                    type: "object",

                    properties: {
                        recommendations: {
                            type: "array",

                            items: {
                                type: "object",

                                properties: {
                                    videoId: {
                                        type: "string",
                                    },

                                    relevanceScore: {
                                        type: "number",
                                    },

                                    intentMatch: {
                                        type: "boolean",
                                    },

                                    reason: {
                                        type: "string",
                                    },

                                    level: {
                                        type: "string",

                                        enum: [
                                            "beginner",
                                            "intermediate",
                                            "advanced",
                                        ],
                                    },

                                    contentType: {
                                        type: "string",

                                        enum: [
                                            "topic_tutorial",
                                            "topic_explanation",
                                            "topic_course",
                                            "topic_advanced",
                                            "application",
                                            "problem_solving",
                                            "interview",
                                            "other",
                                        ],
                                    },
                                },

                                required: [
                                    "videoId",
                                    "relevanceScore",
                                    "intentMatch",
                                    "reason",
                                    "level",
                                    "contentType",
                                ],
                            },
                        },
                    },

                    required: [
                        "recommendations",
                    ],
                },
            },
        });

        const text = response.text;

        if (!text) {
            console.log(
                "Gemini returned an empty response."
            );

            return [];
        }

        // --------------------------------------------------
        // Parse Gemini response
        // --------------------------------------------------

        let result;

        try {
            result = JSON.parse(text);
        } catch (parseError) {
            console.error(
                "Gemini JSON Parse Error:",
                parseError.message
            );

            console.error(
                "Gemini Response:",
                text
            );

            return [];
        }

        if (
            !result ||
            !Array.isArray(result.recommendations)
        ) {
            return [];
        }

        // --------------------------------------------------
        // Map original YouTube videos
        // --------------------------------------------------

        const videoMap = new Map(
            videos.map((video) => [
                video.videoId,
                video,
            ])
        );

        // --------------------------------------------------
        // Merge Gemini information with YouTube data
        // --------------------------------------------------

        const recommendedVideos =
            result.recommendations
                .filter((recommendation) =>
                    videoMap.has(
                        recommendation.videoId
                    )
                )
                .map((recommendation) => {
                    const originalVideo =
                        videoMap.get(
                            recommendation.videoId
                        );

                    return {
                        ...originalVideo,

                        aiScore: Math.max(
                            0,
                            Math.min(
                                100,
                                Number(
                                    recommendation.relevanceScore
                                ) || 0
                            )
                        ),

                        intentMatch:
                            recommendation.intentMatch === true,

                        aiReason:
                            recommendation.reason ||
                            "This video is related to your search.",

                        learningLevel:
                            recommendation.level ||
                            "intermediate",

                        contentType:
                            recommendation.contentType ||
                            "other",
                    };
                });

        return recommendedVideos;

    } catch (error) {
        console.error(
            "Gemini Recommendation Error:",
            error.message
        );

        return [];
    }
};

module.exports = {
    recommendVideos,
};