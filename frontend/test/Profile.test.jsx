import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Profile from "../src/pages/Profile";
import { getProfile } from "../src/services/authService";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));
jest.mock("../src/services/authService", () => ({ getProfile: jest.fn() }));

const renderProfile = () => render(
    <MemoryRouter>
        <Profile />
    </MemoryRouter>
);

describe("Profile", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    it("redirects to login when no token exists", async () => {
        renderProfile();

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/login"));
        expect(getProfile).not.toHaveBeenCalled();
    });

    it("renders the fetched profile", async () => {
        localStorage.setItem("token", "token");
        getProfile.mockResolvedValue({
            data: {
                name: "Sam User",
                email: "sam@example.com",
                created_at: "2026-01-15T00:00:00.000Z",
            },
        });
        renderProfile();

        expect(await screen.findByText("Sam User")).toBeInTheDocument();
        expect(screen.getByText("sam@example.com")).toBeInTheDocument();
        expect(screen.getByText("January 15, 2026")).toBeInTheDocument();
        expect(screen.getByText("S")).toBeInTheDocument();
    });

    it("clears an invalid token and displays the profile error", async () => {
        localStorage.setItem("token", "expired-token");
        getProfile.mockRejectedValue(new Error("Invalid or expired token"));
        renderProfile();

        expect(await screen.findByText("Invalid or expired token")).toBeInTheDocument();
        expect(localStorage.getItem("token")).toBeNull();
        expect(screen.getByRole("link", { name: "Go to Login" })).toBeInTheDocument();
    });

    it("logs out and navigates to login", async () => {
        const user = userEvent.setup();
        localStorage.setItem("token", "token");
        getProfile.mockResolvedValue({ data: { name: "Sam", email: "sam@example.com" } });
        renderProfile();

        await screen.findByText("Sam");
        await user.click(screen.getByRole("button", { name: "Logout" }));

        expect(localStorage.getItem("token")).toBeNull();
        expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
});
