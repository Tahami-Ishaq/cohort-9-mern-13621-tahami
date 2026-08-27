jest.mock("../src/services/api", () => ({
    __esModule: true,
    default: "/api/v1",
}));

import { getProfile, loginUser, registerUser } from "../src/services/authService";

const response = (body, ok = true) => ({
    ok,
    json: jest.fn().mockResolvedValue(body),
});

describe("authService", () => {
    beforeEach(() => {
        globalThis.fetch = jest.fn();
        localStorage.clear();
    });

    afterEach(() => jest.restoreAllMocks());

    it("registers a user with a JSON POST request", async () => {
        const data = { success: true };
        fetch.mockResolvedValue(response(data));

        await expect(registerUser({ name: "Sam", email: "sam@example.com", password: "secret" }))
            .resolves.toEqual(data);

        expect(fetch).toHaveBeenCalledWith("/api/v1/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Sam", email: "sam@example.com", password: "secret" }),
        });
    });

    it("returns the login response and reports server errors", async () => {
        const data = { success: true, data: { token: "token" } };
        fetch.mockResolvedValueOnce(response(data));
        await expect(loginUser({ email: "sam@example.com", password: "secret" })).resolves.toEqual(data);

        fetch.mockResolvedValueOnce(response({ message: "Invalid email or password" }, false));
        await expect(loginUser({ email: "sam@example.com", password: "wrong" }))
            .rejects.toThrow("Invalid email or password");
    });

    it("gets the profile with the stored token", async () => {
        localStorage.setItem("token", "profile-token");
        const data = { success: true, data: { name: "Sam" } };
        fetch.mockResolvedValue(response(data));

        await expect(getProfile()).resolves.toEqual(data);
        expect(fetch).toHaveBeenCalledWith("/api/v1/auth/me", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer profile-token",
            },
        });
    });

    it("uses fallback messages for network errors", async () => {
        fetch.mockRejectedValue(new Error("offline"));

        await expect(loginUser({ email: "sam@example.com", password: "secret" }))
            .rejects.toThrow("Login failed");
    });
});
