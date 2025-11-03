
import { BrowserRouter, Routes,Route } from 'react-router'

import Dashboard from './pages/dardboard'
import SigninPage from './pages/signinPage.jsx'
import SignupPage from './pages/signUpPage.jsx'
import Profile from './pages/Profile.jsx'

function App() {
  

  return (
    <>
      <BrowserRouter>
          <Routes>
            <Route path='/' element={<Dashboard/>}/>
            <Route path='/signin' element={<SigninPage/>} />
            <Route path='/signup' element = {<SignupPage/>}/>
            <Route path = '/profile' element = {<Profile/>}/>
          </Routes>
      </BrowserRouter>
        
      
        
    </>
  )
}

export default App
