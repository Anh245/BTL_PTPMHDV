import api from "@/lib/axios";

export const scheduleAPI  = {
  getSchedules: (params) => api.get('/schedules', { params }),
  getSchedule: (id) => api.get(`/schedules/${id}`),
  searchSchedules: (params) => api.get('/schedules/search/route', { params }),
  createSchedule: (data) => api.post('/schedules/create', data),
  updateSchedule: (id, data) => api.put(`/schedules/${id}`, data),
  updateScheduleStatus: (id, data) => api.patch(`/schedules/${id}/status`, data),
  reserveSeats: (id, data) => api.patch(`/schedules/${id}/reserve`, data),
  getSchedulesByTrain: (trainNumber) => api.get(`/schedules/train/${trainNumber}`),
  deleteSchedule: (id) => api.delete(`/schedules/${id}`),
};
