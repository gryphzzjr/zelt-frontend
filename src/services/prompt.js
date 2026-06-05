import api from "./api";

export const getPrompt = () => api.get("/prompt").then((r) => r.data);

export const savePrompt = (content) => api.put("/prompt", { content }).then((r) => r.data);
