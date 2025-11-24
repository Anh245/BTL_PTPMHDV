import api from "@/lib/axios";

export const authAPI = {
  login: async (credentials) => {
    const res = await api.post("/auth/login", credentials, { withCredentials: true });
    return res.data;
  },
  
  register: async (userData) => {
    const res = await api.post("/auth/register", userData, { withCredentials: true });
    return res.data;
  },
  
  verifyToken: async (token) => {
    const res = await api.get("/auth/verify", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  },
  
  getUsers: async () => {
    const res = await api.get("/auth/users");
    return res.data;
  }
};

export const stationAPI = {
  getStations: (params) => api.get('/stations', { params }),
  getStation: (id) => api.get(`/stations/${id}`),
  getStationByCode: (code) => api.get(`/stations/code/${code}`),
  createStation: (data) => api.post('/stations', data),
  updateStation: (id, data) => api.put(`/stations/${id}`, data),
  deleteStation: (id) => api.delete(`/stations/${id}`),
  toggleStation: (id) => api.patch(`/stations/${id}/toggle`),
  getStationsByCity: (city) => api.get(`/stations/city/${city}`),
};

export const trainAPI = {
  getTrains: (params) => api.get('/trains', { params }),
  getTrain: (id) => api.get(`/trains/${id}`),
  getTrainByNumber: (number) => api.get(`/trains/number/${number}`),
  createTrain: (data) => api.post('/trains', data),
  updateTrain: (id, data) => api.put(`/trains/${id}`, data),
  deleteTrain: (id) => api.delete(`/trains/${id}`),
  updateTrainStatus: (id, data) => api.patch(`/trains/${id}/status`, data),
  getTrainsByType: (type) => api.get(`/trains/type/${type}`),
  getTrainsNeedingMaintenance: () => api.get('/trains/maintenance/due'),
};

export const scheduleAPI = {
  getSchedules: (params) => api.get('/schedules', { params }),
  getSchedule: (id) => api.get(`/schedules/${id}`),
  searchSchedules: (params) => api.get('/schedules/search/route', { params }),
  createSchedule: (data) => api.post('/schedules', data),
  updateSchedule: (id, data) => api.put(`/schedules/${id}`, data),
  updateScheduleStatus: (id, data) => api.patch(`/schedules/${id}/status`, data),
  reserveSeats: (id, data) => api.patch(`/schedules/${id}/reserve`, data),
  getSchedulesByTrain: (trainNumber) => api.get(`/schedules/train/${trainNumber}`),
  getTodaySchedules: () => api.get('/schedules/today'),
};

export default api;
