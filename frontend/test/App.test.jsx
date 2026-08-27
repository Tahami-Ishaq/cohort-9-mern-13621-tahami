import { render, screen } from "@testing-library/react";
import { AuthProvider } from "../src/context/AuthContext";
import App from "../src/App";

jest.mock("../src/pages/Notes", () => () => <p>Notes route</p>);
jest.mock("../src/pages/Login", () => () => <p>Login route</p>);
jest.mock("../src/pages/Register", () => () => <p>Register route</p>);
jest.mock("../src/pages/Profile", () => () => <p>Profile route</p>);

describe("App routes", () => {
    beforeEach(() => {
        localStorage.clear();
        window.history.pushState({}, "", "/");
    });

    it("redirects the root route to notes for authenticated users", () => {
        localStorage.setItem("token", "token");

        render(
            <AuthProvider>
                <App />
            </AuthProvider>
        );

        expect(screen.getByText("Notes route")).toBeInTheDocument();
    });

    it("redirects protected routes to login when unauthenticated", () => {
        window.history.pushState({}, "", "/notes");

        render(
            <AuthProvider>
                <App />
            </AuthProvider>
        );

        expect(screen.getByText("Login route")).toBeInTheDocument();
    });

    it("renders public register route", () => {
        window.history.pushState({}, "", "/register");

        render(
            <AuthProvider>
                <App />
            </AuthProvider>
        );

        expect(screen.getByText("Register route")).toBeInTheDocument();
    });
});
