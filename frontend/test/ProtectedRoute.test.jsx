import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../src/context/AuthContext";
import ProtectedRoute from "../src/routes/ProtectedRoute";

const renderRoutes = () => render(
    <AuthProvider>
        <MemoryRouter initialEntries={["/private"]}>
            <Routes>
                <Route element={<ProtectedRoute />}>
                    <Route path="/private" element={<p>Private content</p>} />
                </Route>
                <Route path="/login" element={<p>Login page</p>} />
            </Routes>
        </MemoryRouter>
    </AuthProvider>
);

describe("ProtectedRoute", () => {
    beforeEach(() => localStorage.clear());

    it("redirects unauthenticated users to login", () => {
        renderRoutes();

        expect(screen.getByText("Login page")).toBeInTheDocument();
        expect(screen.queryByText("Private content")).not.toBeInTheDocument();
    });

    it("renders the protected outlet for authenticated users", () => {
        localStorage.setItem("token", "valid-token");

        renderRoutes();

        expect(screen.getByText("Private content")).toBeInTheDocument();
    });
});
