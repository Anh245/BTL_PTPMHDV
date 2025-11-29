import { create } from 'zustand';
import { trainAPI } from '@/services/trainServiceAPI';

export const useTrainStore = create((set, get) => ({
  trains: [],
  loading: false,
  error: null,
  filters: {},

  // Fetch trains
  fetchTrains: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await trainAPI.getTrains(params);
      set({ 
        trains: response.data.trains || response.data,
        filters: params,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.message, 
        loading: false 
      });
      console.error('Error fetching trains:', error);
    }
  },

  // Get train by ID
  getTrainById: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await trainAPI.getTrainById(id);
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error fetching train:', error);
      throw error;
    }
  },

  // Create train
  createTrain: async (data) => {
    try {
      set({ loading: true, error: null });
      await trainAPI.createTrain(data);
      await get().fetchTrains(get().filters);
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error creating train:', error);
      throw error;
    }
  },

  // Update train
  updateTrain: async (id, data) => {
    try {
      set({ loading: true, error: null });
      await trainAPI.updateTrain(id, data);
      await get().fetchTrains(get().filters);
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error updating train:', error);
      throw error;
    }
  },

  // Delete train
  deleteTrain: async (id) => {
    try {
      set({ loading: true, error: null });
      await trainAPI.deleteTrain(id);
      await get().fetchTrains(get().filters);
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error deleting train:', error);
      throw error;
    }
  },

  // Update train status
  updateTrainStatus: async (id, status) => {
    try {
      set({ loading: true, error: null });
      await trainAPI.updateTrainStatus(id, { status });
      await get().fetchTrains(get().filters);
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error updating train status:', error);
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set({ trains: [], loading: false, error: null, filters: {} })
}));
