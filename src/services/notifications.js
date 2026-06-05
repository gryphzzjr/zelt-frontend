import api from "./api";

export const getPreferences = () => api.get("/notifications/preferences").then((r) => r.data);

export const savePreferences = (data) => api.put("/notifications/preferences", data).then((r) => r.data);
