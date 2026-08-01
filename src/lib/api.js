const API_URL = import.meta.env.VITE_API_URL || "https://zelt-backend-production.up.railway.app/api/v1";

function getToken() {
    return localStorage.getItem("token");
}

async function request(
    path,
    options = {}
) {
    const token = getToken();
    const headers = {
        ...(options.headers || {}),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Request failed");
    }

    return data;
}

export const api = {
    get: (path, opts) => request(path, opts),
    post: (path, body, opts) =>
        request(path, { ...opts, method: "POST", body: body instanceof FormData ? body : JSON.stringify(body) }),
    put: (path, body, opts) =>
        request(path, { ...opts, method: "PUT", body: JSON.stringify(body) }),
    patch: (path, body, opts) =>
        request(path, { ...opts, method: "PATCH", body: JSON.stringify(body) }),
    delete: (path, opts) => request(path, { ...opts, method: "DELETE" }),
    upload: (path, formData, opts) =>
        request(path, { ...opts, method: "POST", body: formData }),
};

// ---------- WORKSPACE ----------

export const workspaceApi = {
    list: () => api.get("/workspace"),
    get: (id) => api.get(`/workspace/${id}`),
    create: (name, description) =>
        api.post("/workspace", { name, description }),
    update: (id, data) =>
        api.patch(`/workspace/${id}`, data),
    delete: (id) => api.delete(`/workspace/${id}`),
    validateAccess: (id) => api.get(`/workspace/${id}/validate`),
};

// ---------- MEMBERS ----------

export const memberApi = {
    list: (workspaceId) => api.get(`/workspace/${workspaceId}/members`),
    inviteByEmail: (workspaceId, email, role, permissions) =>
        api.post(`/workspace/${workspaceId}/invite/email`, { email, role, permissions }),
    generateLink: (workspaceId, role, permissions, expiresInDays, maxUses) =>
        api.post(`/workspace/${workspaceId}/invite/link`, { role, permissions, expiresInDays, maxUses }),
    resendInvite: (workspaceId, inviteId) =>
        api.post(`/workspace/${workspaceId}/invite/resend/${inviteId}`),
    revokeInvite: (workspaceId, inviteId) =>
        api.post(`/workspace/${workspaceId}/invite/revoke/${inviteId}`),
    changeRole: (workspaceId, targetUserId, role) =>
        api.patch(`/workspace/${workspaceId}/members/role`, { targetUserId, role }),
    updatePermissions: (workspaceId, targetUserId, permissions) =>
        api.patch(`/workspace/${workspaceId}/members/permissions`, { targetUserId, permissions }),
    deactivate: (workspaceId, targetUserId) =>
        api.patch(`/workspace/${workspaceId}/members/${targetUserId}/deactivate`),
    reactivate: (workspaceId, targetUserId) =>
        api.patch(`/workspace/${workspaceId}/members/${targetUserId}/reactivate`),
    remove: (workspaceId, targetUserId) =>
        api.delete(`/workspace/${workspaceId}/members/${targetUserId}`),
};

// ---------- INVITES ----------

export const inviteApi = {
    validate: (token) => api.post("/workspace/invite/validate", { token }),
    accept: (token) => api.post("/workspace/invite/accept", { token }),
    pending: () => api.get("/workspace/invites/pending"),
    listLinks: (workspaceId) => api.get(`/workspace/${workspaceId}/invite/links`),
};

// ---------- TASKS ----------

export const taskApi = {
    list: (workspaceId, params) => {
        const query = params ? "?" + new URLSearchParams(params).toString() : "";
        return api.get(`/workspace/${workspaceId}/tasks${query}`);
    },
    get: (workspaceId, taskId) =>
        api.get(`/workspace/${workspaceId}/tasks/${taskId}`),
    create: (workspaceId, data) =>
        api.post(`/workspace/${workspaceId}/tasks`, data),
    update: (workspaceId, taskId, data) =>
        api.patch(`/workspace/${workspaceId}/tasks/${taskId}`, data),
    delete: (workspaceId, taskId) =>
        api.delete(`/workspace/${workspaceId}/tasks/${taskId}`),
    addComment: (workspaceId, taskId, text) =>
        api.post(`/workspace/${workspaceId}/tasks/${taskId}/comments`, { text }),
    deleteComment: (workspaceId, taskId, commentId) =>
        api.delete(`/workspace/${workspaceId}/tasks/${taskId}/comments/${commentId}`),
    stats: (workspaceId) =>
        api.get(`/workspace/${workspaceId}/stats`),
};

