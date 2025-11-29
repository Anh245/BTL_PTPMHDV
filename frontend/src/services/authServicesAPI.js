import api from "@/lib/axios";

export const authService  = {
  signUp: async (firstname, lastname,username, email,password) => {
    const res= await api.post("/auth/signup", { firstname, lastname,username, email,password },{withCredentials:true});
    return res.data;
  },

  signIn: async (username, password) => {
    const res = await api.post("/auth/signin", { username, password },{withCredentials:true});
    return res.data;


  },


  signOut: async ()=>{
    const res = await api.post("/auth/signout",{},{withCredentials:true});
    return res.data;
  
  },
  fetchMe: async () => {
    const res = await api.get("/auth/me", { withCredentials: true });
    return res.data;
  },
  refresh : async () => {
    const res = await api.get("/auth/refresh", { withCredentials: true });
    return res.data.accessToken;
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

export const ticketAPI = {
  getTickets: (params) => api.get('/tickets', { params }),
  getTicket: (id) => api.get(`/tickets/${id}`),
  createTicket: (data) => api.post('/tickets', data),
  updateTicket: (id, data) => api.put(`/tickets/${id}`, data),
  deleteTicket: (id) => api.delete(`/tickets/${id}`),
};

export default api;
