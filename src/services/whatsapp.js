import api from "./api";

export const getWhatsAppStatus = () => api.get("/whatsapp/status").then((r) => r.data);

export const verifyWhatsApp = (phone) => api.post("/whatsapp/verify", { phone }).then((r) => r.data);

export const connectWhatsApp = (clientName, phoneNumber) =>
  api.post(`/whatsapp/conectar/${clientName}`, { phone_number: phoneNumber || null }).then((r) => r.data);

export const disconnectWhatsApp = () => api.post("/whatsapp/disconnect").then((r) => r.data);

export const getWhatsAppProfile = () => api.get("/whatsapp/profile").then((r) => r.data);
