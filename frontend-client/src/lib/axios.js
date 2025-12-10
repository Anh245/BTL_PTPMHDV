import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8888/api",
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
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

// Handle token refresh and 401/403 errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    
    // Các API có thể bỏ qua refresh logic
    if(originalRequest.url.includes("/auth/signup") ||
      originalRequest.url.includes("/auth/signin") ||
      originalRequest.url.includes("/auth/refresh")
    ){
      // Nếu refresh token fail, clear state và redirect
      if(originalRequest.url.includes("/auth/refresh") && (status === 401 || status === 403)){
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        if (!window.location.pathname.includes('/login') &&
            !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }

    // Xử lý 401/403 - token hết hạn hoặc không hợp lệ
    if((status === 401 || status === 403) && !originalRequest._retry){
      // Nếu đang refresh, đợi kết quả
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }
          return Promise.reject(new Error('No token after refresh'));
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Thử refresh token
        const res = await api.get("/auth/refresh", {withCredentials: true});
        const newToken = res.data.accessToken || res.data.token;
        
        if (newToken) {
          localStorage.setItem('token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return api(originalRequest);
        } else {
          throw new Error('No token in refresh response');
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        processQueue(refreshError, null);
        
        // Token is invalid or expired
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');

        // Only redirect to login if not already on login/register page
        if (!window.location.pathname.includes('/login') &&
            !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
