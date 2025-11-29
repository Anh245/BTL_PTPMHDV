import { create } from 'zustand';
import { ticketAPI } from '@/services/ticketServiceAPI';

export const useTicketStore = create((set, get) => ({
  tickets: [],
  loading: false,
  error: null,

  // Fetch all tickets
  fetchTickets: async () => {
    try {
      set({ loading: true, error: null });
      const response = await ticketAPI.getTickets();
      set({ 
        tickets: response.data || [],
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.message, 
        loading: false 
      });
      console.error('Error fetching tickets:', error);
    }
  },

  // Get ticket by ID
  getTicketById: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await ticketAPI.getTicketById(id);
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error fetching ticket:', error);
      throw error;
    }
  },

  // Create ticket
  createTicket: async (data) => {
    try {
      set({ loading: true, error: null });
      
      // Ensure price is a valid number
      const ticketData = {
        ...data,
        price: Number(data.price)
      };
      
      console.log('Creating ticket with data:', ticketData); // Debug log
      console.log('Price type:', typeof ticketData.price, 'Value:', ticketData.price); // Debug log
      
      const response = await ticketAPI.createTicket(ticketData);
      console.log('Create ticket response:', response); // Debug log
      await get().fetchTickets(); // Refresh list
      set({ loading: false });
    } catch (error) {
      console.error('Error creating ticket:', error);
      console.error('Error response:', error.response?.data); // Debug log
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Update ticket
  updateTicket: async (id, data) => {
    try {
      set({ loading: true, error: null });
      await ticketAPI.updateTicket(id, data);
      await get().fetchTickets(); // Refresh list
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error updating ticket:', error);
      throw error;
    }
  },

  // Delete ticket
  deleteTicket: async (id) => {
    try {
      set({ loading: true, error: null });
      await ticketAPI.deleteTicket(id);
      await get().fetchTickets(); // Refresh list
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error deleting ticket:', error);
      throw error;
    }
  },

  // Purchase tickets
  purchaseTickets: async (id, quantity = 1) => {
    try {
      set({ loading: true, error: null });
      console.log(`Purchasing ${quantity} ticket(s) for ticket ID: ${id}`);
      const response = await ticketAPI.purchaseTickets(id, quantity);
      console.log('Purchase response:', response);
      
      // Update the ticket in the list
      const tickets = get().tickets;
      const updatedTickets = tickets.map(ticket => 
        ticket.id === id ? response.data : ticket
      );
      set({ tickets: updatedTickets, loading: false });
      
      return response.data;
    } catch (error) {
      console.error('Error purchasing tickets:', error);
      console.error('Error response:', error.response?.data);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set({ tickets: [], loading: false, error: null })
}));
