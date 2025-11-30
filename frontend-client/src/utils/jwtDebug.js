// Utility to decode and debug JWT tokens
export const decodeJWT = (token) => {
  try {
    // JWT has 3 parts: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { error: 'Invalid JWT format' };
    }

    // Decode header
    const header = JSON.parse(atob(parts[0]));
    
    // Decode payload
    const payload = JSON.parse(atob(parts[1]));
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp && payload.exp < now;
    
    return {
      header,
      payload,
      isExpired,
      expiresAt: payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'N/A',
      issuedAt: payload.iat ? new Date(payload.iat * 1000).toLocaleString() : 'N/A'
    };
  } catch (error) {
    return { error: error.message };
  }
};

export const debugToken = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('❌ No token found in localStorage');
    return null;
  }
  
  console.log('🔑 Token found:', token.substring(0, 50) + '...');
  
  const decoded = decodeJWT(token);
  
  if (decoded.error) {
    console.error('❌ Error decoding token:', decoded.error);
    return null;
  }
  
  console.log('📋 Token Details:');
  console.log('  Header:', decoded.header);
  console.log('  Payload:', decoded.payload);
  console.log('  Subject (username):', decoded.payload.sub);
  console.log('  Role:', decoded.payload.role || decoded.payload.roles || 'NOT FOUND');
  console.log('  Issued At:', decoded.issuedAt);
  console.log('  Expires At:', decoded.expiresAt);
  console.log('  Is Expired:', decoded.isExpired ? '❌ YES' : '✅ NO');
  
  // Check for role
  if (!decoded.payload.role && !decoded.payload.roles) {
    console.warn('⚠️ WARNING: Token does not contain "role" or "roles" claim!');
    console.warn('   This will cause 403 Forbidden errors.');
    console.warn('   Available claims:', Object.keys(decoded.payload));
  }
  
  return decoded;
};

// Add to window for easy access in console
if (typeof window !== 'undefined') {
  window.debugToken = debugToken;
  window.decodeJWT = decodeJWT;
}
