import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Save, LogOut, Trash2, Eye, EyeOff } from 'lucide-react';
import Header from '../../shared/components/Header';
import Footer from '../../shared/components/Footer';
import useAuthStore from '../../stores/useAuthStore';
import { authAPI } from '../../services/authService';
import { toast } from 'sonner';

const AccountManagement = () => {
  const navigate = useNavigate();
  const { user, logout, isInitialized } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Wait for initialization to complete
    if (!isInitialized) {
      return;
    }

    if (!user) {
      toast.error('Vui lòng đăng nhập để truy cập trang này');
      navigate('/login');
      return;
    }
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || ''
    });
  }, [user, isInitialized, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const handleSaveProfile = async () => {
    try {
      // Split fullName into firstname and lastname
      const nameParts = formData.fullName.trim().split(' ');
      const firstname = nameParts[0] || '';
      const lastname = nameParts.slice(1).join(' ') || '';

      await authAPI.updateProfile({
        firstname,
        lastname,
        email: formData.email
      });

      // Update localStorage
      const updatedUser = {
        ...user,
        fullName: formData.fullName,
        firstname,
        lastname,
        email: formData.email,
        phone: formData.phone
      };

      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setIsEditing(false);
      toast.success('Cập nhật thông tin thành công!');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMsg = error.response?.data?.message || error.response?.data || 'Cập nhật thông tin thất bại. Vui lòng thử lại.';
      toast.error(errorMsg);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu mới không khớp!');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Mật khẩu phải có ít nhất 8 ký tự!');
      return;
    }

    if (!passwordData.currentPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại!');
      return;
    }

    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordChange(false);
      toast.success('Đổi mật khẩu thành công!');
      
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMsg = error.response?.data?.message || error.response?.data || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.';
      toast.error(errorMsg);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      logout();
      toast.success('Đã đăng xuất thành công!');
      navigate('/');
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác!')) {
      // TODO: Call backend API to delete account
      logout();
      toast.success('Tài khoản đã được xóa!');
      navigate('/');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="account-management-page min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Quản lý tài khoản</h1>
            <p className="text-gray-600">Cập nhật thông tin cá nhân và quản lý tài khoản của bạn</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Thông tin cá nhân</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary"
                >
                  Chỉnh sửa
                </button>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary-600" />
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`input-field ${!isEditing ? 'bg-gray-100' : ''}`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary-600" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`input-field ${!isEditing ? 'bg-gray-100' : ''}`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary-600" />
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`input-field ${!isEditing ? 'bg-gray-100' : ''}`}
                />
              </div>

              {isEditing && (
                <div className="flex gap-4">
                  <button
                    onClick={handleSaveProfile}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Lưu thay đổi
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        fullName: user.fullName || '',
                        email: user.email || '',
                        phone: user.phone || ''
                      });
                    }}
                    className="btn-secondary"
                  >
                    Hủy
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Bảo mật</h2>
              {!showPasswordChange && (
                <button
                  onClick={() => setShowPasswordChange(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Lock className="w-5 h-5" />
                  Đổi mật khẩu
                </button>
              )}
            </div>

            {showPasswordChange && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mật khẩu hiện tại
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="input-field pr-10"
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="input-field pr-10"
                      placeholder="Nhập mật khẩu mới"
                      minLength="8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="input-field"
                    placeholder="Nhập lại mật khẩu mới"
                    minLength="8"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleChangePassword}
                    className="btn-primary"
                  >
                    Cập nhật mật khẩu
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                    }}
                    className="btn-secondary"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Hành động tài khoản</h2>
            
            <div className="space-y-4">
              <button
                onClick={handleLogout}
                className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Đăng xuất
              </button>

              <button
                onClick={handleDeleteAccount}
                className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Xóa tài khoản
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Lưu ý:</strong> Xóa tài khoản sẽ xóa toàn bộ dữ liệu của bạn, bao gồm các vé đã đặt. Hành động này không thể hoàn tác.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AccountManagement;
