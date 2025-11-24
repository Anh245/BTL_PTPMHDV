import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';
import { Toaster } from 'sonner';
import Layout from './common/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import SigninPage from './pages/signinPage.jsx';
import SignupPage from './pages/signUpPage.jsx';
import Profile from './pages/Profile.jsx';
import TrainManagement from './pages/TrainManagement.jsx';
import Stations from './pages/Stations.jsx';
import Schedules from './pages/Schedules.jsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/signin' element={<SigninPage />} />
          <Route path='/signup' element={<SignupPage />} />
          
          <Route element={<Layout />}>
            <Route path='/' element={<Navigate to="/dashboard" replace />} />
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/stations' element={<Stations />} />
            <Route path='/trains' element={<TrainManagement />} />
            <Route path='/schedules' element={<Schedules />} />
            <Route path='/profile' element={<Profile />} />
          </Route>
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
