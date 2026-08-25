import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getProfile } from "../services/authService";
import "../styles/Profile.css";

const Profile = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const response = await getProfile();

                setUser(response.data);
            } catch (error) {
                localStorage.removeItem("token");

                setError(
                    error.message ||
                    "Unable to load profile."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    if (loading) {
        return (
            <main className="profile-page">
                <div className="profile-card loading-card">
                    <div className="profile-spinner"></div>
                    <p>Loading your profile...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="profile-page">
                <div className="profile-card">
                    <p className="profile-error">
                        {error}
                    </p>

                    <Link to="/login">
                        Go to Login
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="profile-page">
            <div className="profile-card">

                {/* Header */}
                <div className="profile-header">
                    <Link
                        to="/notes"
                        className="back-button"
                    >
                        ← Back to Notes
                    </Link>

                    <h1>My Profile</h1>

                    <p>
                        Manage your account information.
                    </p>
                </div>

                {/* Avatar */}
                <div className="profile-avatar">
                    {user?.name?.charAt(0)?.toUpperCase()}
                </div>

                {/* User Information */}
                <div className="profile-info">

                    <div className="profile-info-item">
                        <span className="profile-label">
                            Full name
                        </span>

                        <span className="profile-value">
                            {user?.name}
                        </span>
                    </div>

                    <div className="profile-info-item">
                        <span className="profile-label">
                            Email address
                        </span>

                        <span className="profile-value">
                            {user?.email}
                        </span>
                    </div>

                    <div className="profile-info-item">
                        <span className="profile-label">
                            Member since
                        </span>

                        <span className="profile-value">
                            {user?.created_at
                                ? new Date(
                                      user.created_at
                                  ).toLocaleDateString(
                                      "en-US",
                                      {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                      }
                                  )
                                : "—"}
                        </span>
                    </div>

                </div>

                {/* Logout */}
                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </main>
    );
};

export default Profile;