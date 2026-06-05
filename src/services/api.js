import axios from "axios";

const api = axios.create({ baseURL: "http://127.0.0.1:8000" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("zelt_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem("zelt_token");
      localStorage.removeItem("zelt_user");
      window.location.href = err.response?.status === 403 ? "/precos" : "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
