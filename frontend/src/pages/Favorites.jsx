import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Favorites = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();

    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const formatNumber = (number) => {
        if (!number) return "0";

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

    const formatDate = (date) => {
        if (!date) return "";

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
            }
        );
    };

    const loadFavorites = async () => {
        if (!token) return;

        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                "http://localhost:5000/api/favorites",
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

            setFavorites(data.favorites || []);
        } catch (err) {
            console.error(
                "Favorites Error:",
                err
            );

            setError(
                err.message ||
                "Failed to load favorites."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFavorites();
    }, [token]);

    const removeFavorite = async (videoId) => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/favorites/${encodeURIComponent(
                    videoId
                )}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to remove favorite"
                );
            }

            setFavorites((previous) =>
                previous.filter(
                    (favorite) =>
                        favorite.video?.videoId !== videoId
                )
            );
        } catch (err) {
            console.error(
                "Remove Favorite Error:",
                err
            );

            setError(
                err.message ||
                "Failed to remove favorite."
            );
        }
    };

    const clearFavorites = async () => {
        if (favorites.length === 0) return;

        if (!window.confirm("Remove all favorite videos?")) {
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/favorites",
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to clear favorites"
                );
            }

            setFavorites([]);
        } catch (err) {
            console.error(
                "Clear Favorites Error:",
                err
            );

            setError(
                err.message ||
                "Failed to clear favorites."
            );
        }
    };

    return (
        <div className="dashboard favorites-page">

            <aside className="sidebar">

                <div className="sidebar-logo">
                    <span>✦</span>
                    <span>VidWise AI</span>
                </div>

                <nav className="sidebar-nav">

                    <button
                        type="button"
                        className="nav-item"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        <span className="nav-icon">
                            🏠
                        </span>
                        <span>Dashboard</span>
                    </button>

                    <button
                        type="button"
                        className="nav-item"
                        onClick={() =>
                            navigate("/history")
                        }
                    >
                        <span className="nav-icon">
                            📜
                        </span>
                        <span>History</span>
                    </button>

                    <button
                        type="button"
                        className="nav-item active"
                    >
                        <span className="nav-icon">
                            ⭐
                        </span>
                        <span>Favorites</span>
                    </button>

                </nav>

                <div className="sidebar-bottom">

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

                    <button
                        type="button"
                        className="logout-button"
                        onClick={logout}
                    >
                        <span className="nav-icon">
                            🚪
                        </span>
                        <span>Logout</span>
                    </button>

                </div>

            </aside>

            <main className="main-content">

                <header className="topbar">

                    <div className="welcome-section">
                        <h2>
                            Your Favorites ⭐
                        </h2>

                        <p>
                            Videos you saved for later.
                        </p>
                    </div>

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
                            onClick={() => setError("")}
                        >
                            ×
                        </button>

                    </div>
                )}

                <section className="recommendation">

                    <div className="section-heading">

                        <div>
                            <div className="section-label">
                                ✦ SAVED VIDEOS
                            </div>

                            <h2>Your Favorites</h2>

                            <p>
                                Keep your favorite learning
                                videos in one place.
                            </p>
                        </div>

                        {favorites.length > 0 && (
                            <button
                                type="button"
                                className="clear-favorites-button"
                                onClick={clearFavorites}
                            >
                                Clear All
                            </button>
                        )}

                    </div>

                    {loading && (
                        <section className="loading-section">
                            <div className="loader"></div>

                            <h3>
                                Loading favorites...
                            </h3>

                            <p>
                                Fetching your saved videos.
                            </p>
                        </section>
                    )}

                    {!loading && favorites.length === 0 && (
                        <div className="empty-state favorites-empty">

                            <div className="empty-icon">
                                ⭐
                            </div>

                            <h3>
                                No favorites yet
                            </h3>

                            <p>
                                Save videos from your dashboard
                                and they will appear here.
                            </p>

                            <button
                                type="button"
                                className="empty-search-button"
                                onClick={() =>
                                    navigate("/dashboard")
                                }
                            >
                                Find Videos
                            </button>

                        </div>
                    )}

                    {!loading && favorites.length > 0 && (
                        <div className="video-grid">

                            {favorites.map((favorite) => {
                                const video =
                                    favorite.video;

                                return (
                                    <article
                                        className="video-card favorite-card"
                                        key={
                                            favorite._id ||
                                            video.videoId
                                        }
                                    >

                                        <div className="video-thumbnail">

                                            <img
                                                src={
                                                    video.thumbnail
                                                }
                                                alt={
                                                    video.title
                                                }
                                            />

                                            <span className="rank favorite-star">
                                                ⭐
                                            </span>

                                        </div>

                                        <div className="video-info">

                                            <h3
                                                title={
                                                    video.title
                                                }
                                            >
                                                {video.title}
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

                                            <p className="published-date">
                                                📅{" "}
                                                {formatDate(
                                                    video.publishedAt
                                                )}
                                            </p>

                                            <div className="video-actions">

                                                <a
                                                    href={
                                                        video.youtubeUrl
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="watch-button"
                                                >
                                                    ▶ Watch
                                                </a>

                                                <button
                                                    type="button"
                                                    className="favorite-button active"
                                                    onClick={() =>
                                                        removeFavorite(
                                                            video.videoId
                                                        )
                                                    }
                                                >
                                                    ★ Remove
                                                </button>

                                            </div>

                                        </div>

                                    </article>
                                );
                            })}

                        </div>
                    )}

                </section>

            </main>
        </div>
    );
};

export default Favorites;
