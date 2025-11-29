import api from "@/lib/axios";


export const trainAPI = {
  getTrains: (params) => api.get('/trains', { params }),
  getTrainById: (id) => api.get(`/trains/${id}`),
  createTrain: (data) => api.post('/trains/create', data),
  updateTrain: (id, data) => api.put(`/trains/${id}`, data),
  deleteTrain: (id) => api.delete(`/trains/${id}`),
  updateTrainStatus: (id, status) => api.put(`/trains/${id}/status`, status),
};
