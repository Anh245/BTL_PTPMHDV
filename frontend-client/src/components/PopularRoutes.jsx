import { Clock, ArrowRight, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PopularRoutes = () => {
  const navigate = useNavigate();
  const stations = ['Nhổn', 'Minh Khai', 'Phú Diễn', 'Cầu Diễn', 'Lê Đức Thọ', 'Đại học Quốc gia', 'Chùa Hà', 'Cầu Giấy'];

  const calculatePrice = (departure, destination) => {
    const departureIndex = stations.indexOf(departure);
    const destinationIndex = stations.indexOf(destination);
    const distance = Math.abs(destinationIndex - departureIndex);
    
    const basePrice = 9000;
    const pricePerStation = 1000;
    const maxPrice = 15000;
    
    const calculatedPrice = basePrice + (distance - 1) * pricePerStation;
    return Math.min(calculatedPrice, maxPrice);
  };

  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN') + ' VNĐ';
  };

  const routes = [
    {
      id: 1,
      trainName: 'TN0800',
      from: 'Nhổn',
      to: 'Minh Khai',
      departureTime: '08:00',
      arrivalTime: '08:10'
    },
    {
      id: 2,
      trainName: 'TN0910',
      from: 'Phú Diễn',
      to: 'Lê Đức Thọ',
      departureTime: '09:10',
      arrivalTime: '09:20'
    },
    {
      id: 3,
      trainName: 'TN1020',
      from: 'Nhổn',
      to: 'Cầu Diễn',
      departureTime: '10:20',
      arrivalTime: '10:30'
    },
    {
      id: 4,
      trainName: 'TN1330',
      from: 'Minh Khai',
      to: 'Đại học Quốc gia',
      departureTime: '13:30',
      arrivalTime: '13:40'
    },
    {
      id: 5,
      trainName: 'TN1440',
      from: 'Cầu Giấy',
      to: 'Nhổn',
      departureTime: '14:40',
      arrivalTime: '14:50'
    },
    {
      id: 6,
      trainName: 'TN1550',
      from: 'Đại học Quốc gia',
      to: 'Chùa Hà',
      departureTime: '15:50',
      arrivalTime: '16:00'
    },
    {
      id: 7,
      trainName: 'TN1700',
      from: 'Nhổn',
      to: 'Chùa Hà',
      departureTime: '17:00',
      arrivalTime: '17:10'
    },
    {
      id: 8,
      trainName: 'TN1810',
      from: 'Phú Diễn',
      to: 'Cầu Giấy',
      departureTime: '18:10',
      arrivalTime: '18:20'
    }
  ];

  const handleBookNow = (route) => {
    const searchData = {
      departure: route.from,
      destination: route.to,
      date: new Date().toISOString().split('T')[0],
      hour: route.departureTime.split(':')[0]
    };
    navigate('/booking', { state: searchData });
  };

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

        <div className="routes-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {routes.map((route) => {
            const price = calculatePrice(route.from, route.to);
            return (
              <div key={route.id} className="route-card card">
                <div className="route-header mb-4">
                  <h3 className="train-name text-sm font-semibold text-primary-600 mb-3">
                    {route.trainName}
                  </h3>
                  <div className="route-path flex items-center justify-between mb-2">
                    <span className="station-name text-lg font-bold text-gray-800">{route.from}</span>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                    <span className="station-name text-lg font-bold text-gray-800">{route.to}</span>
                  </div>
                </div>

                <div className="route-details space-y-3 mb-6">
                  <div className="time-info flex items-center justify-between text-gray-600">
                    <div className="departure-info">
                      <span className="time-label text-xs text-gray-500">Giờ đi</span>
                      <p className="time-value font-semibold">{route.departureTime}</p>
                    </div>
                    <div className="duration-info flex items-center text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      10 phút
                    </div>
                    <div className="arrival-info text-right">
                      <span className="time-label text-xs text-gray-500">Giờ đến</span>
                      <p className="time-value font-semibold">{route.arrivalTime}</p>
                    </div>
                  </div>

                  <div className="price-info flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="price-wrapper flex items-center">
                      <span className="price-label text-xs text-gray-500 mr-2">Giá vé</span>
                      <span className="price-value text-2xl font-bold text-primary-600">{formatPrice(price)}</span>
                    </div>
                    <span className="availability-badge text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      Còn chỗ
                    </span>
                  </div>
                </div>

                <button 
                  className="book-button btn-primary w-full"
                  onClick={() => handleBookNow(route)}
                >
                  Đặt vé ngay
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PopularRoutes;
