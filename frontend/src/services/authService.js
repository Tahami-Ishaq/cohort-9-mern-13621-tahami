import API_BASE_URL from "./api";

const API_URL = `${API_BASE_URL}/auth`;

const fetchAuthResponse = async (url, options, fallbackMessage) => {
    try {
        const response = await fetch(url, options);
        const data = await response.json();

        return { response, data };
    } catch (error) {
        throw new Error(fallbackMessage, { cause: error });
    }
};

export const registerUser = async (userData) => {
    const { response, data } = await fetchAuthResponse(`${API_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
    }, "Registration failed");

    if (!response.ok) {
        throw new Error(data.message || "Registration failed");
    }

    return data;
};

export const loginUser = async (userData) => {
    const { response, data } = await fetchAuthResponse(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
    }, "Login failed");

    if (!response.ok) {
        throw new Error(data.message || "Login failed");
    }

    return data;
};