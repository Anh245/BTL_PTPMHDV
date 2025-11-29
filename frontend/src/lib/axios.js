import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore.js";

const api = axios.create({
  baseURL: import.meta.env.MODE ==="development" ? "http://localhost:8888/api":"/api",
  withCredentials: true,
});

//gan access token vao header neu co
api.interceptors.request.use((config) => {
  const {accessToken} = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});
// Biến để tránh gọi refresh nhiều lần đồng thời
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use((res) => res, async (error) => {
  const originalRequest = error.config;
  
  //cac api co the bo qua
  if(originalRequest.url.includes("/auth/signup")||
    originalRequest.url.includes("/auth/signin")||
    originalRequest.url.includes("/auth/refresh")
  ){
    // Nếu refresh token fail, clear state và redirect
    if(originalRequest.url.includes("/auth/refresh") && error.response?.status === 403){
      useAuthStore.getState().clearState();
      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }

  // Chỉ retry 1 lần cho mỗi request
  if(error.response?.status === 403 && !originalRequest._retry){
    if (isRefreshing) {
      // Nếu đang refresh, đợi kết quả
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      }).catch(err => {
        return Promise.reject(err);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const res = await api.get("/auth/refresh",{withCredentials: true});
      const newAccessToken = res.data.accessToken;
      useAuthStore.getState().setAccessToken(newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      processQueue(null, newAccessToken);
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      useAuthStore.getState().clearState();
      // Redirect về trang login
      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }

  return Promise.reject(error);
});

export default api;