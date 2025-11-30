// Service để quản lý stations (ga tàu)
// Kết nối với stations-service qua API Gateway
import api from "../lib/axios";

export const stationAPI = {
  // Lấy danh sách tất cả stations
  // Params: { page, size, search, city }
  // Output: Array of stations
  getStations: async (params = {}) => {
    const res = await api.get('/stations', { params });
    return res.data;
  },
  
  // Lấy thông tin 1 station theo ID
  // Input: station ID
  // Output: Station object
  getStation: async (id) => {
    const res = await api.get(`/stations/${id}`);
    return res.data;
  },

  // Lấy station theo code (ví dụ: HN, SG)
  // Input: station code
  // Output: Station object
  getStationByCode: async (code) => {
    const res = await api.get(`/stations/code/${code}`);
    return res.data;
  },

  // Lấy stations theo city
  // Input: city name
  // Output: Array of stations
  getStationsByCity: async (city) => {
    const res = await api.get(`/stations/city/${city}`);
    return res.data;
  },

  // Lấy chỉ stations đang active
  // Output: Array of active stations
  getActiveStations: async () => {
    const res = await api.get('/stations');
    // Filter chỉ lấy stations có isActive = true
    return res.data.filter(station => station.isActive === true);
  }
};
