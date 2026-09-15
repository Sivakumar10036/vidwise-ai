import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {

    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            const API_URL =
                import.meta.env.VITE_API_URL ||
                "https://vidwise-ai.onrender.com";

            const response = await fetch(
                `${API_URL}/api/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const contentType =
                response.headers.get("content-type");

            if (!contentType || !contentType.includes("application/json")) {

                throw new Error(
                    `Server returned an invalid response (${response.status})`
                );
            }

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message || "Login failed"
                );
            }

            login(data.user, data.token);

            navigate("/dashboard");

        } catch (error) {

            setError(
                error.message ||
                "Unable to connect to server"
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-card">

                <div className="logo">
                    <span>✦</span>
                    VidWise AI
                </div>

                <h1>Welcome back</h1>

                <p className="subtitle">
                    Find the best videos with AI.
                </p>

                <form onSubmit={handleLogin}>

                    <label>Email</label>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                    />

                    <label>Password</label>

                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        required
                    />

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button
                        className="primary-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Signing in..."
                            : "Sign In"}
                    </button>

                </form>

                <p className="switch-auth">
                    Don't have an account?{" "}
                    <Link to="/signup">
                        Create one
                    </Link>
                </p>

            </div>

        </div>
    );
};

export default Login;