// Service để quản lý trains (tàu)
// Kết nối với trains-service qua API Gateway
import api from "../lib/axios";

export const trainAPI = {
  // Lấy danh sách tất cả trains
  // Params: { page, size, search, type, status }
  // Output: Array of trains
  getTrains: async (params = {}) => {
    const res = await api.get('/trains', { params });
    return res.data;
  },
  
  // Lấy thông tin 1 train theo ID
  // Input: train ID
  // Output: Train object
  getTrain: async (id) => {
    const res = await api.get(`/trains/${id}`);
    return res.data;
  },

  // Lấy train theo số hiệu (train number)
  // Input: train number (ví dụ: SE1, SE2)
  // Output: Train object
  getTrainByNumber: async (number) => {
    const res = await api.get(`/trains/number/${number}`);
    return res.data;
  },

  // Lấy trains theo loại (type)
  // Input: type (EXPRESS, REGULAR, HIGH_SPEED)
  // Output: Array of trains
  getTrainsByType: async (type) => {
    const res = await api.get(`/trains/type/${type}`);
    return res.data;
  },

  // Lấy chỉ trains đang active
  // Output: Array of active trains
  getActiveTrains: async () => {
    const res = await api.get('/trains');
    // Filter chỉ lấy trains có status active (lowercase)
    return res.data.filter(train => train.status === 'active');
  }
};
