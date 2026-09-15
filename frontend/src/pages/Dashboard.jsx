import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();

    // =====================================================
    // STATE
    // =====================================================

    const [query, setQuery] = useState("");
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [favoriteIds, setFavoriteIds] = useState(new Set());
    const [favoriteLoadingId, setFavoriteLoadingId] = useState(null);


    // =====================================================
    // LOAD FAVORITES
    // =====================================================

    useEffect(() => {
        const loadFavorites = async () => {
            if (!token) return;

            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/favorites`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to load favorites"
                    );
                }

                setFavoriteIds(
                    new Set(
                        (data.favorites || [])
                            .map(
                                (favorite) =>
                                    favorite.video?.videoId
                            )
                            .filter(Boolean)
                    )
                );
            } catch (err) {
                console.error(
                    "Load Favorites Error:",
                    err
                );
            }
        };

        loadFavorites();
    }, [token]);


    // =====================================================
    // TOGGLE FAVORITE
    // =====================================================

    const toggleFavorite = async (video) => {
        if (!token || !video?.videoId) return;

        const videoId = video.videoId;
        const isFavorite = favoriteIds.has(videoId);

        setFavoriteLoadingId(videoId);
        setError("");

        try {
            const response = await fetch(
                isFavorite
                    ? `${import.meta.env.VITE_API_URL}/api/favorites/${encodeURIComponent(videoId)}`
                    : `${import.meta.env.VITE_API_URL}/api/favorites`,
                {
                    method: isFavorite ? "DELETE" : "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        ...(isFavorite
                            ? {}
                            : {
                                  "Content-Type": "application/json",
                              }),
                    },
                    ...(isFavorite
                        ? {}
                        : {
                              body: JSON.stringify({ video }),
                          }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update favorite"
                );
            }

            setFavoriteIds((previous) => {
                const updated = new Set(previous);

                if (isFavorite) {
                    updated.delete(videoId);
                } else {
                    updated.add(videoId);
                }

                return updated;
            });
        } catch (err) {
            console.error(
                "Favorite Error:",
                err
            );

            setError(
                err.message ||
                "Failed to update favorite."
            );
        } finally {
            setFavoriteLoadingId(null);
        }
    };


    // =====================================================
    // SEARCH VIDEOS
    // =====================================================

    const searchVideos = async (searchText = query) => {
        const finalQuery = searchText.trim();

        if (!finalQuery) {
            setError("Please enter something to search.");
            return;
        }

        if (!token) {
            setError("Please login again to continue.");
            return;
        }

        setLoading(true);
        setError("");
        setSelectedVideo(null);

        try {
            console.log("Searching for:", finalQuery);

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/youtube/search?query=${encodeURIComponent(
                    finalQuery
                )}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            console.log("Search response:", data);

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to search videos"
                );
            }

            setVideos(data.videos || []);
            setQuery(finalQuery);

            // Scroll to results
            setTimeout(() => {
                const results =
                    document.querySelector(".recommendation");

                if (results) {
                    results.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
                }
            }, 100);

        } catch (err) {
            console.error("Search Error:", err);

            setError(
                err.message ||
                "Something went wrong while searching."
            );

            setVideos([]);

        } finally {
            setLoading(false);
        }
    };


    // =====================================================
    // SEARCH FORM
    // =====================================================

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        searchVideos();
    };


    // =====================================================
    // SEARCH SUGGESTION
    // =====================================================

    const handleSuggestion = (text) => {
        setQuery(text);
        setError("");
    };


    // =====================================================
    // FORMAT NUMBER
    // =====================================================

    const formatNumber = (number) => {
        if (!number) {
            return "0";
        }

        if (number >= 1000000000) {
            return (
                (number / 1000000000)
                    .toFixed(1)
                    .replace(".0", "") + "B"
            );
        }

        if (number >= 1000000) {
            return (
                (number / 1000000)
                    .toFixed(1)
                    .replace(".0", "") + "M"
            );
        }

        if (number >= 1000) {
            return (
                (number / 1000)
                    .toFixed(1)
                    .replace(".0", "") + "K"
            );
        }

        return number.toString();
    };


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {
        if (!date) {
            return "";
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
            }
        );
    };


    // =====================================================
    // OPEN VIDEO
    // =====================================================

    const openVideo = (video) => {
        setSelectedVideo(video);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };


    // =====================================================
    // CLOSE VIDEO
    // =====================================================

    const closeVideo = () => {
        setSelectedVideo(null);
    };


    // =====================================================
    // DASHBOARD UI
    // =====================================================

    return (
        <div className="dashboard">

            {/* =================================================
                FIXED SIDEBAR
            ================================================= */}

            <aside className="sidebar">

                {/* LOGO */}

                <div className="sidebar-logo">
                    <span>✦</span>
                    <span>VidWise AI</span>
                </div>


                {/* NAVIGATION */}

                <nav className="sidebar-nav">

                    {/* DASHBOARD */}

                    <button
                        type="button"
                        className="nav-item active"
                        onClick={() => {
                            window.scrollTo({
                                top: 0,
                                behavior: "smooth",
                            });
                        }}
                    >
                        <span className="nav-icon">
                            🏠
                        </span>

                        <span>
                            Dashboard
                        </span>
                    </button>


                    {/* HISTORY */}

                    <button
                        type="button"
                        className="nav-item"
                        onClick={() => navigate("/history")}
                    >
                        <span className="nav-icon">
                            📜
                        </span>

                        <span>
                            History
                        </span>
                    </button>


                    {/* FAVORITES */}

                    <button
                        type="button"
                        className="nav-item"
                        onClick={() => navigate("/favorites")}
                    >
                        <span className="nav-icon">
                            ⭐
                        </span>

                        <span>
                            Favorites
                        </span>
                    </button>

                </nav>


                {/* SIDEBAR BOTTOM */}

                <div className="sidebar-bottom">

                    {/* SETTINGS */}

                    <button
                        type="button"
                        className="nav-item"
                        onClick={() => navigate("/settings")}
                    >
                        <span className="nav-icon">
                            ⚙️
                        </span>

                        <span>
                            Settings
                        </span>
                    </button>


                    {/* LOGOUT */}

                    <button
                        type="button"
                        className="logout-button"
                        onClick={logout}
                    >
                        <span className="nav-icon">
                            🚪
                        </span>

                        <span>
                            Logout
                        </span>
                    </button>

                </div>

            </aside>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="main-content">


                {/* =================================================
                    TOP BAR
                ================================================= */}

                <header className="topbar">

                    <div className="welcome-section">

                        <h2>
                            Good to see you,{" "}
                            {user?.name || "there"} 👋
                        </h2>

                        <p>
                            Discover the best videos
                            to learn anything.
                        </p>

                    </div>


                    {/* PROFILE */}

                    <div className="profile">

                        <div className="avatar">

                            {user?.name
                                ?.charAt(0)
                                .toUpperCase() || "U"}

                        </div>

                        <span className="profile-name">
                            {user?.name || "User"}
                        </span>

                    </div>

                </header>


                {/* =================================================
                    HERO SEARCH
                ================================================= */}

                <section className="hero">

                    <div className="hero-content">


                        {/* AI BADGE */}

                        <div className="ai-badge">

                            <span>✨</span>

                            AI POWERED

                        </div>


                        {/* TITLE */}

                        <h1>
                            Find the best videos.
                        </h1>


                        {/* DESCRIPTION */}

                        <p>
                            Tell VidWise what you want
                            to learn and discover highly
                            relevant YouTube videos.
                        </p>


                        {/* =================================================
                            SEARCH FORM
                        ================================================= */}

                        <form
                            className="search-box"
                            onSubmit={handleSearchSubmit}
                        >

                            <span className="search-icon">
                                🔎
                            </span>


                            <input
                                type="text"
                                placeholder="What do you want to learn?"
                                value={query}
                                onChange={(event) => {
                                    setQuery(
                                        event.target.value
                                    );

                                    if (error) {
                                        setError("");
                                    }
                                }}
                                autoComplete="off"
                            />


                            <button
                                type="submit"
                                className="search-button"
                                disabled={loading}
                            >

                                {loading
                                    ? "Searching..."
                                    : "Find Videos"}

                            </button>

                        </form>


                        {/* =================================================
                            SUGGESTIONS
                        ================================================= */}

                        <div className="search-suggestions">

                            <span className="try-text">
                                Try:
                            </span>


                            <button
                                type="button"
                                onClick={() =>
                                    handleSuggestion(
                                        "Java HashMap"
                                    )
                                }
                            >
                                Java HashMap
                            </button>


                            <button
                                type="button"
                                onClick={() =>
                                    handleSuggestion(
                                        "Python for beginners"
                                    )
                                }
                            >
                                Python
                            </button>


                            <button
                                type="button"
                                onClick={() =>
                                    handleSuggestion(
                                        "Data Structures and Algorithms"
                                    )
                                }
                            >
                                DSA
                            </button>


                            <button
                                type="button"
                                onClick={() =>
                                    handleSuggestion(
                                        "React JS tutorial"
                                    )
                                }
                            >
                                React
                            </button>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="search-error">

                        <span className="error-icon">
                            ⚠️
                        </span>

                        <span className="error-text">
                            {error}
                        </span>

                        <button
                            type="button"
                            className="error-close"
                            onClick={() =>
                                setError("")
                            }
                        >
                            ×
                        </button>

                    </div>

                )}


                {/* =================================================
                    VIDEO PLAYER
                ================================================= */}

                {selectedVideo && (

                    <section className="video-player-section">


                        {/* PLAYER HEADER */}

                        <div className="player-header">

                            <div>

                                <span className="now-playing">
                                    ▶ NOW PLAYING
                                </span>

                                <h2>
                                    {
                                        selectedVideo.title
                                    }
                                </h2>

                            </div>


                            <button
                                type="button"
                                className="close-player"
                                onClick={closeVideo}
                            >
                                ✕
                            </button>

                        </div>


                        {/* PLAYER */}

                        <div className="youtube-player">

                            <iframe
                                src={`${selectedVideo.embedUrl}?autoplay=1`}
                                title={
                                    selectedVideo.title
                                }
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />

                        </div>


                        {/* DETAILS */}

                        <div className="player-details">

                            <div className="player-title">

                                <h3>
                                    {
                                        selectedVideo.title
                                    }
                                </h3>

                                <p>
                                    {
                                        selectedVideo.channelTitle
                                    }
                                </p>

                            </div>


                            <div className="player-stats">

                                <span>
                                    👁{" "}
                                    {formatNumber(
                                        selectedVideo.views
                                    )}{" "}
                                    views
                                </span>

                                <span>
                                    👍{" "}
                                    {formatNumber(
                                        selectedVideo.likes
                                    )}{" "}
                                    likes
                                </span>

                                <span>
                                    💬{" "}
                                    {formatNumber(
                                        selectedVideo.comments
                                    )}{" "}
                                    comments
                                </span>

                                <span>
                                    📅{" "}
                                    {formatDate(
                                        selectedVideo.publishedAt
                                    )}
                                </span>

                            </div>

                        </div>

                    </section>

                )}


                {/* =================================================
                    STATS
                ================================================= */}

                <section className="stats">



                    


                    {/* TOP VIDEO VIEWS */}

                    <div className="stat-card">

                        <div className="stat-icon">
                            👁
                        </div>

                        <div>

                            <p>
                                Top Video Views
                            </p>

                            <h3>

                                {videos.length > 0
                                    ? formatNumber(
                                        videos[0].views
                                    )
                                    : "0"}

                            </h3>

                        </div>

                    </div>


                    {/* VIDEOS DISCOVERED */}

                    <div className="stat-card">

                        <div className="stat-icon">
                            🎥
                        </div>

                        <div>

                            <p>
                                Videos Discovered
                            </p>

                            <h3>
                                {videos.length}
                            </h3>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    RESULTS
                ================================================= */}

                {videos.length > 0 && (

                    <section className="recommendation">


                        {/* SECTION HEADER */}

                        <div className="section-heading">

                            <div>

                                <div className="section-label">
                                    ✦ VIDWISE RESULTS
                                </div>

                                <h2>
                                    Most Popular Videos
                                </h2>

                                <p>
                                    Ranked by direct learning intent,
                                    popularity, AI relevance and freshness.
                                </p>

                            </div>


                            <span className="result-count">
                                {videos.length} videos
                            </span>

                        </div>


                        {/* =================================================
                            FEATURED VIDEO
                        ================================================= */}

                        {videos[0] && (

                            <div className="featured-video">


                                {/* THUMBNAIL */}

                                <div
                                    className="featured-thumbnail"
                                    onClick={() =>
                                        openVideo(
                                            videos[0]
                                        )
                                    }
                                >

                                    <img
                                        src={
                                            videos[0]
                                                .thumbnail
                                        }
                                        alt={
                                            videos[0]
                                                .title
                                        }
                                    />


                                    <div className="featured-overlay">

                                        <div className="big-play-button">
                                            ▶
                                        </div>

                                    </div>


                                    <div className="featured-rank">
                                        🏆 #{videos[0].rank || 1} RANKED RESULT
                                    </div>


                                    <div className="featured-views">

                                        👁{" "}
                                        {formatNumber(
                                            videos[0].views
                                        )}

                                    </div>

                                </div>


                                {/* FEATURED CONTENT */}

                                <div className="featured-content">


                                    <div className="featured-label">
                                        🏆 #{videos[0].rank || 1} TOP RESULT
                                    </div>


                                    <h2>
                                        {videos[0].title}
                                    </h2>


                                    <p className="featured-channel">
                                        {
                                            videos[0]
                                                .channelTitle
                                        }
                                    </p>


                                    {/* STATS */}

                                    <div className="featured-stats">


                                        <div>

                                            <strong>
                                                👁{" "}
                                                {formatNumber(
                                                    videos[0]
                                                        .views
                                                )}
                                            </strong>

                                            <span>
                                                Views
                                            </span>

                                        </div>


                                        <div>

                                            <strong>
                                                👍{" "}
                                                {formatNumber(
                                                    videos[0]
                                                        .likes
                                                )}
                                            </strong>

                                            <span>
                                                Likes
                                            </span>

                                        </div>


                                        <div>

                                            <strong>
                                                💬{" "}
                                                {formatNumber(
                                                    videos[0]
                                                        .comments
                                                )}
                                            </strong>

                                            <span>
                                                Comments
                                            </span>

                                        </div>

                                    </div>


                                    {/* ACTIONS */}

                                    <div className="featured-actions">


                                        <button
                                            type="button"
                                            className="featured-watch"
                                            onClick={() =>
                                                openVideo(
                                                    videos[0]
                                                )
                                            }
                                        >
                                            ▶ Watch Now
                                        </button>


                                        <button
                                            type="button"
                                            className={
                                                favoriteIds.has(
                                                    videos[0].videoId
                                                )
                                                    ? "featured-favorite active"
                                                    : "featured-favorite"
                                            }
                                            onClick={() =>
                                                toggleFavorite(
                                                    videos[0]
                                                )
                                            }
                                            disabled={
                                                favoriteLoadingId ===
                                                videos[0].videoId
                                            }
                                        >
                                            {favoriteIds.has(
                                                videos[0].videoId
                                            )
                                                ? "★ Saved"
                                                : "☆ Save"}
                                        </button>


                                        <a
                                            href={
                                                videos[0]
                                                    .youtubeUrl
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                            className="featured-youtube"
                                        >
                                            YouTube ↗
                                        </a>

                                    </div>

                                </div>

                            </div>

                        )}


                        {/* =================================================
                            MORE VIDEOS
                        ================================================= */}

                        {videos.length > 1 && (

                            <>

                                <div className="other-videos-heading">

                                    <div>

                                        <h3>
                                            More Videos
                                        </h3>

                                        <p>
                                            Sorted by popularity
                                        </p>

                                    </div>

                                </div>


                                <div className="video-grid">


                                    {videos
                                        .slice(1)
                                        .map(
                                            (
                                                video,
                                                index
                                            ) => {

                                                const rank =
                                                    video.rank || index + 2;


                                                return (

                                                    <article
                                                        className="video-card"
                                                        key={
                                                            video.videoId
                                                        }
                                                    >


                                                        {/* THUMBNAIL */}

                                                        <div
                                                            className="video-thumbnail"
                                                            onClick={() =>
                                                                openVideo(
                                                                    video
                                                                )
                                                            }
                                                        >

                                                            <img
                                                                src={
                                                                    video.thumbnail
                                                                }
                                                                alt={
                                                                    video.title
                                                                }
                                                            />


                                                            <div className="play-overlay">

                                                                <div className="play-button">
                                                                    ▶
                                                                </div>

                                                            </div>


                                                            <span className="rank">
                                                                #{rank}
                                                            </span>

                                                        </div>


                                                        {/* VIDEO INFO */}

                                                        <div className="video-info">


                                                            <h3
                                                                title={
                                                                    video.title
                                                                }
                                                            >
                                                                {
                                                                    video.title
                                                                }
                                                            </h3>


                                                            <p className="channel">
                                                                {
                                                                    video.channelTitle
                                                                }
                                                            </p>


                                                            <div className="video-stats">


                                                                <span>
                                                                    👁{" "}
                                                                    {formatNumber(
                                                                        video.views
                                                                    )}
                                                                </span>


                                                                <span>
                                                                    👍{" "}
                                                                    {formatNumber(
                                                                        video.likes
                                                                    )}
                                                                </span>


                                                                <span>
                                                                    💬{" "}
                                                                    {formatNumber(
                                                                        video.comments
                                                                    )}
                                                                </span>

                                                            </div>

                                                            {(video.aiScore !== undefined ||
                                                                video.learningLevel) && (
                                                                <div className="video-ai-meta">

                                                                    {video.aiScore !== undefined && (
                                                                        <span className="ai-score-small">
                                                                            🧠 AI {video.aiScore}/100
                                                                        </span>
                                                                    )}

                                                                    {video.learningLevel && (
                                                                        <span className="learning-level-small">
                                                                            📚 {video.learningLevel}
                                                                        </span>
                                                                    )}

                                                                </div>
                                                            )}

                                                            {video.aiReason && (
                                                                <p className="video-ai-reason">
                                                                    {video.aiReason}
                                                                </p>
                                                            )}


                                                            <p className="published-date">

                                                                📅{" "}
                                                                {formatDate(
                                                                    video.publishedAt
                                                                )}

                                                            </p>


                                                            <div className="video-actions">


                                                                <button
                                                                    type="button"
                                                                    className="watch-button"
                                                                    onClick={() =>
                                                                        openVideo(
                                                                            video
                                                                        )
                                                                    }
                                                                >
                                                                    ▶ Watch
                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    className={
                                                                        favoriteIds.has(
                                                                            video.videoId
                                                                        )
                                                                            ? "favorite-button active"
                                                                            : "favorite-button"
                                                                    }
                                                                    onClick={() =>
                                                                        toggleFavorite(
                                                                            video
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        favoriteLoadingId ===
                                                                        video.videoId
                                                                    }
                                                                >
                                                                    {favoriteIds.has(
                                                                        video.videoId
                                                                    )
                                                                        ? "★ Saved"
                                                                        : "☆ Save"}
                                                                </button>

                                                                <a
                                                                    href={
                                                                        video.youtubeUrl
                                                                    }
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="youtube-link"
                                                                >
                                                                    YouTube ↗
                                                                </a>

                                                            </div>

                                                        </div>

                                                    </article>

                                                );

                                            }
                                        )}

                                </div>

                            </>

                        )}

                    </section>

                )}


                {/* =================================================
                    EMPTY STATE
                ================================================= */}

                {videos.length === 0 &&
                    !loading &&
                    !error && (

                        <section className="recommendation">


                            <div className="section-heading">

                                <div>

                                    <div className="section-label">
                                        ✦ VIDWISE AI
                                    </div>

                                    <h2>
                                        AI Recommendations
                                    </h2>

                                    <p>
                                        Your best matches
                                        will appear here.
                                    </p>

                                </div>

                            </div>


                            <div className="empty-state">


                                <div className="empty-icon">
                                    ✦
                                </div>


                                <h3>
                                    Your recommendations
                                    are waiting
                                </h3>


                                <p>
                                    Search for something
                                    you want to learn and
                                    VidWise will discover
                                    relevant YouTube
                                    videos for you.
                                </p>


                                <button
                                    type="button"
                                    className="empty-search-button"
                                    onClick={() => {

                                        const text =
                                            "Java programming";

                                        setQuery(text);

                                        searchVideos(text);

                                    }}
                                >
                                    ✨ Try a Search
                                </button>

                            </div>

                        </section>

                    )}


                {/* =================================================
                    LOADING
                ================================================= */}

                {loading && (

                    <section className="loading-section">

                        <div className="loader"></div>

                        <h3>
                            Searching YouTube...
                        </h3>

                        <p>
                            Finding the best videos
                            for you.
                        </p>

                    </section>

                )}

            </main>

        </div>
    );
};

export default Dashboard;