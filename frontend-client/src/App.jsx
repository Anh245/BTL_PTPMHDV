import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Booking from './pages/Booking';
import MyTickets from './pages/MyTickets';
import Account from './pages/Account';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/my-tickets" element={<MyTickets />} />
      <Route path="/account" element={<Account />} />
    </Routes>
  );
}

export default App;
