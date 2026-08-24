const API_ORIGIN = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const API_BASE_URL = `${API_ORIGIN}/api/v1`;

export default API_BASE_URL;