import { create } from 'zustand';
import { stationAPI } from '@/services/stationServiceAPI';
import { trainAPI } from '@/services/trainServiceAPI';
import { scheduleAPI } from '@/services/scheduleServiceAPI';
import { ticketAPI } from '@/services/ticketServiceAPI';

export const useDashboardStore = create((set) => ({
  stats: {
    totalStations: 0,
    totalTrains: 0,
    totalTickets: 0,
    todaySchedules: 0,
    maintenanceTrains: 0
  },
  allStations: [],
  allTrains: [],
  allTickets: [],
  allSchedules: [],
  todaySchedules: [],
  loading: false,
  error: null,

  // Fetch all dashboard data
  fetchDashboardData: async () => {
    try {
      set({ loading: true, error: null });

      // Fetch all data in parallel
      const [stationsRes, trainsRes, ticketsRes, schedulesRes] = await Promise.all([
        stationAPI.getStations(),
        trainAPI.getTrains(),
        ticketAPI.getTickets(),
        scheduleAPI.getSchedules()
      ]);

      // Extract data - backend returns arrays directly
      const stationsData = Array.isArray(stationsRes.data) ? stationsRes.data : [];
      const trainsData = Array.isArray(trainsRes.data) ? trainsRes.data : [];
      const ticketsData = Array.isArray(ticketsRes.data) ? ticketsRes.data : [];
      const schedulesData = Array.isArray(schedulesRes.data) ? schedulesRes.data : [];
      
      // Filter today's schedules on frontend
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      
      const todaySchedulesData = schedulesData.filter(schedule => {
        const scheduleDate = new Date(schedule.departureTime);
        return scheduleDate >= todayStart && scheduleDate <= todayEnd;
      });
      
      // Filter maintenance trains
      const maintenanceData = trainsData.filter(train => train.status === 'maintenance');

      // Update state
      set({
        stats: {
          totalStations: stationsData.length,
          totalTrains: trainsData.length,
          totalTickets: ticketsData.length,
          todaySchedules: todaySchedulesData.length,
          maintenanceTrains: maintenanceData.length
        },
        allStations: stationsData,
        allTrains: trainsData,
        allTickets: ticketsData,
        allSchedules: schedulesData,
        todaySchedules: todaySchedulesData,
        loading: false
      });
    } catch (error) {
      set({ 
        error: error.message, 
        loading: false 
      });
      console.error('Error fetching dashboard data:', error);
    }
  },

  // Fetch specific stats
  fetchStats: async () => {
    try {
      const [stationsRes, trainsRes, ticketsRes, schedulesRes] = await Promise.all([
        stationAPI.getStations(),
        trainAPI.getTrains(),
        ticketAPI.getTickets(),
        scheduleAPI.getSchedules()
      ]);

      const stationsData = Array.isArray(stationsRes.data) ? stationsRes.data : [];
      const trainsData = Array.isArray(trainsRes.data) ? trainsRes.data : [];
      const ticketsData = Array.isArray(ticketsRes.data) ? ticketsRes.data : [];
      const schedulesData = Array.isArray(schedulesRes.data) ? schedulesRes.data : [];
      
      // Filter today's schedules on frontend
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      
      const todaySchedulesData = schedulesData.filter(schedule => {
        const scheduleDate = new Date(schedule.departureTime);
        return scheduleDate >= todayStart && scheduleDate <= todayEnd;
      });
      
      const maintenanceData = trainsData.filter(train => train.status === 'maintenance');

      set({
        stats: {
          totalStations: stationsData.length,
          totalTrains: trainsData.length,
          totalTickets: ticketsData.length,
          todaySchedules: todaySchedulesData.length,
          maintenanceTrains: maintenanceData.length
        }
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  },

  // Refresh dashboard data (alias for fetchDashboardData)
  refreshData: async () => {
    const { fetchDashboardData } = useDashboardStore.getState();
    await fetchDashboardData();
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set({
    stats: {
      totalStations: 0,
      totalTrains: 0,
      totalTickets: 0,
      todaySchedules: 0,
      maintenanceTrains: 0
    },
    allStations: [],
    allTrains: [],
    allTickets: [],
    allSchedules: [],
    todaySchedules: [],
    loading: false,
    error: null
  })
}));
