import { useState } from 'react';
import { testAPIConnections } from '../utils/apiDebug';
import Header from '../shared/components/Header';
import Footer from '../shared/components/Footer';

const Debug = () => {
  const [results, setResults] = useState(null);
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    const testResults = await testAPIConnections();
    setResults(testResults);
    setTesting(false);
  };

  return (
    <div className="debug-page min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">API Debug Tool</h1>
        
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test API Connections</h2>
          <p className="text-gray-600 mb-4">
            Click the button below to test connections to all backend services.
          </p>
          
          <button
            onClick={runTests}
            disabled={testing}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:bg-gray-400"
          >
            {testing ? 'Testing...' : 'Run API Tests'}
          </button>
        </div>

        {results && (
          <div className="space-y-4">
            {/* Stations */}
            <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${
              results.stations.success ? 'border-green-500' : 'border-red-500'
            }`}>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                {results.stations.success ? '✅' : '❌'} Stations API
              </h3>
              {results.stations.success ? (
                <div>
                  <p className="text-gray-600 mb-2">
                    Found {results.stations.data?.length || 0} stations
                  </p>
                  {results.stations.data?.[0] && (
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                      {JSON.stringify(results.stations.data[0], null, 2)}
                    </pre>
                  )}
                </div>
              ) : (
                <div className="text-red-600">
                  <p className="font-semibold">Error:</p>
                  <p>{results.stations.error?.response?.data || results.stations.error?.message}</p>
                  <p className="text-sm mt-2">Status: {results.stations.error?.response?.status}</p>
                </div>
              )}
            </div>

            {/* Trains */}
            <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${
              results.trains.success ? 'border-green-500' : 'border-red-500'
            }`}>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                {results.trains.success ? '✅' : '❌'} Trains API
              </h3>
              {results.trains.success ? (
                <div>
                  <p className="text-gray-600 mb-2">
                    Found {results.trains.data?.length || 0} trains
                  </p>
                  {results.trains.data?.[0] && (
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                      {JSON.stringify(results.trains.data[0], null, 2)}
                    </pre>
                  )}
                </div>
              ) : (
                <div className="text-red-600">
                  <p className="font-semibold">Error:</p>
                  <p>{results.trains.error?.response?.data || results.trains.error?.message}</p>
                  <p className="text-sm mt-2">Status: {results.trains.error?.response?.status}</p>
                </div>
              )}
            </div>

            {/* Schedules */}
            <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${
              results.schedules.success ? 'border-green-500' : 'border-red-500'
            }`}>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                {results.schedules.success ? '✅' : '❌'} Schedules API
              </h3>
              {results.schedules.success ? (
                <div>
                  <p className="text-gray-600 mb-2">
                    Found {results.schedules.data?.length || 0} schedules
                  </p>
                  {results.schedules.data?.[0] && (
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                      {JSON.stringify(results.schedules.data[0], null, 2)}
                    </pre>
                  )}
                </div>
              ) : (
                <div className="text-red-600">
                  <p className="font-semibold">Error:</p>
                  <p>{results.schedules.error?.response?.data || results.schedules.error?.message}</p>
                  <p className="text-sm mt-2">Status: {results.schedules.error?.response?.status}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Troubleshooting Tips</h3>
          <ul className="list-disc list-inside space-y-2 text-blue-700">
            <li>Make sure Gateway is running on port 8888</li>
            <li>Make sure all backend services are running</li>
            <li>Check if you have data in the database</li>
            <li>Open browser console (F12) to see detailed logs</li>
            <li>Check CORS configuration in Gateway</li>
          </ul>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Debug;
