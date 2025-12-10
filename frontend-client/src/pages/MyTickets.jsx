// Trang MyTickets - Quản lý vé đã đặt
// Lấy tickets từ API thay vì localStorage
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Train, Calendar, MapPin, User, Mail, Phone, CreditCard, Ticket, X, AlertCircle } from 'lucide-react';
import Header from '../shared/components/Header';
import Footer from '../shared/components/Footer';
import { ticketAPI } from '../services/ticketService';
import { orderAPI } from '../services/orderService';
import { scheduleAPI } from '../services/scheduleService';
import useAuthStore from '../stores/useAuthStore';
import { toast } from 'sonner';

const MyTickets = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  
  const [tickets, setTickets] = useState([]);
  const [schedulesMap, setSchedulesMap] = useState({});
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  // Lấy danh sách tickets khi component mount
  useEffect(() => {
    // Wait for initialization to complete
    if (!isInitialized) {
      return;
    }

    if (!isAuthenticated || !user) {
      toast.error('Vui lòng đ��ng nhập để xem vé của bạn');
      navigate('/login');
      return;
    }

    loadTickets();
  }, [user, isAuthenticated, isInitialized, navigate]);

  // Reload tickets when navigating back from booking with new timestamp
  useEffect(() => {
    if (location.state?.timestamp && isInitialized && isAuthenticated && user) {
      loadTickets();
    }
  }, [location.state?.timestamp, isInitialized, isAuthenticated, user]);

  const loadTickets = async () => {
    try {
      setLoading(true);

      // Get user ID with fallback
      const currentUser = user || JSON.parse(localStorage.getItem('currentUser') || 'null');
      const userId = currentUser?.id || currentUser?.userId || currentUser?.userRefId;
      
      if (!userId) {
        console.error('User ID not found:', { 
          user, 
          currentUser,
          localStorage: localStorage.getItem('currentUser')
        });
        toast.error('Không tìm thấy thông tin user. Vui lòng đăng nhập lại.');
        navigate('/login');
        return;
      }
      
      // Lấy orders của user (thay vì tickets vì hệ thống chưa tạo ticket entities)
      const ordersData = await orderAPI.getUserOrders(userId);
      
      // Convert orders to ticket format for display
      // Filter out cancelled orders (optional - remove filter to show all)
      const activeOrders = ordersData.filter(order => 
        order.orderStatus?.toLowerCase() !== 'cancelled'
      );
      
      const ticketsData = activeOrders.map(order => ({
          id: order.id,
          scheduleId: order.scheduleRefId,
          status: order.orderStatus || 'created', // Keep original case from backend
          price: order.totalAmount,
          seatNumber: 'N/A', // Orders don't have seat numbers yet
        passengerName: order.userEmailSnapshot || 'N/A',
        passengerEmail: order.userEmailSnapshot || '',
        passengerPhone: '',
        passengerIdNumber: '',
        createdAt: order.createdAt,
        quantity: order.quantity
      }));
      
      setTickets(Array.isArray(ticketsData) ? ticketsData : []);

      // Lấy thông tin schedules cho mỗi ticket
      const scheduleIds = [...new Set(ticketsData.map(t => t.scheduleId).filter(id => id))];
      const schedulesData = {};

      await Promise.all(
        scheduleIds.map(async (scheduleId) => {
          try {
            const schedule = await scheduleAPI.getSchedule(scheduleId);

            // Parse departure time to extract time components
            let departureTime = 'N/A';
            let arrivalTime = 'N/A';
            let departureDate = '';

            if (schedule.departureTime) {
              const depDate = new Date(schedule.departureTime);
              departureTime = depDate.toTimeString().slice(0, 5);
              departureDate = depDate.toISOString().split('T')[0];
            }

            if (schedule.arrivalTime) {
              const arrDate = new Date(schedule.arrivalTime);
              arrivalTime = arrDate.toTimeString().slice(0, 5);
            }

            schedulesData[scheduleId] = {
              ...schedule,
              departureTime,
              arrivalTime,
              departureDate
            };
          } catch (error) {
            console.error(`Lỗi khi tải schedule ${scheduleId}:`, error);
          }
        })
      );

      setSchedulesMap(schedulesData);
    } catch (error) {
      console.error('Lỗi khi tải vé:', error);
      toast.error('Không thể tải danh sách vé. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTicket = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      return;
    }

    try {
      setCancelling(true);
      
      // Call cancel order API (userId is extracted from JWT token by backend)
      await orderAPI.cancelOrder(orderId);
      
      // Reload orders
      await loadTickets();
      
      setShowDetails(false);
      setSelectedTicket(null);
      toast.success('Đã hủy đơn hàng thành công!');
    } catch (error) {
      console.error('Lỗi khi hủy đơn hàng:', error);
      toast.error(error.response?.data?.message || 'Không thể hủy đơn hàng. Vui lòng thử lại.');
    } finally {
      setCancelling(false);
    }
  };

  const handleViewDetails = (ticket) => {
    setSelectedTicket(ticket);
    setShowDetails(true);
  };

  const formatPrice = (price) => {
    return (price || 0).toLocaleString('vi-VN') + ' VNĐ';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'CONFIRMED': { text: 'Đã đặt vé', class: 'bg-green-100 text-green-700' },
      'confirmed': { text: 'Đã đặt vé', class: 'bg-green-100 text-green-700' },
      'CREATED': { text: 'Đã đặt vé', class: 'bg-green-100 text-green-700' }, // Cũ, hiếm khi xảy ra
      'created': { text: 'Đã đặt vé', class: 'bg-green-100 text-green-700' }, // Cũ, hiếm khi xảy ra
      'PENDING': { text: 'Chờ xử lý', class: 'bg-yellow-100 text-yellow-700' },
      'CANCELLED': { text: 'Đã hủy', class: 'bg-red-100 text-red-700' },
      'cancelled': { text: 'Đã hủy', class: 'bg-red-100 text-red-700' },
      'USED': { text: 'Đã sử dụng', class: 'bg-gray-100 text-gray-700' }
    };
    
    const statusInfo = statusMap[status] || { text: status, class: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="my-tickets-page min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent mb-4"></div>
            <p className="text-xl text-gray-600">Đang tải danh sách vé...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="my-tickets-page min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Vé của tôi</h1>
          <p className="text-gray-600">Quản lý và xem thông tin các vé đã đặt</p>
        </div>

        {tickets.length === 0 ? (
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
            {tickets.map((ticket) => {
              const schedule = schedulesMap[ticket.scheduleId];
              
              return (
                <div
                  key={ticket.id}
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
                            <h3 className="text-2xl font-bold text-gray-800">
                              {schedule?.trainNumber || 'Đang tải...'}
                            </h3>
                            {getStatusBadge(ticket.status)}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-600 text-sm">
                            {schedule && (
                              <>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-primary-600" />
                                  <span>{schedule.departureStation} → {schedule.arrivalStation}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-primary-600" />
                                  <span>{formatDate(schedule.departureDate)} - {schedule.departureTime}</span>
                                </div>
                              </>
                            )}
                            <div className="flex items-center gap-2">
                              <Ticket className="w-4 h-4 text-primary-600" />
                              <span>Ghế: {ticket.seatNumber}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-primary-600" />
                              <span>{ticket.passengerName}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col lg:items-end gap-4">
                        <div className="text-center lg:text-right">
                          <p className="text-sm text-gray-500 mb-1">Giá vé</p>
                          <p className="text-3xl font-bold text-primary-600">
                            {formatPrice(ticket.price)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetails(ticket)}
                            className="btn-secondary px-4 py-2 text-sm"
                          >
                            Xem chi tiết
                          </button>
                          {(ticket.status === 'CONFIRMED' || ticket.status === 'confirmed' || ticket.status === 'created') && (
                            <button
                              onClick={() => handleCancelTicket(ticket.id)}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 text-sm"
                              disabled={cancelling}
                            >
                              {cancelling ? 'Đang hủy...' : 'Hủy vé'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Mã vé: {ticket.id} | Đặt lúc: {formatDateTime(ticket.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showDetails && selectedTicket && (
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
                  <h3 className="text-xl font-bold text-gray-800">Mã vé</h3>
                  <span className="text-2xl font-mono font-bold text-primary-600">
                    {selectedTicket.id}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Trạng thái</p>
                    <div className="mt-1">
                      {getStatusBadge(selectedTicket.status)}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600">Thời gian đặt</p>
                    <p className="font-semibold text-gray-800 mt-1">
                      {formatDateTime(selectedTicket.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {schedulesMap[selectedTicket.scheduleId] && (
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Train className="w-5 h-5 text-primary-600" />
                    Thông tin chuyến tàu
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tên tàu:</span>
                      <span className="font-semibold text-gray-800">
                        {schedulesMap[selectedTicket.scheduleId].trainNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Từ:</span>
                      <span className="font-semibold text-gray-800">
                        {schedulesMap[selectedTicket.scheduleId].departureStation}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Đến:</span>
                      <span className="font-semibold text-gray-800">
                        {schedulesMap[selectedTicket.scheduleId].arrivalStation}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày đi:</span>
                      <span className="font-semibold text-gray-800">
                        {formatDate(schedulesMap[selectedTicket.scheduleId].departureDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giờ khởi hành:</span>
                      <span className="font-semibold text-gray-800">
                        {schedulesMap[selectedTicket.scheduleId].departureTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giờ đến:</span>
                      <span className="font-semibold text-gray-800">
                        {schedulesMap[selectedTicket.scheduleId].arrivalTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số ghế:</span>
                      <span className="font-semibold text-gray-800">
                        {selectedTicket.seatNumber}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary-600" />
                  Thông tin hành khách
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Họ và tên:</span>
                    <span className="font-semibold text-gray-800">
                      {selectedTicket.passengerName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-semibold text-gray-800">
                      {selectedTicket.passengerEmail}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số điện thoại:</span>
                    <span className="font-semibold text-gray-800">
                      {selectedTicket.passengerPhone}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số CMND/CCCD:</span>
                    <span className="font-semibold text-gray-800">
                      {selectedTicket.passengerIdNumber}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary-600" />
                  Thông tin thanh toán
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xl font-bold text-gray-800 pt-2">
                    <span>Giá vé:</span>
                    <span className="text-primary-600">{formatPrice(selectedTicket.price)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">Lưu ý:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Vui lòng có mặt tại ga trước giờ khởi hành ít nhất 30 phút</li>
                    <li>Mang theo giấy tờ tùy thân và mã vé khi lên tàu</li>
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
                {(selectedTicket.status === 'CONFIRMED' || selectedTicket.status === 'confirmed' || selectedTicket.status === 'created') && (
                  <button
                    onClick={() => handleCancelTicket(selectedTicket.id)}
                    className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200"
                    disabled={cancelling}
                  >
                    {cancelling ? 'Đang hủy...' : 'Hủy vé này'}
                  </button>
                )}
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
