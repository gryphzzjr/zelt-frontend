import React, { useEffect } from 'react';
import { Navigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, token, workspace, workspaces, loading, isAuthenticated, selectWorkspaceById } = useAuth();
    const { userId } = useParams();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const workspaceId = searchParams.get('workspaceId');

    // Sincroniza workspace da URL com o context
    useEffect(() => {
        if (workspaceId && token && workspaces.length > 0) {
            const found = workspaces.find(w => w.id === workspaceId);
            if (found && found.id !== workspace?.id) {
                selectWorkspaceById(token, workspaceId);
            }
        }
    }, [workspaceId, token, workspaces, workspace?.id, selectWorkspaceById]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-[3px] border-gray-200 border-t-[#6300ff] rounded-full animate-spin" />
                    <p className="text-xs text-gray-400">Carregando...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Valida se o userId da URL corresponde ao usuario logado
    if (userId && userId !== user.id) {
        return <Navigate to={`/workspace/${user.id}/workspaces`} replace />;
    }

    // Valida se o workspaceId pertence ao usuario logado
    if (workspaceId && workspaces.length > 0) {
        const belongsToUser = workspaces.some(w => w.id === workspaceId);
        if (!belongsToUser) {
            return <Navigate to={`/workspace/${user.id}/workspaces`} replace />;
        }
    }

    // Redireciona para workspaces apenas se estiver no dashboard SEM workspaceId
    if (!workspaceId && !location.pathname.includes('/workspaces') && !location.pathname.includes('/profile')) {
        return <Navigate to={`/workspace/${user.id}/workspaces`} replace />;
    }

    return children;
}
