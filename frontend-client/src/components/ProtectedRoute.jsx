import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitialized, token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Đợi store initialize xong
    if (isInitialized) {
      setIsLoading(false);
    }
  }, [isInitialized]);

  // Hiển thị loading khi đang khởi tạo
  if (isLoading || !isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  // Redirect về login nếu chưa đăng nhập
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;