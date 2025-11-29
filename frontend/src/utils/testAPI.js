// Utility để test API connections
import { trainAPI } from '@/services/trainServiceAPI';
import { stationAPI } from '@/services/stationServiceAPI';
import { scheduleAPI } from '@/services/scheduleServiceAPI';
import { authService } from '@/services/authServicesAPI';

export const testAllAPIs = async () => {
  const results = {
    trains: { success: false, error: null, data: null },
    stations: { success: false, error: null, data: null },
    schedules: { success: false, error: null, data: null },
    auth: { success: false, error: null, data: null }
  };

  // Test Trains API
  try {
    const response = await trainAPI.getTrains({ limit: 5 });
    results.trains.success = true;
    results.trains.data = response.data;
    console.log('✅ Trains API working:', response.data);
  } catch (error) {
    results.trains.error = error.message;
    console.error('❌ Trains API failed:', error.message);
  }

  // Test Stations API
  try {
    const response = await stationAPI.getStations({ limit: 5 });
    results.stations.success = true;
    results.stations.data = response.data;
    console.log('✅ Stations API working:', response.data);
  } catch (error) {
    results.stations.error = error.message;
    console.error('❌ Stations API failed:', error.message);
  }

  // Test Schedules API
  try {
    const response = await scheduleAPI.getSchedules({ limit: 5 });
    results.schedules.success = true;
    results.schedules.data = response.data;
    console.log('✅ Schedules API working:', response.data);
  } catch (error) {
    results.schedules.error = error.message;
    console.error('❌ Schedules API failed:', error.message);
  }

  // Test Auth API (users endpoint)
  try {
    const response = await authService.getUsers();
    results.auth.success = true;
    results.auth.data = response;
    console.log('✅ Auth API working:', response);
  } catch (error) {
    results.auth.error = error.message;
    console.error('❌ Auth API failed:', error.message);
  }

  return results;
};

// Gọi hàm này từ console để test:
// import { testAllAPIs } from '@/utils/testAPI';
// testAllAPIs();
