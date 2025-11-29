import { create } from 'zustand';
import { stationAPI } from '@/services/stationServiceAPI';

export const useStationStore = create((set, get) => ({
  stations: [],
  loading: false,
  error: null,
  filters: {},

  // Fetch stations
  fetchStations: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await stationAPI.getStations(params);
      set({ 
        stations: response.data.stations || response.data,
        filters: params,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.message, 
        loading: false 
      });
      console.error('Error fetching stations:', error);
    }
  },

  // Get station by ID
  getStationById: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await stationAPI.getStation(id);
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error fetching station:', error);
      throw error;
    }
  },

  // Get station by code
  getStationByCode: async (code) => {
    try {
      set({ loading: true, error: null });
      const response = await stationAPI.getStationByCode(code);
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error fetching station:', error);
      throw error;
    }
  },

  // Get stations by city
  getStationsByCity: async (city) => {
    try {
      set({ loading: true, error: null });
      const response = await stationAPI.getStationsByCity(city);
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error fetching stations:', error);
      throw error;
    }
  },

  // Create station
  createStation: async (data) => {
    try {
      set({ loading: true, error: null });
      await stationAPI.createStation(data);
      await get().fetchStations(get().filters);
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error creating station:', error);
      throw error;
    }
  },

  // Update station
  updateStation: async (id, data) => {
    try {
      set({ loading: true, error: null });
      await stationAPI.updateStation(id, data);
      await get().fetchStations(get().filters);
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error updating station:', error);
      throw error;
    }
  },

  // Delete station
  deleteStation: async (id) => {
    try {
      set({ loading: true, error: null });
      await stationAPI.deleteStation(id);
      await get().fetchStations(get().filters);
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error deleting station:', error);
      throw error;
    }
  },

  // Toggle station status
  toggleStation: async (id) => {
    try {
      set({ loading: true, error: null });
      await stationAPI.toggleStation(id);
      await get().fetchStations(get().filters);
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error toggling station:', error);
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set({ stations: [], loading: false, error: null, filters: {} })
}));
