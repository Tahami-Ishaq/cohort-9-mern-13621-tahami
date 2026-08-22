import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";


const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
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

    const { name, email, password } = formData;

    if (!name || !email || !password) {
        setError("Name, email and password are required.");
        return;
    }

    try {
        setLoading(true);
        setError("");

        const response = await registerUser({
            name,
            email,
            password,
        });

        if (response?.success === false) {
            setError(
                response.message ||
                "Unable to create your account."
            );
            return;
        }

        navigate("/login");
    } catch (error) {
        setError(
            error?.message ||
            "Unable to create your account. Please try again."
        );
    } finally {
        setLoading(false);
    }
};

    return (
        <main className="auth-page">
            {/* LEFT SIDE */}
            <section className="auth-visual">
                <div className="brand">
                    <div className="brand-mark">N</div>
                    <span>Notes</span>
                </div>

                <div className="visual-content">
                    <div className="visual-eyebrow">
                        <span></span>
                        A better place for your ideas
                    </div>

                    <h2>
                        Make space
                        <br />
                        <span>for your thoughts.</span>
                    </h2>

                    <p>
                        Create a personal space where your ideas,
                        plans and everyday thoughts can stay
                        organized and easy to find.
                    </p>
                </div>

                <div className="visual-footer">
                    © 2026 Notes App
                </div>
            </section>

            {/* RIGHT SIDE */}
            <section className="auth-form-section">
                <div className="auth-card">
                    <div className="auth-heading">
                        <h1>Create your account</h1>
                        <p>
                            Start capturing your thoughts in one place.
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
                            <label htmlFor="name">
                                Full name
                            </label>

                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your name"
                                autoComplete="name"
                            />
                        </div>

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
                                placeholder="Create a password"
                                autoComplete="new-password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating account..."
                                : "Create account"}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Already have an account?{" "}
                        <Link to="/login">
                            Sign in
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Register;