import { create } from 'zustand';
import { scheduleAPI } from '@/services/scheduleServiceAPI';

export const useScheduleStore = create((set, get) => ({
  schedules: [],
  loading: false,
  error: null,
  filters: {},

  // Fetch schedules
  fetchSchedules: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await scheduleAPI.getSchedules(params);
      set({ 
        schedules: response.data.schedules || response.data,
        filters: params,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.message, 
        loading: false 
      });
      console.error('Error fetching schedules:', error);
    }
  },

  // Get schedule by ID
  getScheduleById: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await scheduleAPI.getSchedule(id);
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error fetching schedule:', error);
      throw error;
    }
  },

  // Search schedules by route
  searchSchedules: async (params) => {
    try {
      set({ loading: true, error: null });
      const response = await scheduleAPI.searchSchedules(params);
      set({ 
        schedules: response.data,
        loading: false 
      });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error searching schedules:', error);
      throw error;
    }
  },

  // Get schedules by train
  getSchedulesByTrain: async (trainNumber) => {
    try {
      set({ loading: true, error: null });
      const response = await scheduleAPI.getSchedulesByTrain(trainNumber);
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error fetching schedules:', error);
      throw error;
    }
  },

  // Get today's schedules
  getTodaySchedules: async () => {
    try {
      set({ loading: true, error: null });
      const response = await scheduleAPI.getTodaySchedules();
      set({ 
        schedules: response.data,
        loading: false 
      });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error fetching today schedules:', error);
      throw error;
    }
  },

  // Create schedule
  createSchedule: async (data) => {
    try {
      set({ loading: true, error: null });
      await scheduleAPI.createSchedule(data);
      await get().fetchSchedules(get().filters);
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error creating schedule:', error);
      throw error;
    }
  },

  // Update schedule
  updateSchedule: async (id, data) => {
    try {
      set({ loading: true, error: null });
      await scheduleAPI.updateSchedule(id, data);
      await get().fetchSchedules(get().filters);
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error updating schedule:', error);
      throw error;
    }
  },

  // Delete schedule
  deleteSchedule: async (id) => {
    try {
      set({ loading: true, error: null });
      await scheduleAPI.deleteSchedule(id);
      await get().fetchSchedules(get().filters);
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error deleting schedule:', error);
      throw error;
    }
  },

  // Update schedule status
  updateScheduleStatus: async (id, status) => {
    try {
      set({ loading: true, error: null });
      await scheduleAPI.updateScheduleStatus(id, { status });
      await get().fetchSchedules(get().filters);
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error updating schedule status:', error);
      throw error;
    }
  },

  // Reserve seats
  reserveSeats: async (id, seats) => {
    try {
      set({ loading: true, error: null });
      await scheduleAPI.reserveSeats(id, { seats });
      await get().fetchSchedules(get().filters);
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error reserving seats:', error);
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set({ schedules: [], loading: false, error: null, filters: {} })
}));
