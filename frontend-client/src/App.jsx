import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Booking from './pages/Booking';
import MyTickets from './pages/MyTickets';
import Account from './pages/Account';
import Debug from './pages/Debug';
import AuthTest from './pages/AuthTest';
import AuthDebug from './components/AuthDebug';
import ProtectedRoute from './components/ProtectedRoute';
import useAuthStore from './stores/useAuthStore';
import { Toaster } from 'sonner';
function App() {
  const initialize = useAuthStore((state) => state.initialize);

  // Initialize auth state from localStorage on app load
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/booking" element={
          <ProtectedRoute>
            <Booking />
          </ProtectedRoute>
        } />
        <Route path="/my-tickets" element={
          <ProtectedRoute>
            <MyTickets />
          </ProtectedRoute>
        } />
        <Route path="/account" element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        } />
        {/* <Route path="/debug" element={<Debug />} /> */}
        {/* <Route path="/auth-test" element={<AuthTest />} /> */}
      </Routes>
      {/* Debug component to check authentication status */}
      {/* <AuthDebug /> */}
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