// ---------- KNOWLEDGE BASE ----------

export const knowledgeApi = {
    list: (workspaceId, params) => {
        const query = params ? "?" + new URLSearchParams(params).toString() : "";
        return api.get(`/workspace/${workspaceId}/knowledge${query}`);
    },
    get: (workspaceId, itemId) =>
        api.get(`/workspace/${workspaceId}/knowledge/${itemId}`),
    create: (workspaceId, data) =>
        api.upload(`/workspace/${workspaceId}/knowledge`, data),
    update: (workspaceId, itemId, data) =>
        api.patch(`/workspace/${workspaceId}/knowledge/${itemId}`, data),
    delete: (workspaceId, itemId) =>
        api.delete(`/workspace/${workspaceId}/knowledge/${itemId}`),
    stats: (workspaceId) =>
        api.get(`/workspace/${workspaceId}/knowledge/stats`),
};

// ---------- EVOLUTION API (all requests go through backend) ----------

export const evolutionApi = {
    listInstances: (workspaceId) => {
        const opts = workspaceId ? { headers: { "x-workspace-id": workspaceId } } : {};
        return api.get("/evolution/instances", opts);
    },
    getInstance: (name) => api.get(`/evolution/instances/${name}`),
    createInstance: (instanceName, webhookUrl, workspaceId) => {
        const body = {
            instanceName,
            workspaceId,
            integration: "WHATSAPP-BAILEYS",
            qrcode: true,
            alwaysOnline: false,
            groupsIgnore: false,
            readMessages: true,
            readStatus: false,
            syncFullHistory: false,
        };
        const url = webhookUrl || import.meta.env.VITE_WEBHOOK_URL;
        if (url) {
            body.webhook = {
                enabled: true,
                url,
                events: ["MESSAGES_UPSERT", "CONNECTION_UPDATE", "QRCODE_UPDATED"],
                webhookBase64: true,
            };
        }
        return api.post("/evolution/instances", body);
    },
    connectInstance: (name, number) => api.post(`/evolution/instances/${name}/connect`, number ? { number } : {}),
    logoutInstance: (name) => api.post(`/evolution/instances/${name}/logout`),
    deleteInstance: (name) => api.delete(`/evolution/instances/${name}`),
    setWebhook: (name, url, events) => api.put(`/evolution/instances/${name}/webhook`, { url, events }),
    getWebhook: (name) => api.get(`/evolution/instances/${name}/webhook`),
    sendText: (name, number, text, quotedMessageId) => api.post(`/evolution/instances/${name}/send-text`, {
        number,
        text,
        quotedMessageId,
    }),
    checkNumber: (name, number) => api.post(`/evolution/instances/${name}/check-number`, { number }),
    updateProfileName: (name, newName) => api.post(`/evolution/instances/${name}/update-profile-name`, { name: newName }),
    updateProfilePicture: (name, file) => {
        const form = new FormData();
        form.append("file", file);
        return api.upload(`/evolution/instances/${name}/update-profile-picture`, form);
    },
    updateProfileStatus: (name, status) => api.post(`/evolution/instances/${name}/update-profile-status`, { status }),
    updateSettings: (name, settings) => api.post(`/evolution/instances/${name}/update-settings`, settings),
    findChats: (name) => api.post(`/evolution/instances/${name}/find-chats`, {}),
    findMessages: (name, remoteJid) => api.post(`/evolution/instances/${name}/find-messages`, { remoteJid }),
    findAllMessages: (name) => api.post(`/evolution/instances/${name}/find-all-messages`, {}),
    findContacts: (name, where = {}) => api.post(`/evolution/instances/${name}/find-contacts`, { where }),
    fetchAllGroups: (name) => api.get(`/evolution/instances/${name}/groups`),
    findGroupParticipants: (name, groupJid) => api.get(`/evolution/instances/${name}/groups/participants?groupJid=${groupJid}`),
    fetchProfilePicture: (name, number) => api.post(`/evolution/instances/${name}/fetch-profile-picture`, { number }),
};

// ---------- SETTINGS ----------

export const settingsApi = {
    getWorkspace: (workspaceId) =>
        api.get(`/workspace/${workspaceId}/settings`),
    updateWorkspace: (workspaceId, data) =>
        api.patch(`/workspace/${workspaceId}/settings`, data),
    getProfile: (workspaceId) =>
        api.get(`/workspace/${workspaceId}/profile`),
    updateProfile: (workspaceId, data) =>
        api.patch(`/workspace/${workspaceId}/profile`, data),
    auditLogs: (workspaceId, params) => {
        const query = params ? "?" + new URLSearchParams(params).toString() : "";
        return api.get(`/workspace/${workspaceId}/audit-logs${query}`);
    },
};

