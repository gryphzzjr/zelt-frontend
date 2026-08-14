import React, { createContext, useContext, useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Carrega do localStorage ao montar
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                setToken(storedToken);
                setUser(parsed);
            } catch {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password, geo) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, ...geo })
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || 'Erro ao fazer login.');
        }

        if (data.requiresVerification) {
            return { requiresVerification: true, verifyToken: data.verifyToken };
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        setToken(data.token);
        setUser(data.user);

        return { success: true, user: data.user };
    };

    const completeGoogleLogin = async (googleToken, googleUser) => {
        localStorage.setItem('token', googleToken);
        localStorage.setItem('user', JSON.stringify(googleUser));

        setToken(googleToken);
        setUser(googleUser);

        return { success: true, user: googleUser };
    };

    const updateUser = (nextUser) => {
        const merged = { ...(user || {}), ...nextUser };
        setUser(merged);
        localStorage.setItem('user', JSON.stringify(merged));
        return merged;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const isAuthenticated = !!token && !!user;

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            isAuthenticated,
            login,
            completeGoogleLogin,
            updateUser,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
