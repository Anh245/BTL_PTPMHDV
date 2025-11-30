import { useState } from 'react';
import useAuthStore from '../stores/useAuthStore';
import { authAPI } from '../services/authService';
import { orderAPI } from '../services/orderService';
import { decodeJWT } from '../utils/jwtDebug';
import Header from '../shared/components/Header';

const AuthTest = () => {
  const { user, token, isAuthenticated } = useAuthStore();
  const [testResult, setTestResult] = useState('');

  const testAuth = async () => {
    setTestResult('Testing authentication...\n\n');
    
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('currentUser');
    
    let result = '=== AUTHENTICATION STATUS ===\n\n';
    result += `Authenticated: ${isAuthenticated}\n`;
    result += `User from context: ${user ? JSON.stringify(user, null, 2) : 'null'}\n`;
    result += `Token from context: ${token ? token.substring(0, 50) + '...' : 'null'}\n\n`;
    result += `Token in localStorage: ${storedToken ? storedToken.substring(0, 50) + '...' : 'null'}\n`;
    result += `User in localStorage: ${storedUser || 'null'}\n\n`;
    
    // Decode JWT token
    if (storedToken) {
      result += '=== JWT TOKEN DETAILS ===\n\n';
      const decoded = decodeJWT(storedToken);
      if (decoded.error) {
        result += `❌ Error decoding token: ${decoded.error}\n\n`;
      } else {
        result += `Header: ${JSON.stringify(decoded.header, null, 2)}\n`;
        result += `Payload: ${JSON.stringify(decoded.payload, null, 2)}\n`;
        result += `Subject (username): ${decoded.payload.sub || 'N/A'}\n`;
        result += `Role: ${decoded.payload.role || decoded.payload.roles || '❌ NOT FOUND'}\n`;
        result += `Issued At: ${decoded.issuedAt}\n`;
        result += `Expires At: ${decoded.expiresAt}\n`;
        result += `Is Expired: ${decoded.isExpired ? '❌ YES' : '✅ NO'}\n\n`;
        
        if (!decoded.payload.role && !decoded.payload.roles) {
          result += '⚠️ WARNING: Token does not contain "role" or "roles" claim!\n';
          result += '   This will cause 403 Forbidden errors.\n';
          result += `   Available claims: ${Object.keys(decoded.payload).join(', ')}\n\n`;
        }
      }
    }
    
    // Test API call
    result += '=== TESTING API CALL ===\n\n';
    
    try {
      result += 'Calling /auth/me...\n';
      const meResponse = await authAPI.getCurrentUser();
      result += `✅ Success: ${JSON.stringify(meResponse, null, 2)}\n\n`;
    } catch (error) {
      result += `❌ Failed: ${error.response?.status} - ${error.response?.data?.message || error.message}\n\n`;
    }
    
    // Test orders API
    try {
      result += 'Calling /orders...\n';
      const ordersResponse = await orderAPI.getOrders();
      result += `✅ Success: Found ${ordersResponse.length} orders\n\n`;
    } catch (error) {
      result += `❌ Failed: ${error.response?.status} - ${error.response?.data?.message || error.message}\n\n`;
    }
    
    setTestResult(result);
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    setTestResult('Authentication cleared. Please refresh the page.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Authentication Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          <div className="space-y-2">
            <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Username:</strong> {user?.username || 'N/A'}</p>
            <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
            <p><strong>Token:</strong> {token ? '✅ Present' : '❌ Missing'}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="flex gap-4">
            <button
              onClick={testAuth}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Run Authentication Test
            </button>
            <button
              onClick={clearAuth}
              className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
            >
              Clear Authentication
            </button>
          </div>
        </div>
        
        {testResult && (
          <div className="bg-gray-900 text-green-400 rounded-lg p-6 font-mono text-sm whitespace-pre-wrap">
            {testResult}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthTest;
