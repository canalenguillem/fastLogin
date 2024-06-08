// AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const userData = localStorage.getItem('user');
        setIsAuthenticated(!!token);
        setUser(userData ? JSON.parse(userData) : null);
    }, []);

    const login = (token, user) => {
        localStorage.setItem('access_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setIsAuthenticated(true);
        setUser(user);
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
        window.location.href = '/login'; // Redirigir a la página de login
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
