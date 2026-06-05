import api from "./api";

export const getBilling = () => api.get("/billing").then((r) => r.data);
export const getPlans = () => api.get("/billing/plans").then((r) => r.data);
export const cancelBilling = () => api.post("/billing/cancel").then((r) => r.data);
export const createCheckout = (plan) => api.post(`/checkout?plan=${plan}`).then((r) => r.data);
