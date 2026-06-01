import axios from "axios";
import { getAccessToken, setAccessToken } from "../utils/tokenStore";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

// --- Request Interceptor ---
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken"); // or from context
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Token Refresh Logic ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

const refreshToken = async () => {
  const { data } = await api.post("auth/refresh", {}, { withCredentials: true });
  setAccessToken(data.accessToken);
  api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
  return data.accessToken;
};

// --- Response Interceptor ---
api.interceptors.response.use(
  (response) => response,
  async (error) => {

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api.request(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api.request(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;