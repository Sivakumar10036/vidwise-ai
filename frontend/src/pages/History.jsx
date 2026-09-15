import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const History = () => {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [searches, setSearches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ==========================================
    // GET SEARCH HISTORY
    // ==========================================

    const fetchHistory = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:5000/api/searches/history",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch history");
            }

            setSearches(data.searches || []);
        } catch (error) {
            console.error("History Error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // DELETE ONE SEARCH
    // ==========================================

    const deleteSearch = async (id) => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/searches/history/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to delete search");
            }

            setSearches((prev) =>
                prev.filter((search) => search._id !== id)
            );
        } catch (error) {
            console.error("Delete Search Error:", error);
            setError(error.message);
        }
    };

    // ==========================================
    // DELETE ALL HISTORY
    // ==========================================

    const clearHistory = async () => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete all search history?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/searches/history",
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
                    data.message || "Failed to clear history"
                );
            }

            setSearches([]);
        } catch (error) {
            console.error("Clear History Error:", error);
            setError(error.message);
        }
    };

    // ==========================================
    // LOAD HISTORY
    // ==========================================

    useEffect(() => {
        if (token) {
            fetchHistory();
        }
    }, [token]);

    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (date) => {
        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // ==========================================
    // UI
    // ==========================================

    return (
        <div className="history-page">

            {/* SIDEBAR */}
            <aside className="sidebar">

                <div className="brand">
                    <span className="brand-icon">✦</span>
                    <span>VidWise AI</span>
                </div>

                <nav className="sidebar-nav">

                    <button
                        className="sidebar-item"
                        onClick={() => navigate("/dashboard")}
                    >
                        <span>🏠</span>
                        Dashboard
                    </button>

                    <button className="sidebar-item active">
                        <span>📜</span>
                        History
                    </button>

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
                        className="sidebar-item"
                        onClick={() => {
                            localStorage.removeItem("vidwise_token");
                            localStorage.removeItem("vidwise_user");
                            navigate("/login");
                        }}
                    >
                        <span>🚪</span>
                        Logout
                    </button>

                </div>

            </aside>

            {/* MAIN CONTENT */}
            <main className="history-main">

                {/* HEADER */}
                <div className="history-header">

                    <div>
                        <p className="history-label">
                            YOUR ACTIVITY
                        </p>

                        <h1>
                            Search History
                        </h1>

                        <p>
                            See what you've searched for on VidWise AI.
                        </p>
                    </div>

                    {searches.length > 0 && (
                        <button
                            className="clear-history-button"
                            onClick={clearHistory}
                        >
                            🗑 Clear All
                        </button>
                    )}

                </div>

                {/* ERROR */}
                {error && (
                    <div className="history-error">
                        ⚠️ {error}

                        <button
                            onClick={() => setError("")}
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* LOADING */}
                {loading ? (
                    <div className="history-loading">
                        <div className="spinner"></div>
                        <p>Loading your search history...</p>
                    </div>
                ) : searches.length === 0 ? (

                    /* EMPTY STATE */

                    <div className="history-empty">

                        <div className="empty-icon">
                            📜
                        </div>

                        <h2>
                            No searches yet
                        </h2>

                        <p>
                            Your YouTube searches will appear here.
                        </p>

                        <button
                            onClick={() => navigate("/dashboard")}
                            className="start-search-button"
                        >
                            🔎 Start Searching
                        </button>

                    </div>

                ) : (

                    /* HISTORY LIST */

                    <div className="history-list">

                        {searches.map((search) => (

                            <div
                                className="history-card"
                                key={search._id}
                            >

                                <div className="history-card-icon">
                                    🔎
                                </div>

                                <div className="history-card-content">

                                    <h3>
                                        {search.query}
                                    </h3>

                                    <div className="history-meta">
                                        <span>
                                            🎬 {search.resultCount} videos
                                        </span>

                                        <span>
                                            •
                                        </span>

                                        <span>
                                            {formatDate(search.createdAt)}
                                        </span>
                                    </div>

                                </div>

                                <button
                                    className="delete-history-button"
                                    onClick={() =>
                                        deleteSearch(search._id)
                                    }
                                    title="Delete search"
                                >
                                    🗑
                                </button>

                            </div>

                        ))}

                    </div>
                )}

            </main>

        </div>
    );
};

export default History;