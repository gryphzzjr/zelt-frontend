import api from "./api";

export const listDocuments = () => api.get("/knowledge").then((r) => r.data);

export const uploadDocument = (file) => {
  const fd = new FormData();
  fd.append("file", file);
  return api.post("/knowledge/upload", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);
};

export const deleteDocument = (id) => api.delete(`/knowledge/${id}`).then((r) => r.data);

export const addUrl = (url) => api.post("/knowledge/url", { url }).then((r) => r.data);

export const listUrls = () => api.get("/knowledge/urls").then((r) => r.data);
