import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Login from "../src/pages/Login";
import { loginUser } from "../src/services/authService";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));
jest.mock("../src/services/authService", () => ({ loginUser: jest.fn() }));

const renderLogin = () => render(
    <MemoryRouter>
        <Login />
    </MemoryRouter>
);

describe("Login", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    it("shows required-field validation", async () => {
        const user = userEvent.setup();
        renderLogin();

        await user.click(screen.getByRole("button", { name: "Sign in" }));

        expect(screen.getByText("Email and password are required.")).toBeInTheDocument();
        expect(loginUser).not.toHaveBeenCalled();
    });

    it("logs in, stores the token, and navigates to notes", async () => {
        const user = userEvent.setup();
        loginUser.mockResolvedValue({ success: true, data: { token: "jwt-token" } });
        renderLogin();

        await user.type(screen.getByLabelText("Email address"), "sam@example.com");
        await user.type(screen.getByLabelText("Password"), "secret123");
        await user.click(screen.getByRole("button", { name: "Sign in" }));

        expect(loginUser).toHaveBeenCalledWith({ email: "sam@example.com", password: "secret123" });
        expect(localStorage.getItem("token")).toBe("jwt-token");
        expect(mockNavigate).toHaveBeenCalledWith("/notes");
    });

    it("displays login errors and clears them when the user edits", async () => {
        const user = userEvent.setup();
        loginUser.mockRejectedValue(new Error("Invalid email or password"));
        renderLogin();

        await user.type(screen.getByLabelText("Email address"), "sam@example.com");
        await user.type(screen.getByLabelText("Password"), "wrongpass");
        await user.click(screen.getByRole("button", { name: "Sign in" }));
        expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();

        await user.type(screen.getByLabelText("Password"), "1");
        expect(screen.queryByText("Invalid email or password")).not.toBeInTheDocument();
    });
});
