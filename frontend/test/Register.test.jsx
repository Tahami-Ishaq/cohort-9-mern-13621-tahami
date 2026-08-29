import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Register from "../src/pages/Register";
import { registerUser } from "../src/services/authService";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));
jest.mock("../src/services/authService", () => ({ registerUser: jest.fn() }));

const renderRegister = () => render(
    <MemoryRouter>
        <Register />
    </MemoryRouter>
);

describe("Register", () => {
    beforeEach(() => jest.clearAllMocks());

    it("validates required registration fields", async () => {
        const user = userEvent.setup();
        renderRegister();

        await user.click(screen.getByRole("button", { name: "Create account" }));

        expect(screen.getByText("Name, email and password are required.")).toBeInTheDocument();
        expect(registerUser).not.toHaveBeenCalled();
    });

    it("registers the user and navigates to login", async () => {
        const user = userEvent.setup();
        registerUser.mockResolvedValue({ success: true });
        renderRegister();

        await user.type(screen.getByLabelText("Full name"), "Sam User");
        await user.type(screen.getByLabelText("Email address"), "sam@example.com");
        await user.type(screen.getByLabelText("Password"), "secret123");
        await user.click(screen.getByRole("button", { name: "Create account" }));

        expect(registerUser).toHaveBeenCalledWith({
            name: "Sam User",
            email: "sam@example.com",
            password: "secret123",
        });
        expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    it("shows API-declared registration errors", async () => {
        const user = userEvent.setup();
        registerUser.mockResolvedValue({ success: false, message: "Email is already registered" });
        renderRegister();

        await user.type(screen.getByLabelText("Full name"), "Sam User");
        await user.type(screen.getByLabelText("Email address"), "sam@example.com");
        await user.type(screen.getByLabelText("Password"), "secret123");
        await user.click(screen.getByRole("button", { name: "Create account" }));

        expect(await screen.findByText("Email is already registered")).toBeInTheDocument();
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
