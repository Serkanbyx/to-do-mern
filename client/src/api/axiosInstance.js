import axios from "axios";
import { AUTH_LOGOUT_EVENT } from "../utils/token";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

/* ── Request Interceptor ── */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/* ── Response Interceptor ── */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only treat 401 as a session expiry for authenticated requests.
    // A 401 on login/register is an "invalid credentials" response and
    // must be left for the page to handle, not trigger a logout.
    if (error.response?.status === 401 && localStorage.getItem("token")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
