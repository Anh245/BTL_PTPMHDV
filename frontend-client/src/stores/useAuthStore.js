import { create } from 'zustand';
import { authAPI } from '../services/authService';
import { toast } from 'sonner';

const useAuthStore = create((set, get) => ({
  // State
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false,

  // Initialize function to restore state from localStorage
  initialize: () => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('currentUser');
      
      if (storedToken && storedUser) {
        const userData = JSON.parse(storedUser);
        set({
          token: storedToken,
          user: userData,
          isAuthenticated: true,
          error: null,
          isInitialized: true
        });
        
        // Verify token in background - không block UI
        authAPI.verifyToken(storedToken)
          .then((res) => {
            const verifiedUser = res.user || res;
            const userData = {
              id: verifiedUser.id,
              username: verifiedUser.username,
              email: verifiedUser.email,
              fullName: `${verifiedUser.firstname || ''} ${verifiedUser.lastname || ''}`.trim(),
              firstname: verifiedUser.firstname,
              lastname: verifiedUser.lastname,
              role: verifiedUser.role
            };
            set({ user: userData });
            localStorage.setItem('currentUser', JSON.stringify(userData));
          })
          .catch((error) => {
            console.error("Token verification failed:", error);
            // Token invalid, clear everything
            get().logout();
          });
      } else {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
          isInitialized: true
        });
      }
    } catch (err) {
      console.error("Initialize failed:", err);
      // Invalid data in localStorage, clear it
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
        isInitialized: true
      });
    }
  },

  // Login action
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authAPI.login(credentials);
      const accessToken = res.accessToken;
      
      // Save token first
      localStorage.setItem('token', accessToken);
      
      // Then fetch user info using /me endpoint
      const userInfo = await authAPI.getCurrentUser();
      
      const userData = {
        id: userInfo.id,
        username: userInfo.username,
        email: userInfo.email,
        fullName: `${userInfo.firstname || ''} ${userInfo.lastname || ''}`.trim(),
        firstname: userInfo.firstname,
        lastname: userInfo.lastname,
        role: userInfo.role
      };
      
      // Update state and localStorage
      set({
        token: accessToken,
        user: userData,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      toast.success('Đăng nhập thành công!');
      return res;
    } catch (err) {
      const errorMsg = typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.message || err.response?.data?.error || 'Đăng nhập thất bại';
      
      set({
        isLoading: false,
        error: errorMsg
      });
      
      toast.error(errorMsg);
      throw err;
    }
  },

  // Register action
  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authAPI.register(data);
      const userData = {
        id: res.id,
        username: res.username,
        email: res.email,
        fullName: `${res.firstname || ''} ${res.lastname || ''}`.trim(),
        firstname: res.firstname,
        lastname: res.lastname,
        role: res.role
      };
      
      // Update state and localStorage
      set({
        token: res.accessToken,
        user: userData,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      localStorage.setItem('token', res.accessToken);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      toast.success('Đăng ký thành công!');
      return res;
    } catch (err) {
      const errorMsg = typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.message || err.response?.data?.error || 'Đăng ký thất bại';
      
      set({
        isLoading: false,
        error: errorMsg
      });
      
      toast.error(errorMsg);
      throw err;
    }
  },

  // Logout action
  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
    
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  },

  // Helper to set user
  setUser: (user) => {
    set({ 
      user,
      isAuthenticated: !!user
    });
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  },

  // Helper to set token
  setToken: (token) => {
    set({ token });
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  }
}));

export default useAuthStore;
