import { fireEvent, render, screen } from "@testing-library/react";
import { AuthProvider, useAuth } from "../src/context/AuthContext";

const AuthConsumer = () => {
    const { token, isAuthenticated, login, logout } = useAuth();

    return (
        <div>
            <span data-testid="token">{token || "none"}</span>
            <span data-testid="authenticated">{String(isAuthenticated)}</span>
            <button onClick={() => login("new-token")}>Login</button>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

describe("AuthContext", () => {
    beforeEach(() => localStorage.clear());

    it("initializes from the stored token", () => {
        localStorage.setItem("token", "stored-token");

        render(
            <AuthProvider>
                <AuthConsumer />
            </AuthProvider>
        );

        expect(screen.getByTestId("token")).toHaveTextContent("stored-token");
        expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    });

    it("persists login and clears it on logout", () => {
        render(
            <AuthProvider>
                <AuthConsumer />
            </AuthProvider>
        );

        fireEvent.click(screen.getByRole("button", { name: "Login" }));
        expect(localStorage.getItem("token")).toBe("new-token");
        expect(screen.getByTestId("authenticated")).toHaveTextContent("true");

        fireEvent.click(screen.getByRole("button", { name: "Logout" }));
        expect(localStorage.getItem("token")).toBeNull();
        expect(screen.getByTestId("token")).toHaveTextContent("none");
        expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    });
});
