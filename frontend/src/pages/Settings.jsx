import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Settings = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [appearance, setAppearance] = useState("dark");

    const [showPasswordForm, setShowPasswordForm] = useState(false);

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [passwordMessage, setPasswordMessage] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    useEffect(() => {
        const savedSettings = localStorage.getItem(
            "vidwise_settings"
        );

        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);

                const savedAppearance =
                    settings.appearance || "dark";

                setAppearance(savedAppearance);

                document.documentElement.setAttribute(
                    "data-theme",
                    savedAppearance
                );
            } catch (error) {
                console.error(
                    "Failed to load settings:",
                    error
                );
            }
        } else {
            document.documentElement.setAttribute(
                "data-theme",
                "dark"
            );
        }
    }, []);

    const showMessage = (type, text) => {
        setMessageType(type);
        setMessage(text);

        setTimeout(() => {
            setMessage("");
            setMessageType("");
        }, 3000);
    };

    const handleAppearanceChange = (value) => {
        setAppearance(value);

        document.documentElement.setAttribute(
            "data-theme",
            value
        );

        const settings = {
            appearance: value
        };

        localStorage.setItem(
            "vidwise_settings",
            JSON.stringify(settings)
        );
    };

    const saveSettings = () => {
        const settings = {
            appearance
        };

        localStorage.setItem(
            "vidwise_settings",
            JSON.stringify(settings)
        );

        document.documentElement.setAttribute(
            "data-theme",
            appearance
        );

        showMessage(
            "success",
            "Settings saved successfully."
        );
    };

    const handlePasswordChange = async (event) => {
        event.preventDefault();

        setPasswordMessage("");
        setPasswordError("");

        if (!passwordData.currentPassword) {
            setPasswordError(
                "Please enter your current password."
            );
            return;
        }

        if (!passwordData.newPassword) {
            setPasswordError(
                "Please enter your new password."
            );
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError(
                "New password must be at least 6 characters."
            );
            return;
        }

        if (
            passwordData.newPassword !==
            passwordData.confirmPassword
        ) {
            setPasswordError(
                "New password and confirm password do not match."
            );
            return;
        }

        setPasswordLoading(true);

        try {
            const token = localStorage.getItem(
                "vidwise_token"
            );

            const response = await fetch(
                "http://localhost:5000/api/auth/change-password",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        currentPassword:
                            passwordData.currentPassword,
                        newPassword:
                            passwordData.newPassword
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setPasswordError(
                    data.message ||
                        "Failed to change password."
                );
                return;
            }

            setPasswordMessage(
                data.message ||
                    "Password changed successfully."
            );

            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });

            setTimeout(() => {
                setShowPasswordForm(false);
                setPasswordMessage("");
            }, 2000);
        } catch (error) {
            console.error(
                "Change password error:",
                error
            );

            setPasswordError(
                "Unable to connect to the server."
            );
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleClearHistory = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete all search history?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const token = localStorage.getItem(
                "vidwise_token"
            );

            const response = await fetch(
                "http://localhost:5000/api/searches/history",
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                showMessage(
                    "error",
                    data.message ||
                        "Failed to clear history."
                );
                return;
            }

            showMessage(
                "success",
                "Search history cleared successfully."
            );
        } catch (error) {
            console.error(
                "Clear history error:",
                error
            );

            showMessage(
                "error",
                "Unable to connect to the server."
            );
        }
    };

    const handleClearFavorites = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete all favorites?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const token = localStorage.getItem(
                "vidwise_token"
            );

            const response = await fetch(
                "http://localhost:5000/api/favorites",
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                showMessage(
                    "error",
                    data.message ||
                        "Failed to clear favorites."
                );
                return;
            }

            showMessage(
                "success",
                "All favorites cleared successfully."
            );
        } catch (error) {
            console.error(
                "Clear favorites error:",
                error
            );

            showMessage(
                "error",
                "Unable to connect to the server."
            );
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const displayName =
        user?.name || "VidWise User";

    const displayEmail =
        user?.email || "user@example.com";

    return (
        <div className="settings-page">

            <aside className="sidebar">

                <div className="sidebar-logo">
                    <div className="logo-icon">
                        ▶
                    </div>

                    <div>
                        <h2>
                            VidWise AI
                        </h2>

                        <span>
                            Learn Smarter
                        </span>
                    </div>
                </div>

                <nav className="sidebar-nav">

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        <span>⌂</span>
                        Dashboard
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/history")
                        }
                    >
                        <span>◷</span>
                        History
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/favorites")
                        }
                    >
                        <span>☆</span>
                        Favorites
                    </button>

                    <button
                        type="button"
                        className="active"
                        onClick={() =>
                            navigate("/settings")
                        }
                    >
                        <span>⚙</span>
                        Settings
                    </button>

                </nav>

                <div className="sidebar-bottom">

                    <div className="sidebar-user">

                        <div className="user-avatar">
                            {displayName
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div className="user-info">

                            <strong>
                                {displayName}
                            </strong>

                            <span>
                                {displayEmail}
                            </span>

                        </div>

                    </div>

                    <button
                        type="button"
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </aside>

            <main className="settings-main">

                <div className="settings-header">

                    <div>
                        <h1>
                            Settings
                        </h1>

                        <p>
                            Manage your VidWise AI preferences
                            and account.
                        </p>
                    </div>

                </div>

                {message && (
                    <div
                        className={
                            messageType === "success"
                                ? "settings-message success"
                                : "settings-message error"
                        }
                    >
                        {message}
                    </div>
                )}

                <div className="settings-container">

                    <section className="settings-card">

                        <div className="settings-card-header">

                            <div className="settings-card-icon">
                                👤
                            </div>

                            <div>
                                <h2>
                                    Profile
                                </h2>

                                <p>
                                    View your account information.
                                </p>
                            </div>

                        </div>

                        <div className="settings-card-body">

                            <div className="profile-details">

                                <div className="profile-avatar">
                                    {displayName
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>

                                <div className="profile-info">

                                    <div className="profile-field">

                                        <span>
                                            Name
                                        </span>

                                        <strong>
                                            {displayName}
                                        </strong>

                                    </div>

                                    <div className="profile-field">

                                        <span>
                                            Email
                                        </span>

                                        <strong>
                                            {displayEmail}
                                        </strong>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </section>

                    <section className="settings-card">

                        <div className="settings-card-header">

                            <div className="settings-card-icon">
                                🎨
                            </div>

                            <div>
                                <h2>
                                    Appearance
                                </h2>

                                <p>
                                    Choose how VidWise AI
                                    looks.
                                </p>
                            </div>

                        </div>

                        <div className="settings-card-body">

                            <div className="appearance-options">

                                <button
                                    type="button"
                                    className={
                                        appearance === "dark"
                                            ? "appearance-option active"
                                            : "appearance-option"
                                    }
                                    onClick={() =>
                                        handleAppearanceChange(
                                            "dark"
                                        )
                                    }
                                >
                                    <span className="appearance-icon">
                                        🌙
                                    </span>

                                    <div>
                                        <strong>
                                            Dark
                                        </strong>

                                        <p>
                                            Use dark appearance
                                        </p>
                                    </div>

                                </button>

                                <button
                                    type="button"
                                    className={
                                        appearance === "light"
                                            ? "appearance-option active"
                                            : "appearance-option"
                                    }
                                    onClick={() =>
                                        handleAppearanceChange(
                                            "light"
                                        )
                                    }
                                >
                                    <span className="appearance-icon">
                                        ☀️
                                    </span>

                                    <div>
                                        <strong>
                                            Light
                                        </strong>

                                        <p>
                                            Use light appearance
                                        </p>
                                    </div>

                                </button>

                            </div>

                            <button
                                type="button"
                                className="save-settings-button"
                                onClick={saveSettings}
                            >
                                Save Changes
                            </button>

                        </div>

                    </section>

                    <section className="settings-card">

                        <div className="settings-card-header">

                            <div className="settings-card-icon">
                                🔐
                            </div>

                            <div>
                                <h2>
                                    Security
                                </h2>

                                <p>
                                    Manage your account password.
                                </p>
                            </div>

                        </div>

                        <div className="settings-card-body">

                            {!showPasswordForm ? (

                                <div className="security-row">

                                    <div>
                                        <strong>
                                            Password
                                        </strong>

                                        <p>
                                            Change your current
                                            account password.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={() => {
                                            setShowPasswordForm(
                                                true
                                            );

                                            setPasswordMessage(
                                                ""
                                            );

                                            setPasswordError(
                                                ""
                                            );
                                        }}
                                    >
                                        Change Password
                                    </button>

                                </div>

                            ) : (

                                <form
                                    className="password-form"
                                    onSubmit={
                                        handlePasswordChange
                                    }
                                >

                                    <div className="password-form-header">

                                        <div>
                                            <h3>
                                                Change Password
                                            </h3>

                                            <p>
                                                Enter your current
                                                password and choose
                                                a new password.
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            className="close-password-button"
                                            onClick={() => {
                                                setShowPasswordForm(
                                                    false
                                                );

                                                setPasswordData({
                                                    currentPassword:
                                                        "",
                                                    newPassword:
                                                        "",
                                                    confirmPassword:
                                                        ""
                                                });

                                                setPasswordMessage(
                                                    ""
                                                );

                                                setPasswordError(
                                                    ""
                                                );
                                            }}
                                        >
                                            ×
                                        </button>

                                    </div>

                                    <div className="form-group">

                                        <label>
                                            Current Password
                                        </label>

                                        <input
                                            type="password"
                                            value={
                                                passwordData.currentPassword
                                            }
                                            onChange={(event) =>
                                                setPasswordData({
                                                    ...passwordData,
                                                    currentPassword:
                                                        event
                                                            .target
                                                            .value
                                                })
                                            }
                                            placeholder="Enter current password"
                                            autoComplete="current-password"
                                        />

                                    </div>

                                    <div className="form-group">

                                        <label>
                                            New Password
                                        </label>

                                        <input
                                            type="password"
                                            value={
                                                passwordData.newPassword
                                            }
                                            onChange={(event) =>
                                                setPasswordData({
                                                    ...passwordData,
                                                    newPassword:
                                                        event
                                                            .target
                                                            .value
                                                })
                                            }
                                            placeholder="Enter new password"
                                            autoComplete="new-password"
                                        />

                                    </div>

                                    <div className="form-group">

                                        <label>
                                            Confirm New Password
                                        </label>

                                        <input
                                            type="password"
                                            value={
                                                passwordData.confirmPassword
                                            }
                                            onChange={(event) =>
                                                setPasswordData({
                                                    ...passwordData,
                                                    confirmPassword:
                                                        event
                                                            .target
                                                            .value
                                                })
                                            }
                                            placeholder="Confirm new password"
                                            autoComplete="new-password"
                                        />

                                    </div>

                                    {passwordError && (
                                        <div className="password-error">
                                            {passwordError}
                                        </div>
                                    )}

                                    {passwordMessage && (
                                        <div className="password-success">
                                            {passwordMessage}
                                        </div>
                                    )}

                                    <div className="password-actions">

                                        <button
                                            type="button"
                                            className="secondary-button"
                                            onClick={() => {
                                                setShowPasswordForm(
                                                    false
                                                );

                                                setPasswordData({
                                                    currentPassword:
                                                        "",
                                                    newPassword:
                                                        "",
                                                    confirmPassword:
                                                        ""
                                                });

                                                setPasswordError(
                                                    ""
                                                );

                                                setPasswordMessage(
                                                    ""
                                                );
                                            }}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            className="primary-button"
                                            disabled={
                                                passwordLoading
                                            }
                                        >
                                            {passwordLoading
                                                ? "Updating..."
                                                : "Update Password"}
                                        </button>

                                    </div>

                                </form>

                            )}

                        </div>

                    </section>

                    <section className="settings-card">

                        <div className="settings-card-header">

                            <div className="settings-card-icon">
                                🗃️
                            </div>

                            <div>
                                <h2>
                                    Data Management
                                </h2>

                                <p>
                                    Manage your saved VidWise AI
                                    data.
                                </p>
                            </div>

                        </div>

                        <div className="settings-card-body">

                            <div className="data-row">

                                <div>
                                    <strong>
                                        Search History
                                    </strong>

                                    <p>
                                        Delete all your saved
                                        search history.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="danger-button"
                                    onClick={
                                        handleClearHistory
                                    }
                                >
                                    Clear History
                                </button>

                            </div>

                            <div className="data-divider"></div>

                            <div className="data-row">

                                <div>
                                    <strong>
                                        Favorites
                                    </strong>

                                    <p>
                                        Remove all saved favorite
                                        videos.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="danger-button"
                                    onClick={
                                        handleClearFavorites
                                    }
                                >
                                    Clear Favorites
                                </button>

                            </div>

                        </div>

                    </section>

                </div>

            </main>

        </div>
    );
};

export default Settings;