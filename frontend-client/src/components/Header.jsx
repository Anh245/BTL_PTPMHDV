import { Train, Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import { toast } from 'sonner';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const currentUser = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất thành công!');
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Train className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-800">TrainGo</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="nav-link text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Trang chủ
            </Link>
            <a href="#routes" className="nav-link text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Tuyến đường
            </a>
            <Link to="/my-tickets" className="nav-link text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Vé của tôi
            </Link>
            <a href="#contact" className="nav-link text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Liên hệ
            </a>
            {currentUser ? (
              <>
                <Link to="/account" className="flex items-center gap-2 text-gray-700 hover:text-primary-600 font-semibold transition-colors">
                  <User className="w-5 h-5 text-primary-600" />
                  <span>{currentUser.fullName}</span>
                </Link>
                <button onClick={handleLogout} className="btn-secondary py-2 px-4 flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary py-2 px-4">
                  Đăng nhập
                </Link>
                <Link to="/register" className="btn-primary py-2 px-4">
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden text-gray-700" onClick={toggleMenu}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <Link to="/" className="block text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Trang chủ
            </Link>
            <a href="#routes" className="block text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Tuyến đường
            </a>
            <Link to="/my-tickets" className="block text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Vé của tôi
            </Link>
            <a href="#contact" className="block text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Liên hệ
            </a>
            {currentUser ? (
              <>
                <Link to="/account" className="flex items-center gap-2 text-gray-700 hover:text-primary-600 font-semibold py-2 transition-colors">
                  <User className="w-5 h-5 text-primary-600" />
                  <span>{currentUser.fullName}</span>
                </Link>
                <button onClick={handleLogout} className="btn-secondary w-full text-center flex items-center justify-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary w-full text-center">
                  Đăng nhập
                </Link>
                <Link to="/register" className="btn-primary w-full text-center">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
