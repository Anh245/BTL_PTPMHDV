import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Train, Calendar, MapPin, User, Mail, Phone, CreditCard, Ticket, X, AlertCircle } from 'lucide-react';
import Header from '../shared/components/Header';
import Footer from '../shared/components/Footer';

const MyTickets = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = () => {
    const savedBookings = JSON.parse(localStorage.getItem('trainBookings') || '[]');
    setBookings(savedBookings);
  };

  const handleCancelBooking = (bookingId) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy vé này?')) {
      const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
      localStorage.setItem('trainBookings', JSON.stringify(updatedBookings));
      setBookings(updatedBookings);
      setShowDetails(false);
      setSelectedBooking(null);
      alert('Đã hủy vé thành công!');
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetails(true);
  };

  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN') + ' VNĐ';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className="my-tickets-page min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Vé của tôi</h1>
          <p className="text-gray-600">Quản lý và xem thông tin các vé đã đặt</p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Chưa có vé nào</h2>
            <p className="text-gray-600 mb-6">Bạn chưa đặt vé nào. Hãy tìm kiếm và đặt vé ngay!</p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Đặt vé ngay
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary-100 p-4 rounded-lg">
                        <Train className="w-8 h-8 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-gray-800">{booking.train.name}</h3>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                            {booking.status === 'confirmed' ? 'Đã xác nhận' : booking.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-600 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary-600" />
                            <span>{booking.searchData.departure} → {booking.searchData.destination}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary-600" />
                            <span>{formatDate(booking.searchData.date)} - {booking.train.departureTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Ticket className="w-4 h-4 text-primary-600" />
                            <span>Số vé: {booking.passenger.numberOfTickets}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-primary-600" />
                            <span>{booking.passenger.fullName}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col lg:items-end gap-4">
                      <div className="text-center lg:text-right">
                        <p className="text-sm text-gray-500 mb-1">Tổng tiền</p>
                        <p className="text-3xl font-bold text-primary-600">{formatPrice(booking.totalPrice)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(booking)}
                          className="btn-secondary px-4 py-2 text-sm"
                        >
                          Xem chi tiết
                        </button>
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 text-sm"
                        >
                          Hủy vé
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Mã đặt vé: {booking.id} | Đặt lúc: {formatDateTime(booking.bookingDate)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Chi tiết vé</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-primary-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Mã đặt vé</h3>
                  <span className="text-2xl font-mono font-bold text-primary-600">
                    {selectedBooking.id}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Trạng thái</p>
                    <p className="font-semibold text-green-600">
                      {selectedBooking.status === 'confirmed' ? 'Đã xác nhận' : selectedBooking.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Thời gian đặt</p>
                    <p className="font-semibold text-gray-800">{formatDateTime(selectedBooking.bookingDate)}</p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Train className="w-5 h-5 text-primary-600" />
                  Thông tin chuyến tàu
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tên tàu:</span>
                    <span className="font-semibold text-gray-800">{selectedBooking.train.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Từ:</span>
                    <span className="font-semibold text-gray-800">{selectedBooking.searchData.departure}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">��ến:</span>
                    <span className="font-semibold text-gray-800">{selectedBooking.searchData.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày đi:</span>
                    <span className="font-semibold text-gray-800">{formatDate(selectedBooking.searchData.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giờ khởi hành:</span>
                    <span className="font-semibold text-gray-800">{selectedBooking.train.departureTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giờ đến:</span>
                    <span className="font-semibold text-gray-800">{selectedBooking.train.arrivalTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời gian di chuyển:</span>
                    <span className="font-semibold text-gray-800">{selectedBooking.train.duration}</span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary-600" />
                  Thông tin hành khách
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Họ và tên:</span>
                    <span className="font-semibold text-gray-800">{selectedBooking.passenger.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-semibold text-gray-800">{selectedBooking.passenger.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số điện thoại:</span>
                    <span className="font-semibold text-gray-800">{selectedBooking.passenger.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số CMND/CCCD:</span>
                    <span className="font-semibold text-gray-800">{selectedBooking.passenger.idNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số lượng vé:</span>
                    <span className="font-semibold text-gray-800">{selectedBooking.passenger.numberOfTickets}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary-600" />
                  Thông tin thanh toán
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Giá mỗi vé:</span>
                    <span>{formatPrice(selectedBooking.train.price)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Số lượng:</span>
                    <span>{selectedBooking.passenger.numberOfTickets} vé</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t border-gray-300">
                    <span>Tổng tiền:</span>
                    <span className="text-primary-600">{formatPrice(selectedBooking.totalPrice)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">Lưu ý:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Vui lòng có mặt tại ga trước giờ khởi hành ít nhất 30 phút</li>
                    <li>Mang theo giấy tờ tùy thân và mã đặt vé khi lên tàu</li>
                    <li>Liên hệ hotline để được hỗ trợ nếu cần thay đổi thông tin</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowDetails(false)}
                  className="btn-secondary flex-1"
                >
                  Đóng
                </button>
                <button
                  onClick={() => handleCancelBooking(selectedBooking.id)}
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200"
                >
                  Hủy vé này
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MyTickets;
