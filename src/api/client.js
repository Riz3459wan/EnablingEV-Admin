import axios from "axios";
import Cookies from "js-cookie";
import { ROLE_LOGIN } from "../auth/roleConfig";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? "/api" : "http://localhost:5001/api");

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AUTH_ENDPOINTS = [
  "/admin/login",
  "/CreateProfile/login",
  "/dealer/login",
  "/dealer/activate",
];

const isAuthEndpoint = (url) => {
  const path = String(url || "")
    .split("?")[0]
    .replace(/\/+$/, "");
  return AUTH_ENDPOINTS.some((endpoint) => path.endsWith(endpoint));
};

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && !isAuthEndpoint(error.config?.url)) {
      const role = localStorage.getItem("authRole");
      const hadSession = !!(Cookies.get("authToken") || role);

      if (hadSession) {
        Cookies.remove("authToken");
        localStorage.removeItem("authRole");
        localStorage.removeItem("dealerInfo");
        localStorage.removeItem("CreateProfile");

        const loginPath = ROLE_LOGIN[role] || "/";
        if (window.location.pathname !== loginPath) {
          window.location.assign(loginPath);
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
