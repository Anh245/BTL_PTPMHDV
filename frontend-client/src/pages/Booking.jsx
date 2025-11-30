import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Train, Clock, Calendar, MapPin, User, CreditCard, Ticket, AlertCircle } from 'lucide-react';
import Header from '../shared/components/Header';
import Footer from '../shared/components/Footer';
import { scheduleAPI } from '../services/scheduleService';
import { ticketAPI } from '../services/ticketService';
import { orderAPI } from '../services/orderService';
import useAuthStore from '../stores/useAuthStore';

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const searchData = location.state;

  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [error, setError] = useState(null);
  
  const [numberOfTickets, setNumberOfTickets] = useState(1);

  useEffect(() => {
    if (!searchData) {
      navigate('/');
      return;
    }

    const fetchSchedules = async () => {
      try {
        setLoading(true);
        setError(null);

        if (searchData.scheduleId) {
          const schedule = await scheduleAPI.getSchedule(searchData.scheduleId);
          setAvailableSchedules([processSchedule(schedule)]);
        } else {
          const schedules = await scheduleAPI.searchSchedules({
            departureStation: searchData.departure,
            arrivalStation: searchData.destination,
            date: searchData.date
          });

          let filtered = schedules || [];

          // Process schedules to extract time from departureTime
          filtered = filtered.map(processSchedule);

          // Filter by hour if specified
          if (searchData.hour && filtered.length > 0) {
            filtered = filtered.filter(schedule => {
              if (schedule.departureTimeOnly) {
                const scheduleHour = parseInt(schedule.departureTimeOnly.split(':')[0]);
                return scheduleHour === parseInt(searchData.hour);
              }
              return false;
            });
          }

          // Filter for active schedules
          const activeSchedules = filtered.filter(schedule =>
            schedule.status && schedule.status.toLowerCase() === 'scheduled'
          );

          setAvailableSchedules(activeSchedules);
        }
      } catch (error) {
        console.error('Error fetching schedules:', error);
        setError(error.response?.data?.message || 'Không thể tải danh sách chuyến tàu. Vui lòng thử lại.');
        setAvailableSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [searchData, navigate]);

  // Helper function to process schedule and extract time
  const processSchedule = (schedule) => {
    try {
      // Parse departureTime and arrivalTime from backend LocalDateTime format
      let departureTimeOnly = '';
      let arrivalTimeOnly = '';
      let departureDateOnly = '';

      if (schedule.departureTime) {
        const depDate = new Date(schedule.departureTime);
        departureTimeOnly = depDate.toTimeString().slice(0, 5); // HH:MM
        departureDateOnly = depDate.toISOString().split('T')[0];
      }

      if (schedule.arrivalTime) {
        const arrDate = new Date(schedule.arrivalTime);
        arrivalTimeOnly = arrDate.toTimeString().slice(0, 5); // HH:MM
      }

      return {
        ...schedule,
        departureTimeOnly,
        arrivalTimeOnly,
        departureDateOnly,
        // Ensure basePrice is a number
        basePrice: parseFloat(schedule.basePrice) || 0
      };
    } catch (error) {
      console.error('Error processing schedule:', schedule, error);
      return schedule;
    }
  };

  const handleScheduleSelect = (schedule) => {
    setSelectedSchedule(schedule);
    setTimeout(() => {
      const form = document.getElementById('booking-form');
      if (form) {
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleInputChange = (e) => {
    setNumberOfTickets(parseInt(e.target.value) || 1);
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!selectedSchedule) {
      alert('Vui lòng chọn chuyến tàu');
      return;
    }

    // Validate số vé với số vé còn lại (nếu có thông tin)
    if (selectedSchedule.availableSeats && numberOfTickets > selectedSchedule.availableSeats) {
      alert(`Chỉ còn ${selectedSchedule.availableSeats} vé`);
      return;
    }

    // TEMPORARY: Use stored user if context user is not available
    const currentUser = user || JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    if (!currentUser) {
      alert('Vui lòng đăng nhập để đặt vé');
      navigate('/login');
      return;
    }

    try {
      setBookingInProgress(true);
      setError(null);

      // Calculate total price (ensure it's a number)
      const basePrice = parseFloat(selectedSchedule.basePrice) || 0;
      const totalPrice = basePrice * numberOfTickets;

      const scheduleInfoSnapshot = JSON.stringify({
        trainNumber: selectedSchedule.trainNumber,
        departureStation: selectedSchedule.departureStation,
        arrivalStation: selectedSchedule.arrivalStation,
        departureTime: selectedSchedule.departureTime,
        arrivalTime: selectedSchedule.arrivalTime,
        departureTimeOnly: selectedSchedule.departureTimeOnly,
        arrivalTimeOnly: selectedSchedule.arrivalTimeOnly
      });

      // Step 1: Create order
      // Create passenger details (required field)
      const passengerDetails = [];
      for (let i = 0; i < numberOfTickets; i++) {
        passengerDetails.push({
          fullName: currentUser.fullName || currentUser.username || 'Passenger ' + (i + 1),
          idNumber: '',
          phoneNumber: '',
          email: currentUser.email || ''
        });
      }

      const orderData = {
        userRefId: parseInt(currentUser.id),  // Ensure Integer
        userEmailSnapshot: currentUser.email || '',
        scheduleRefId: parseInt(selectedSchedule.id),  // Ensure Integer
        scheduleInfoSnapshot: scheduleInfoSnapshot,
        ticketTypeRefId: 1,
        ticketTypeNameSnapshot: 'Standard',
        quantity: parseInt(numberOfTickets),  // Ensure Integer
        totalAmount: totalPrice,  // Number for BigDecimal
        paymentMethod: 'cash', // Valid enum: cash, credit_card, ewallet
        passengerDetails: JSON.stringify(passengerDetails) // Required: JSON string of passenger info
      };

      const createdOrder = await orderAPI.createOrder(orderData);

      // Step 2: Update ticket soldQuantity
      // Find an active ticket for this schedule and update soldQuantity
      try {
        const allTickets = await ticketAPI.getTickets();
        const scheduleTickets = allTickets.filter(ticket => 
          (ticket.scheduleId === selectedSchedule.id || ticket.scheduleRefId === selectedSchedule.id) &&
          ticket.status && ticket.status.toUpperCase() === 'ACTIVE'
        );
        
        // TODO: soldQuantity should be updated by backend (tickets-service)
        // when order is created, not by frontend
        // Commenting out to avoid PUT /tickets error
        
        // if (scheduleTickets.length > 0) {
        //   const availableTicket = scheduleTickets.find(ticket => {
        //     const available = (ticket.totalQuantity || 0) - (ticket.soldQuantity || 0);
        //     return available >= numberOfTickets;
        //   });
        //   
        //   if (availableTicket) {
        //     const updatedTicket = await ticketAPI.updateTicket(availableTicket.id, {
        //       ...availableTicket,
        //       soldQuantity: (availableTicket.soldQuantity || 0) + numberOfTickets
        //     });
        //     console.log('Ticket updated:', updatedTicket);
        //   }
        // }
      } catch (error) {
        console.error('Error in booking process:', error);
        // Continue anyway - order is created
      }

      // Step 3: Confirm payment to change order status from 'created' to 'confirmed'
      try {
        await orderAPI.confirmPayment(createdOrder.id);
      } catch (error) {
        console.error('Error confirming payment:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        // Continue anyway - order is created, user can still see it
      }

      alert(
        `✅ Đặt vé thành công!\n\n` +
        `Chuyến tàu: ${selectedSchedule.trainNumber}\n` +
        `Từ: ${selectedSchedule.departureStation}\n` +
        `Đến: ${selectedSchedule.arrivalStation}\n` +
        `Số vé: ${numberOfTickets}\n` +
        `Tổng tiền: ${totalPrice.toLocaleString('vi-VN')} VNĐ\n\n` +
        `Mã đơn hàng: ${createdOrder.id}`
      );

      // Navigate with timestamp to force reload
      navigate('/my-tickets', { replace: true, state: { timestamp: Date.now() } });
    } catch (error) {
      console.error('Booking error:', error);
      
      // Check authentication status
      let errorMessage = 'Đặt vé thất bại. Vui lòng thử lại.';
      
      if (error.response?.status === 403) {
        errorMessage = '🔒 Lỗi xác thực: Bạn không có quyền thực hiện thao tác này.\n\nVui lòng đăng nhập lại.';
        // Clear auth and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        setTimeout(() => navigate('/login'), 2000);
      } else if (error.response?.status === 401) {
        errorMessage = '🔑 Phiên đăng nhập đã hết hạn.\n\nVui lòng đăng nhập lại.';
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        setTimeout(() => navigate('/login'), 2000);
      } else if (error.response?.status === 500) {
        errorMessage = '⚠️ Lỗi server: ' + (error.response?.data?.message || 'Vui lòng thử lại sau.');
      } else {
        errorMessage = error.response?.data?.message || error.message || errorMessage;
      }
      
      setError(errorMessage);
      alert(`❌ Lỗi đặt vé:\n\n${errorMessage}`);
    } finally {
      setBookingInProgress(false);
    }
  };

  const formatPrice = (price) => {
    return (price || 0).toLocaleString('vi-VN') + ' VNĐ';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDuration = (schedule) => {
    if (!schedule.departureTime || !schedule.arrivalTime) return '';

    try {
      const depDate = new Date(schedule.departureTime);
      const arrDate = new Date(schedule.arrivalTime);
      const diffMs = arrDate - depDate;

      if (diffMs < 0) return 'N/A';

      const diffHrs = Math.floor(diffMs / 3600000);
      const diffMins = Math.floor((diffMs % 3600000) / 60000);

      return `${diffHrs}h ${diffMins}m`;
    } catch (error) {
      console.error('Error calculating duration:', error);
      return 'N/A';
    }
  };

  if (!searchData) {
    return null;
  }

  return (
    <div className="booking-page min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="back-button flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 font-semibold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại tìm kiếm
        </button>

        <div className="search-info bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="section-title text-2xl font-bold text-gray-800 mb-4">Thông tin chuyến đi</h2>
          <div className="search-details grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-700">
            <div className="detail-item flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-600" />
              <div>
                <p className="detail-label text-sm text-gray-500">Từ</p>
                <p className="detail-value font-semibold">{searchData.departure}</p>
              </div>
            </div>
            <div className="detail-item flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-600" />
              <div>
                <p className="detail-label text-sm text-gray-500">Đến</p>
                <p className="detail-value font-semibold">{searchData.destination}</p>
              </div>
            </div>
            <div className="detail-item flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-600" />
              <div>
                <p className="detail-label text-sm text-gray-500">Ngày đi</p>
                <p className="detail-value font-semibold">{formatDate(searchData.date)}</p>
              </div>
            </div>
          </div>
        </div>

        <h2 className="schedules-title text-3xl font-bold text-gray-800 mb-6">
          Danh sách chuyến tàu
          {searchData.hour && <span className="time-filter text-lg text-gray-600 ml-3">
            ({searchData.hour}:00 - {searchData.hour}:59)
          </span>}
        </h2>
        
        {loading ? (
          <div className="loading-container bg-white rounded-xl shadow-md p-12 text-center">
            <div className="spinner inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent mb-4"></div>
            <p className="loading-text text-xl text-gray-600">Đang tìm kiếm chuyến tàu...</p>
          </div>
        ) : error ? (
          <div className="error-container bg-white rounded-xl shadow-md p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="error-message text-xl text-gray-800 mb-2">Có lỗi xảy ra</p>
            <p className="error-details text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Thử lại
            </button>
          </div>
        ) : availableSchedules.length === 0 ? (
          <div className="no-results bg-white rounded-xl shadow-md p-12 text-center">
            <Train className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="no-results-text text-xl text-gray-600 mb-2">Không tìm thấy chuyến tàu nào</p>
            <p className="no-results-hint text-gray-500 mb-6">
              Vui lòng thử tìm kiếm với các tiêu chí khác
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Tìm kiếm lại
            </button>
          </div>
        ) : (
          <div className="schedules-list space-y-4 mb-12">
            <p className="results-count text-gray-600 mb-4">
              Tìm thấy <span className="font-semibold text-primary-600">{availableSchedules.length}</span> chuyến tàu
            </p>
            {availableSchedules.map((schedule) => (
              <div
                key={schedule.id}
                className={`schedule-card bg-white rounded-xl shadow-md p-6 transition-all duration-200 cursor-pointer ${
                  selectedSchedule?.id === schedule.id
                    ? 'selected ring-2 ring-primary-600 shadow-lg'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => handleScheduleSelect(schedule)}
              >
                <div className="schedule-content flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="train-info flex items-center gap-4">
                    <div className="train-icon bg-primary-100 p-4 rounded-lg">
                      <Train className="w-8 h-8 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="train-number text-2xl font-bold text-gray-800">
                        {schedule.trainNumber}
                      </h3>
                      <div className="route-info flex items-center gap-2 text-gray-600 mt-1">
                        <span className="text-sm">
                          {schedule.departureStation} → {schedule.arrivalStation}
                        </span>
                      </div>
                      <div className="duration-info text-sm text-gray-500 mt-1">
                        Thời gian: {formatDuration(schedule)}
                      </div>
                    </div>
                  </div>

                  <div className="time-info flex items-center gap-8">
                    <div className="departure-time text-center">
                      <p className="time text-3xl font-bold text-gray-800">
                        {schedule.departureTimeOnly || 'N/A'}
                      </p>
                      <p className="station-name text-sm text-gray-500">{schedule.departureStation}</p>
                    </div>
                    <div className="separator text-gray-400 flex items-center gap-2">
                      <div className="arrow">→</div>
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="arrival-time text-center">
                      <p className="time text-3xl font-bold text-gray-800">
                        {schedule.arrivalTimeOnly || 'N/A'}
                      </p>
                      <p className="station-name text-sm text-gray-500">{schedule.arrivalStation}</p>
                    </div>
                  </div>

                  <div className="price-info lg:min-w-[200px] text-center lg:text-right">
                    <p className="price text-3xl font-bold text-primary-600">
                      {formatPrice(schedule.basePrice)}
                    </p>
                    <p className="available-seats text-gray-500 text-sm mt-1">
                      {schedule.availableSeats ? `Còn ${schedule.availableSeats} vé` : 'Còn chỗ'}
                    </p>
                    {selectedSchedule?.id === schedule.id && (
                      <p className="selected-indicator text-primary-600 text-sm font-semibold mt-2">
                        ✓ Đã chọn
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedSchedule && (
          <div id="booking-form" className="booking-form-container bg-white rounded-xl shadow-md p-8">
            <h2 className="form-title text-3xl font-bold text-gray-800 mb-6">Xác nhận đặt vé</h2>

            <div className="user-info bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="info-title text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-600" />
                Thông tin hành khách
              </h3>
              <div className="info-details space-y-2 text-gray-700">
                <p><span className="font-semibold">Họ và tên:</span> {user?.fullName || user?.username}</p>
                <p><span className="font-semibold">Email:</span> {user?.email}</p>
              </div>
            </div>

            <form onSubmit={handleBooking} className="booking-form space-y-6">
              <div className="form-fields">
                <div className="field-group">
                  <label className="field-label block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-primary-600" />
                    Số lượng vé
                  </label>
                  <input
                    type="number"
                    name="numberOfTickets"
                    value={numberOfTickets}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                    min="1"
                    max={selectedSchedule.availableSeats || 10}
                    placeholder="Nhập số lượng vé"
                  />
                  <p className="field-hint text-sm text-gray-500 mt-1">
                    {selectedSchedule.availableSeats 
                      ? `Tối đa ${selectedSchedule.availableSeats} vé` 
                      : 'Tối đa 10 vé mỗi lần đặt'}
                  </p>
                </div>
              </div>

              <div className="booking-summary bg-primary-50 rounded-lg p-6 mt-8">
                <div className="summary-total flex justify-between items-center mb-4">
                  <span className="total-label text-lg font-semibold text-gray-800">Tổng tiền:</span>
                  <span className="total-amount text-3xl font-bold text-primary-600">
                    {formatPrice(selectedSchedule.basePrice * numberOfTickets)}
                  </span>
                </div>
                <div className="summary-details text-sm text-gray-600 space-y-1">
                  <p>Chuyến tàu: {selectedSchedule.trainNumber}</p>
                  <p>Số lượng vé: {numberOfTickets}</p>
                  <p>Giá mỗi vé: {formatPrice(selectedSchedule.basePrice)}</p>
                  <p>Ngày đi: {formatDate(searchData.date)}</p>
                  <p>Giờ khởi hành: {selectedSchedule.departureTimeOnly || 'N/A'}</p>
                </div>
              </div>

              <div className="form-actions flex gap-4 justify-end mt-8">
                <button
                  type="button"
                  onClick={() => setSelectedSchedule(null)}
                  className="btn-secondary"
                  disabled={bookingInProgress}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center gap-2"
                  disabled={bookingInProgress}
                >
                  <CreditCard className="w-5 h-5" />
                  {bookingInProgress ? 'Đang xử lý...' : 'Xác nhận đặt vé'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Booking;
