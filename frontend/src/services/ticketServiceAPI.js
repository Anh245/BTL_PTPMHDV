import api from "@/lib/axios";

export const ticketAPI = {
  // Get all tickets
  getTickets: () => api.get('/tickets'),
  
  // Get ticket by ID
  getTicketById: (id) => api.get(`/tickets/${id}`),
  
  // Create new ticket
  createTicket: (data) => api.post('/tickets/create', data),
  
  // Update ticket
  updateTicket: (id, data) => api.patch(`/tickets/${id}`, data),
  
  // Delete ticket
  deleteTicket: (id) => api.delete(`/tickets/${id}`),
  
  // Purchase tickets
  purchaseTickets: (id, quantity = 1) => api.post(`/tickets/${id}/purchase?quantity=${quantity}`),
};
