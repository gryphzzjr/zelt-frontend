import api from "./api";

export const getMe = () => api.get("/auth/me").then((r) => r.data);

export const updateMe = (data) => api.put("/auth/me", data).then((r) => r.data);
