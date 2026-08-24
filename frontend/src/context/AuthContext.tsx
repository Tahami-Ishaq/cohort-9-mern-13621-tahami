import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [token, setToken] = useState(
        localStorage.getItem("token")
    );

    const login = (newToken) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
    };

    const isAuthenticated = Boolean(token);

    return (
        <AuthContext.Provider
            value={{
                token,
                isAuthenticated,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};