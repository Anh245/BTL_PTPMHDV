// Utility để debug và test API connections
import { stationAPI } from '../services/stationService';
import { trainAPI } from '../services/trainService';
import { scheduleAPI } from '../services/scheduleService';

export const testAPIConnections = async () => {
  console.log('🔍 Testing API Connections...\n');
  
  const results = {
    stations: { success: false, data: null, error: null },
    trains: { success: false, data: null, error: null },
    schedules: { success: false, data: null, error: null }
  };

  // Test Stations API
  try {
    console.log('📍 Testing Stations API...');
    const stations = await stationAPI.getStations();
    results.stations.success = true;
    results.stations.data = stations;
    console.log(`✅ Stations API: SUCCESS - Found ${stations.length} stations`);
    console.log('Sample station:', stations[0]);
  } catch (error) {
    results.stations.error = error;
    console.error('❌ Stations API: FAILED');
    console.error('Error:', error.response?.data || error.message);
  }

  // Test Trains API
  try {
    console.log('\n🚂 Testing Trains API...');
    const trains = await trainAPI.getTrains();
    results.trains.success = true;
    results.trains.data = trains;
    console.log(`✅ Trains API: SUCCESS - Found ${trains.length} trains`);
    console.log('Sample train:', trains[0]);
  } catch (error) {
    results.trains.error = error;
    console.error('❌ Trains API: FAILED');
    console.error('Error:', error.response?.data || error.message);
  }

  // Test Schedules API
  try {
    console.log('\n📅 Testing Schedules API...');
    const schedules = await scheduleAPI.getSchedules();
    results.schedules.success = true;
    results.schedules.data = schedules;
    console.log(`✅ Schedules API: SUCCESS - Found ${schedules.length} schedules`);
    console.log('Sample schedule:', schedules[0]);
  } catch (error) {
    results.schedules.error = error;
    console.error('❌ Schedules API: FAILED');
    console.error('Error:', error.response?.data || error.message);
  }

  console.log('\n📊 Summary:');
  console.log(`Stations: ${results.stations.success ? '✅' : '❌'}`);
  console.log(`Trains: ${results.trains.success ? '✅' : '❌'}`);
  console.log(`Schedules: ${results.schedules.success ? '✅' : '❌'}`);

  return results;
};

// Expose to window for easy testing in browser console
if (typeof window !== 'undefined') {
  window.testAPI = testAPIConnections;
}
