import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Save, LogOut, Trash2, Eye, EyeOff } from 'lucide-react';
import Header from '../../shared/components/Header';
import Footer from '../../shared/components/Footer';

const AccountManagement = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
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
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
      alert('Vui lòng đăng nhập để truy cập trang này');
      navigate('/login');
      return;
    }
    setCurrentUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone
    });
  }, [navigate]);

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

  const handleSaveProfile = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex !== -1) {
      users[userIndex] = {
        ...users[userIndex],
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone
      };

      localStorage.setItem('users', JSON.stringify(users));

      const updatedCurrentUser = {
        id: currentUser.id,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone
      };

      localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
      setCurrentUser(updatedCurrentUser);
      setIsEditing(false);
      alert('Cập nhật thông tin thành công!');
    }
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Mật khẩu mới không khớp!');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      alert('Mật khẩu phải có ít nhất 8 ký tự!');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === currentUser.id);

    if (!user) {
      alert('Không tìm thấy người dùng!');
      return;
    }

    if (user.password !== passwordData.currentPassword) {
      alert('Mật khẩu hiện tại không đúng!');
      return;
    }

    const userIndex = users.findIndex(u => u.id === currentUser.id);
    users[userIndex].password = passwordData.newPassword;
    localStorage.setItem('users', JSON.stringify(users));

    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordChange(false);
    alert('Đổi mật khẩu thành công!');
  };

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      localStorage.removeItem('currentUser');
      alert('Đã đăng xuất thành công!');
      navigate('/');
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác!')) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.filter(u => u.id !== currentUser.id);
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      const bookings = JSON.parse(localStorage.getItem('trainBookings') || '[]');
      const updatedBookings = bookings.filter(b => b.passenger.email !== currentUser.email);
      localStorage.setItem('trainBookings', JSON.stringify(updatedBookings));

      localStorage.removeItem('currentUser');
      alert('Tài khoản đã được xóa!');
      navigate('/');
    }
  };

  if (!currentUser) {
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
                        fullName: currentUser.fullName,
                        email: currentUser.email,
                        phone: currentUser.phone
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
