import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './common/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import SigninPage from './pages/signinPage.jsx';
import SignupPage from './pages/signUpPage.jsx';
import Profile from './pages/Profile.jsx';
import TrainManagement from './pages/TrainManagement.jsx';
import Stations from './pages/Stations.jsx';
import Schedules from './pages/Schedules.jsx';
import TicketManagement from './pages/TicketManagement.jsx';
import ProtectRoute from './components/auth/ProtectRoute.jsx';
// import Analys from '@/pages/Analys.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path='/signin' element={<SigninPage />} />
        <Route path='/signup' element={<SignupPage />} />
        
        {/* Protected routes - Require authentication */}
        <Route element={<ProtectRoute />}>
          <Route element={<Layout />}>
            <Route path='/' element={<Navigate to="/admin-dashboard" replace />} />
            <Route path='/admin-dashboard' element={<Dashboard />} />
            <Route path='/stations' element={<Stations />} />
            <Route path='/trains' element={<TrainManagement />} />
            <Route path='/schedules' element={<Schedules />} />
            <Route path='/tickets' element={<TicketManagement />} />
            <Route path='/profile' element={<Profile />} />
            {/* <Route  path='/analys' element= {<Analys/>} /> */}
          </Route>
        </Route>
      </Routes>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
   
}

export default App;

