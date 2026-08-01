import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://zelt-backend-production.up.railway.app/api/v1';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [workspace, setWorkspace] = useState(null);
    const [workspaces, setWorkspaces] = useState([]);
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
                fetchWorkspaces(storedToken);
            } catch {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    const fetchWorkspaces = async (authToken) => {
        try {
            const res = await fetch(`${API_URL}/workspace`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await res.json();

            if (data.success) {
                const all = [...(data.owned || []), ...(data.members || [])];
                setWorkspaces(all);
            }
        } catch {
            // Silently fail
        } finally {
            setLoading(false);
        }
    };

    const switchWorkspace = useCallback((workspaceId) => {
        const found = workspaces.find(w => w.id === workspaceId);
        if (found) {
            setWorkspace(found);
        }
    }, [workspaces]);

    const selectWorkspaceById = useCallback(async (authToken, workspaceId) => {
        try {
            const res = await fetch(`${API_URL}/workspace/${workspaceId}`, {
                headers: { 'Authorization': `Bearer ${authToken || token}` }
            });
            const data = await res.json();

            if (data.success && data.workspace) {
                setWorkspace(data.workspace);
                return data.workspace;
            }
        } catch {
            // Silently fail
        }
        return null;
    }, [token]);

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

        // Busca workspaces
        const wsRes = await fetch(`${API_URL}/workspace`, {
            headers: { 'Authorization': `Bearer ${data.token}` }
        });
        const wsData = await wsRes.json();

        if (wsData.success) {
            const all = [...(wsData.owned || []), ...(wsData.members || [])];
            setWorkspaces(all);
        }

        return { success: true, user: data.user };
    };

    const completeGoogleLogin = async (googleToken, googleUser) => {
        localStorage.setItem('token', googleToken);
        localStorage.setItem('user', JSON.stringify(googleUser));

        setToken(googleToken);
        setUser(googleUser);

        const wsRes = await fetch(`${API_URL}/workspace`, {
            headers: { 'Authorization': `Bearer ${googleToken}` }
        });
        const wsData = await wsRes.json();

        if (wsData.success) {
            const all = [...(wsData.owned || []), ...(wsData.members || [])];
            setWorkspaces(all);
        }

        return { success: true, user: googleUser };
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setWorkspace(null);
        setWorkspaces([]);
    };

    const setAccountType = async (accountType) => {
        const res = await fetch(`${API_URL}/auth/set-account-type`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ accountType })
        });
        const data = await res.json();
        if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            return data.user;
        }
        throw new Error(data.message || 'Erro ao atualizar tipo de conta.');
    };

    const isAuthenticated = !!token && !!user;

    return (
        <AuthContext.Provider value={{
            user,
            token,
            workspace,
            workspaces,
            loading,
            isAuthenticated,
            login,
            completeGoogleLogin,
            logout,
            setAccountType,
            switchWorkspace,
            selectWorkspaceById
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
