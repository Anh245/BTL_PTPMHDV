// Service để quản lý tickets (vé tàu)
// Kết nối với tickets-service qua API Gateway
import api from "../lib/axios";

export const ticketAPI = {
  // Lấy danh sách tất cả tickets
  // Params: { page, size, status, passengerName }
  // Output: Array of tickets
  getTickets: async (params = {}) => {
    const res = await api.get('/tickets', { params });
    return res.data;
  },
  
  // Lấy thông tin 1 ticket theo ID
  // Input: ticket ID
  // Output: Ticket object
  getTicket: async (id) => {
    const res = await api.get(`/tickets/${id}`);
    return res.data;
  },

  // Tạo ticket mới (đặt vé)
  // Input: { scheduleId, passengerName, passengerEmail, passengerPhone, passengerIdNumber, seatNumber, price }
  // Output: Created ticket object
  createTicket: async (ticketData) => {
    const res = await api.post('/tickets', ticketData);
    return res.data;
  },

  // Tạo nhiều tickets cùng lúc (cho multiple passengers)
  // Input: Array of ticket data
  // Output: Array of created tickets
  createMultipleTickets: async (ticketsData) => {
    const promises = ticketsData.map(ticketData => 
      api.post('/tickets', ticketData)
    );
    const responses = await Promise.all(promises);
    return responses.map(res => res.data);
  },

  // Cập nhật ticket
  // Input: ticket ID, updated data
  // Output: Updated ticket object
  updateTicket: async (id, data) => {
    const res = await api.put(`/tickets/${id}`, data);
    return res.data;
  },

  // Hủy ticket
  // Input: ticket ID
  // Output: Success message
  deleteTicket: async (id) => {
    const res = await api.delete(`/tickets/${id}`);
    return res.data;
  },

  // Lấy tickets của user hiện tại
  // Params: { userId }
  // Output: Array of user's tickets
  getMyTickets: async (userId) => {
    const res = await api.get('/tickets', { 
      params: { userId } 
    });
    return res.data;
  }
};
