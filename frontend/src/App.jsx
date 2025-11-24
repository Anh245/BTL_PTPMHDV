<<<<<<< HEAD
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
=======

import { BrowserRouter, Routes,Route } from 'react-router'

import Dashboard from './pages/dardboard'
import SigninPage from './pages/signinPage.jsx'
import SignupPage from './pages/signUpPage.jsx'
import Profile from './pages/Profile.jsx'
import { Toaster } from 'sonner'
import ProtectRoute from './components/auth/ProtectRoute.jsx'
>>>>>>> dbfc5309050f543f5c279a9d7a59da6924c73a6d

function App() {
  return (
<<<<<<< HEAD
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
=======
    <>
      <Toaster richColors/>
      <BrowserRouter>
          <Routes>
            <Route element ={<ProtectRoute/>}>
                <Route path='/' element={<Dashboard/>}/>
                <Route path = '/profile' element = {<Profile/>}/>

            </Route>
            <Route path='/signin' element={<SigninPage/>} />
            <Route path='/signup' element = {<SignupPage/>}/>
            
          </Routes>
>>>>>>> dbfc5309050f543f5c279a9d7a59da6924c73a6d
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
