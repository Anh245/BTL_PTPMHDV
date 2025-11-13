
import { BrowserRouter, Routes,Route } from 'react-router'

import Dashboard from './pages/dardboard'
import SigninPage from './pages/signinPage.jsx'
import SignupPage from './pages/signUpPage.jsx'
import Profile from './pages/Profile.jsx'
import { Toaster } from 'sonner'
import ProtectRoute from './components/auth/ProtectRoute.jsx'

function App() {
  

  return (
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
      </BrowserRouter>
        
      
        
    </>
  )
}

export default App
