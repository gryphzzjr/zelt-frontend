const API_URL = import.meta.env.VITE_API_URL || "/api/v1";

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

// ---------- TASKS ----------

export const taskApi = {
    list: (params) => {
        const query = params ? "?" + new URLSearchParams(params).toString() : "";
        return api.get(`/tasks${query}`);
    },
    get: (taskId) =>
        api.get(`/tasks/${taskId}`),
    create: (data) =>
        api.post(`/tasks`, data),
    update: (taskId, data) =>
        api.patch(`/tasks/${taskId}`, data),
    delete: (taskId) =>
        api.delete(`/tasks/${taskId}`),
    addComment: (taskId, text) =>
        api.post(`/tasks/${taskId}/comments`, { text }),
    deleteComment: (taskId, commentId) =>
        api.delete(`/tasks/${taskId}/comments/${commentId}`),
    stats: () =>
        api.get(`/tasks/stats`),
};

// ---------- KNOWLEDGE BASE ----------

export const knowledgeApi = {
    list: (params) => {
        const query = params ? "?" + new URLSearchParams(params).toString() : "";
        return api.get(`/knowledge${query}`);
    },
    get: (itemId) =>
        api.get(`/knowledge/${itemId}`),
    create: (data) =>
        api.upload(`/knowledge`, data),
    update: (itemId, data) =>
        api.patch(`/knowledge/${itemId}`, data),
    delete: (itemId) =>
        api.delete(`/knowledge/${itemId}`),
    stats: () =>
        api.get(`/knowledge/stats`),
};

// ---------- EVOLUTION API (all requests go through backend) ----------

export const evolutionApi = {
    listInstances: () =>
        api.get("/evolution/instances"),
    getInstance: (name) => api.get(`/evolution/instances/${name}`),
    createInstance: (instanceName) =>
        api.post("/evolution/instances", {
            instanceName,
            integration: "WHATSAPP-BAILEYS",
            qrcode: true,
            alwaysOnline: false,
            groupsIgnore: true,
            readMessages: true,
            readStatus: false,
            syncFullHistory: false,
        }),
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
    getSettings: () =>
        api.get(`/settings`),
    updateSettings: (data) =>
        api.patch(`/settings`, data),
    getProfile: () =>
        api.get(`/settings/profile`),
    updateProfile: (data) =>
        api.patch(`/settings/profile`, data),
    auditLogs: (params) => {
        const query = params ? "?" + new URLSearchParams(params).toString() : "";
        return api.get(`/settings/audit-logs${query}`);
    },
};

export const onboardingApi = {
    getStatus: () =>
        api.get(`/user/onboarding`),
    completeStep: (step) =>
        api.post(`/user/onboarding/complete`, { step }),
    reset: () =>
        api.post(`/user/onboarding/reset`),
};

// ---------- GEMINI AI ----------

export const geminiApi = {
    getAutoReply: () =>
        api.get("/ai/auto-reply"),
    toggleAutoReply: (enabled) =>
        api.post("/ai/auto-reply", { enabled }),
    chat: (message, instanceName, remoteJid, systemPrompt) =>
        api.post("/ai/chat", { message, instanceName, remoteJid, systemPrompt }),
    clearConversation: (instanceName, remoteJid) =>
        api.post("/ai/clear", { instanceName, remoteJid }),
    test: (payload) =>
        api.post("/ai/test", payload),
    getConfig: () =>
        api.get("/ai/config"),
    saveConfig: (config) =>
        api.put("/ai/config", config),
    resetConfig: () =>
        api.post("/ai/config/reset"),
};

// ---------- AGENDA / CALENDAR ----------
export const agendaApi = {
    list: (params) => {
        const query = params ? "?" + new URLSearchParams(params).toString() : "";
        return api.get(`/agenda/events${query}`);
    },
    get: (eventId) =>
        api.get(`/agenda/events/${eventId}`),
    create: (data) =>
        api.post(`/agenda/events`, data),
    update: (eventId, data) =>
        api.patch(`/agenda/events/${eventId}`, data),
    delete: (eventId) =>
        api.delete(`/agenda/events/${eventId}`),
    stats: () =>
        api.get(`/agenda/events/stats`),
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
        es.addEventListener("agenda.created", (e) => {
            try { onMessage("agenda.created", JSON.parse(e.data)); } catch {}
        });
        es.onerror = () => {};
        return es;
    },
    getMessages: (instanceName, remoteJid, limit = 100) =>
        api.get(`/chat/messages/${instanceName}/${remoteJid}?limit=${limit}`),
    getContacts: (instanceName) =>
        api.get(`/chat/contacts/${instanceName}`),
    createContact: (instanceName, { phone, customName, pushName }) =>
        api.post(`/chat/contacts/${instanceName}`, { phone, customName, pushName }),
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

// ---------- DRIVE / MEDIA (Zelt Drive) ----------

export const driveApi = {
    listFolders: () =>
        api.get("/drive/folders"),
    createFolder: (data) =>
        api.post("/drive/folders", data),
    renameFolder: (folderId, name) =>
        api.patch(`/drive/folders/${folderId}`, { name }),
    deleteFolder: (folderId) =>
        api.delete(`/drive/folders/${folderId}`),
    listAssets: (params) => {
        const query = params ? "?" + new URLSearchParams(params).toString() : "";
        return api.get(`/drive/assets${query}`);
    },
    getAsset: (assetId) =>
        api.get(`/drive/assets/${assetId}`),
    upload: (file, folderId) => {
        const form = new FormData();
        form.append("file", file);
        if (folderId) form.append("folderId", folderId);
        return api.upload("/drive/assets/upload", form);
    },
    renameAsset: (assetId, name) =>
        api.patch(`/drive/assets/${assetId}`, { name }),
    deleteAsset: (assetId) =>
        api.delete(`/drive/assets/${assetId}`),
    downloadUrl: (assetId) => {
        const token = getToken();
        return `${API_URL}/drive/assets/${assetId}/download?token=${token}`;
    },
    stats: () =>
        api.get("/drive/stats"),
};

// ---------- SHEETS (Zelt Sheets) ----------

export const sheetsApi = {
    stats: () =>
        api.get("/sheets/stats"),
    listWorkbooks: () =>
        api.get("/sheets/workbooks"),
    getWorkbook: (workbookId) =>
        api.get(`/sheets/workbooks/${workbookId}`),
    createWorkbook: (data) =>
        api.post("/sheets/workbooks", data),
    updateWorkbook: (workbookId, data) =>
        api.patch(`/sheets/workbooks/${workbookId}`, data),
    deleteWorkbook: (workbookId) =>
        api.delete(`/sheets/workbooks/${workbookId}`),
    createSheet: (workbookId, data) =>
        api.post(`/sheets/workbooks/${workbookId}/sheets`, data),
    getSheet: (sheetId) =>
        api.get(`/sheets/sheets/${sheetId}`),
    updateSheet: (sheetId, data) =>
        api.patch(`/sheets/sheets/${sheetId}`, data),
    deleteSheet: (sheetId) =>
        api.delete(`/sheets/sheets/${sheetId}`),
    saveCells: (sheetId, cells) =>
        api.put(`/sheets/sheets/${sheetId}/cells`, { cells }),
    exportUrl: (workbookId) => {
        const token = getToken();
        return `${API_URL}/sheets/workbooks/${workbookId}/export?token=${token}`;
    },
};

// ---------- DASHBOARD ----------

export const dashboardApi = {
    stats: () =>
        api.get("/dashboard/stats"),
};
