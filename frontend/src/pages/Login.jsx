import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

const Login = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (error) {
            setError("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { email, password } = formData;

        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await loginUser({
                email,
                password,
            });

            // Save JWT token
            if (response?.token) {
                localStorage.setItem("token", response.token);
            }

            navigate("/notes");
        } catch (error) {
            setError(
                error?.message ||
                "Unable to login. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-visual">
                <div className="brand">
                    <div className="brand-mark">N</div>
                    <span>Notes</span>
                </div>

                <div className="visual-content">
                    <div className="visual-eyebrow">
                        <span></span>
                        Your thoughts, organized
                    </div>

                    <h2>
                        Capture ideas.
                        <br />
                        <span>Keep them close.</span>
                    </h2>

                    <p>
                        A calm space for your thoughts, ideas and
                        everyday notes. Everything you need, nothing
                        you don't.
                    </p>
                </div>

                <div className="visual-footer">
                    © 2026 Notes App
                </div>
            </section>

            <section className="auth-form-section">
                <div className="auth-card">
                    <div className="auth-heading">
                        <h1>Welcome back</h1>
                        <p>
                            Sign in to continue to your notes.
                        </p>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="form-group">
                            <label htmlFor="email">
                                Email address
                            </label>

                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Signing in..."
                                : "Sign in"}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Don't have an account?{" "}
                        <Link to="/register">
                            Create one
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Login;