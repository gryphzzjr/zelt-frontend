import api from "./api";

export const listQuickAnswers = () => api.get("/quick-answers").then((r) => r.data);

export const createQuickAnswer = (data) => api.post("/quick-answers", data).then((r) => r.data);

export const updateQuickAnswer = (id, data) => api.put(`/quick-answers/${id}`, data).then((r) => r.data);

export const deleteQuickAnswer = (id) => api.delete(`/quick-answers/${id}`).then((r) => r.data);
