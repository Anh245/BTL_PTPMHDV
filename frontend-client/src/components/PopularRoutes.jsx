// Component PopularRoutes - Hiển thị các tuyến đường phổ biến
// Lấy schedules từ API thay vì dữ liệu cố định
import { Clock, ArrowRight, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { scheduleAPI } from '../services/scheduleService';

const PopularRoutes = () => {
  const navigate = useNavigate();
  
  // State để lưu schedules từ API
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy danh sách schedules khi component mount
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        // Lấy schedules available (đang hoạt động và còn chỗ)
        const data = await scheduleAPI.getAvailableSchedules();
        // Lấy tối đa 8 schedules để hiển thị
        setSchedules(data.slice(0, 8));
      } catch (error) {
        console.error('Lỗi khi tải danh sách lịch trình:', error);
        // Nếu API lỗi, để m���ng rỗng hoặc có thể dùng fallback data
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  const handleBookNow = (schedule) => {
    const departureDate = schedule.departureTime
      ? new Date(schedule.departureTime).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    const searchData = {
      departure: schedule.departureStation,
      destination: schedule.arrivalStation,
      date: departureDate,
      scheduleId: schedule.id
    };
    navigate('/booking', { state: searchData });
  };

  const formatPrice = (price) => {
    return (price || 0).toLocaleString('vi-VN') + ' VNĐ';
  };

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    try {
      const date = new Date(dateTimeString);
      return date.toTimeString().slice(0, 5);
    } catch {
      return 'N/A';
    }
  };

  const calculateDuration = (departureTime, arrivalTime) => {
    if (!departureTime || !arrivalTime) return 'N/A';

    try {
      const depDate = new Date(departureTime);
      const arrDate = new Date(arrivalTime);
      const diffMs = arrDate - depDate;

      if (diffMs < 0) return 'N/A';

      const diffHrs = Math.floor(diffMs / 3600000);
      const diffMins = Math.floor((diffMs % 3600000) / 60000);

      if (diffHrs === 0) {
        return `${diffMins} phút`;
      } else {
        return diffMins > 0 ? `${diffHrs} giờ ${diffMins} phút` : `${diffHrs} giờ`;
      }
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <section id="routes" className="routes-section py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="section-header text-center mb-16">
            <h2 className="section-title text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Tuyến đường phổ biến
            </h2>
            <p className="section-subtitle text-lg text-gray-600 max-w-2xl mx-auto">
              Đang tải dữ liệu...
            </p>
          </div>
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="routes" className="routes-section py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="section-header text-center mb-16">
          <h2 className="section-title text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Tuyến đường phổ biến
          </h2>
          <p className="section-subtitle text-lg text-gray-600 max-w-2xl mx-auto">
            Khám phá các tuyến đường được lựa chọn nhiều nhất với giá cả cạnh tranh
          </p>
        </div>

        {schedules.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              Hiện chưa có lịch trình nào. Vui lòng quay lại sau.
            </p>
          </div>
        ) : (
          <div className="routes-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {schedules.map((schedule) => {
              const duration = calculateDuration(schedule.departureTime, schedule.arrivalTime);

              return (
                <div key={schedule.id} className="route-card card">
                  <div className="route-header mb-4">
                    <h3 className="train-name text-sm font-semibold text-primary-600 mb-3">
                      {schedule.trainNumber || 'TN' + schedule.id}
                    </h3>
                    <div className="route-path flex items-center justify-between mb-2">
                      <span className="station-name text-lg font-bold text-gray-800">
                        {schedule.departureStation}
                      </span>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                      <span className="station-name text-lg font-bold text-gray-800">
                        {schedule.arrivalStation}
                      </span>
                    </div>
                  </div>

                  <div className="route-details space-y-3 mb-6">
                    <div className="time-info flex items-center justify-between text-gray-600">
                      <div className="departure-info">
                        <span className="time-label text-xs text-gray-500">Giờ đi</span>
                        <p className="time-value font-semibold">
                          {formatTime(schedule.departureTime)}
                        </p>
                      </div>
                      <div className="duration-info flex items-center text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        {duration}
                      </div>
                      <div className="arrival-info text-right">
                        <span className="time-label text-xs text-gray-500">Giờ đến</span>
                        <p className="time-value font-semibold">
                          {formatTime(schedule.arrivalTime)}
                        </p>
                      </div>
                    </div>

                    <div className="price-info flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="price-wrapper flex items-center">
                        <span className="price-label text-xs text-gray-500 mr-2">Giá vé</span>
                        <span className="price-value text-2xl font-bold text-primary-600">
                          {formatPrice(schedule.basePrice)}
                        </span>
                      </div>
                      <span className="availability-badge text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        {schedule.availableSeats ? `Còn ${schedule.availableSeats} vé` : 'Còn chỗ'}
                      </span>
                    </div>
                  </div>

                  <button
                    className="book-button btn-primary w-full"
                    onClick={() => handleBookNow(schedule)}
                  >
                    Đặt vé ngay
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularRoutes;
