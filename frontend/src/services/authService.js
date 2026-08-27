// @ts-check

import API_BASE_URL from "./api";

const API_URL = `${API_BASE_URL}/auth`;

/** @typedef {{name: string, email: string, password: string}} RegistrationPayload */
/** @typedef {{email: string, password: string}} LoginPayload */
/** @typedef {{success: boolean, message?: string, data?: Record<string, unknown>}} AuthResponseData */
/** @typedef {{response: Response, data: AuthResponseData}} AuthResponse */

/**
 * @param {string} url
 * @param {RequestInit} options
 * @param {string} fallbackMessage
 * @returns {Promise<AuthResponse>}
 */
const fetchAuthResponse = async (url, options, fallbackMessage) => {
    try {
        const response = await fetch(url, options);
        const data = await response.json();

        return { response, data };
    } catch (error) {
        throw new Error(fallbackMessage, { cause: error });
    }
};

/** @param {RegistrationPayload} userData */
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

/** @param {LoginPayload} userData */
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

export const getProfile = async () => {
    const token = localStorage.getItem("token");

    const { response, data } = await fetchAuthResponse(`${API_URL}/me`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    }, "Failed to fetch profile");

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch profile");
    }

    const profile = data?.data;

    if (!profile || typeof profile !== "object") {
        throw new Error("Invalid profile response");
    }

    return {
        ...data,
        data: {
            ...profile,
            name: typeof profile.name === "string" ? profile.name : "",
            email: typeof profile.email === "string" ? profile.email : "",
        },
    };
};