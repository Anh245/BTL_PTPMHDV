import api from "@/lib/axios";

export const stationAPI = {
  getStations: (params) => api.get('/stations', { params }),
  getStation: (id) => api.get(`/stations/${id}`),
  createStation: (data) => api.post('/stations', data),
  updateStation: (id, data) => api.put(`/stations/${id}`, data),
  deleteStation: (id) => api.delete(`/stations/${id}`),
  toggleStation: (id) => api.patch(`/stations/${id}/toggle`),
};