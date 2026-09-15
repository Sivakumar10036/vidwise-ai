const searchYouTube = async (query) => {

    const searchUrl = new URL(
        "https://www.googleapis.com/youtube/v3/search"
    );

    searchUrl.searchParams.append(
        "part",
        "snippet"
    );

    searchUrl.searchParams.append(
        "q",
        query
    );

    searchUrl.searchParams.append(
        "type",
        "video"
    );

    searchUrl.searchParams.append(
        "maxResults",
        "12"
    );

    searchUrl.searchParams.append(
        "order",
        "relevance"
    );

    searchUrl.searchParams.append(
        "regionCode",
        "IN"
    );

    searchUrl.searchParams.append(
        "key",
        process.env.YOUTUBE_API_KEY
    );


    const searchResponse = await fetch(
        searchUrl.toString()
    );

    if (!searchResponse.ok) {

        const errorData = await searchResponse.text();

        throw new Error(
            `YouTube search failed: ${errorData}`
        );
    }

    const searchData = await searchResponse.json();


    // Get video IDs
    const videoIds = searchData.items
        .map(item => item.id.videoId)
        .filter(Boolean);


    if (videoIds.length === 0) {
        return [];
    }


    // Get detailed video information
    const videoUrl = new URL(
        "https://www.googleapis.com/youtube/v3/videos"
    );

    videoUrl.searchParams.append(
        "part",
        "snippet,statistics,contentDetails"
    );

    videoUrl.searchParams.append(
        "id",
        videoIds.join(",")
    );

    videoUrl.searchParams.append(
        "key",
        process.env.YOUTUBE_API_KEY
    );


    const videoResponse = await fetch(
        videoUrl.toString()
    );

    if (!videoResponse.ok) {

        const errorData = await videoResponse.text();

        throw new Error(
            `YouTube video details failed: ${errorData}`
        );
    }

    const videoData = await videoResponse.json();


    // Format results for our application
    const videos = videoData.items.map(video => {

    return {
        videoId: video.id,

        title: video.snippet.title,

        description: video.snippet.description,

        channelId: video.snippet.channelId,

        channelTitle: video.snippet.channelTitle,

        publishedAt: video.snippet.publishedAt,

        thumbnail:
            video.snippet.thumbnails?.high?.url ||
            video.snippet.thumbnails?.medium?.url ||
            video.snippet.thumbnails?.default?.url,

        views:
            Number(video.statistics?.viewCount || 0),

        likes:
            Number(video.statistics?.likeCount || 0),

        comments:
            Number(video.statistics?.commentCount || 0),

        duration:
            video.contentDetails?.duration || null,

        youtubeUrl:
            `https://www.youtube.com/watch?v=${video.id}`,

        embedUrl:
            `https://www.youtube.com/embed/${video.id}`
    };
});


// =======================================
// VIDWISE RANKING
// =======================================
//
// Priority:
//
// 1. Views
// 2. Likes
// 3. Comments
// 4. Newest
//
// =======================================

videos.sort((a, b) => {

    // 1️⃣ Highest views
    if (b.views !== a.views) {
        return b.views - a.views;
    }

    // 2️⃣ Highest likes
    if (b.likes !== a.likes) {
        return b.likes - a.likes;
    }

    // 3️⃣ Highest comments
    if (b.comments !== a.comments) {
        return b.comments - a.comments;
    }

    // 4️⃣ Newest video
    return (
        new Date(b.publishedAt) -
        new Date(a.publishedAt)
    );

});

return videos;


    return videos;
};


module.exports = {
    searchYouTube
};