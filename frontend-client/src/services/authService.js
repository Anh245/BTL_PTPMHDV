// Service để xử lý authentication với auth-service backend
// Kết nối với API Gateway tại localhost:8888
import api from "../lib/axios";

export const authAPI = {
  // Đăng ký user mới
  // Input: { firstname, lastname, username, email, password }
  // Output: { token, user }
  register: async (userData) => {
    const res = await api.post("/auth/signup", {
      firstname: userData.firstname,
      lastname: userData.lastname,
      username: userData.username,
      email: userData.email,
      password: userData.password
    }, { withCredentials: true });
    return res.data;
  },
  // Update user profile
  updateProfile: async (userData) => {
    const res = await api.patch("/auth/me", {
      firstname: userData.firstname,
      lastname: userData.lastname,
      email: userData.email
    }, { withCredentials: true });
    return res.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const res = await api.post("/auth/change-password", {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    }, { withCredentials: true });
    return res.data;
  },
  // Đăng nhập user
  // Input: { username, password }
  // Output: { token, user }
  login: async (credentials) => {
    const res = await api.post("/auth/signin", {
      username: credentials.username,
      password: credentials.password
    }, { withCredentials: true });
    return res.data;
  },
  
  // Xác thực token
  // Input: token string
  // Output: { valid: boolean, user }
  verifyToken: async (token) => {
    const res = await api.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  },
  
  // Lấy thông tin user hiện tại
  // Output: { user }
  getCurrentUser: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },

  // Đăng xuất
  // Output: success message
  logout: async () => {
    const res = await api.post("/auth/signout", {}, { withCredentials: true });
    return res.data;
  }
};