export const onboardingApi = {
    getStatus: (workspaceId) =>
        api.get(`/user/onboarding?workspaceId=${workspaceId}`),
    completeStep: (step) =>
        api.post(`/user/onboarding/complete`, { step }),
    reset: () =>
        api.post(`/user/onboarding/reset`),
};

// ---------- GEMINI AI ----------

export const geminiApi = {
    getAutoReply: (workspaceId) =>
        api.get("/ai/auto-reply", { headers: { "x-workspace-id": workspaceId } }),
    toggleAutoReply: (workspaceId, enabled) =>
        api.post("/ai/auto-reply", { enabled }, { headers: { "x-workspace-id": workspaceId } }),
    chat: (message, instanceName, remoteJid, workspaceId, systemPrompt) =>
        api.post("/ai/chat", { message, instanceName, remoteJid, systemPrompt }, { headers: { "x-workspace-id": workspaceId } }),
    clearConversation: (instanceName, remoteJid) =>
        api.post("/ai/clear", { instanceName, remoteJid }),
};

// ---------- AGENDA / CALENDAR ----------

export const agendaApi = {
    list: (workspaceId, params) => {
        const query = params ? "?" + new URLSearchParams(params).toString() : "";
        return api.get(`/workspace/${workspaceId}/events${query}`);
    },
    get: (workspaceId, eventId) =>
        api.get(`/workspace/${workspaceId}/events/${eventId}`),
    create: (workspaceId, data) =>
        api.post(`/workspace/${workspaceId}/events`, data),
    update: (workspaceId, eventId, data) =>
        api.patch(`/workspace/${workspaceId}/events/${eventId}`, data),
    delete: (workspaceId, eventId) =>
        api.delete(`/workspace/${workspaceId}/events/${eventId}`),
    stats: (workspaceId) =>
        api.get(`/workspace/${workspaceId}/events/stats`),
};

// ---------- CHAT (SSE + DB) ----------

export const chatApi = {
    getMediaUrl: (instanceName, filename) => {
        const token = getToken();
        return `${API_URL}/media/${instanceName}/${filename}?token=${token}`;
    },
    connectSSE: (instanceName, onMessage) => {
        const token = getToken();
        const url = `${API_URL}/chat/sse/${instanceName}`;
        const es = new EventSource(`${url}?token=${token}`);
        es.addEventListener("message", (e) => {
            try { onMessage("message", JSON.parse(e.data)); } catch {}
        });
        es.addEventListener("message.upsert", (e) => {
            try { onMessage("message.upsert", JSON.parse(e.data)); } catch {}
        });
        es.addEventListener("message.status", (e) => {
            try { onMessage("message.status", JSON.parse(e.data)); } catch {}
        });
        es.addEventListener("connection.update", (e) => {
            try { onMessage("connection.update", JSON.parse(e.data)); } catch {}
        });
        es.addEventListener("qrcode.updated", (e) => {
            try { onMessage("qrcode.updated", JSON.parse(e.data)); } catch {}
        });
        es.onerror = () => {};
        return es;
    },
    getMessages: (instanceName, remoteJid, limit = 100) =>
        api.get(`/chat/messages/${instanceName}/${remoteJid}?limit=${limit}`),
    getContacts: (instanceName) =>
        api.get(`/chat/contacts/${instanceName}`),
    updateContactName: (contactId, customName) =>
        api.put(`/chat/contacts/${contactId}/name`, { customName }),
    getTags: (instanceName) =>
        api.get(`/chat/tags/${instanceName}`),
    createTag: (instanceName, { label, color }) =>
        api.post(`/chat/tags/${instanceName}`, { label, color }),
    deleteTag: (tagId) =>
        api.delete(`/chat/tags/${tagId}`),
    setContactTags: (contactId, tagIds) =>
        api.put(`/chat/contacts/${contactId}/tags`, { tagIds }),
    saveMessage: (data) =>
        api.post("/chat/messages", data),
    deleteMessages: (instanceName, remoteJid) =>
        api.delete(`/chat/messages/${instanceName}/${remoteJid}`),
    batchUpdateProfilePics: (pics) =>
        api.post("/chat/contacts/batch-profile-pic", { pics }),
};
