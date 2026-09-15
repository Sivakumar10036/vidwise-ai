import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("vidwise_user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [token, setToken] = useState(() => {
        return localStorage.getItem("vidwise_token");
    });

    const login = (userData, jwtToken) => {

        setUser(userData);
        setToken(jwtToken);

        localStorage.setItem(
            "vidwise_user",
            JSON.stringify(userData)
        );

        localStorage.setItem(
            "vidwise_token",
            jwtToken
        );
    };

    const logout = () => {

        setUser(null);
        setToken(null);

        localStorage.removeItem("vidwise_user");
        localStorage.removeItem("vidwise_token");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};