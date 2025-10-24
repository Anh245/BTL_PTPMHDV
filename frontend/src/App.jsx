
import { BrowserRouter, Routes,Route } from 'react-router'

import Dashboard from './pages/dardboard'

function App() {
  

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Dashboard/>}/>

        </Routes>
      </BrowserRouter>
        
    </>
  )
}

export default App
