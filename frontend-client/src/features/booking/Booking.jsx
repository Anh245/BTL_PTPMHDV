import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Train, Clock, Calendar, MapPin, CreditCard, Ticket } from 'lucide-react';
import Header from '../../shared/components/Header';
import Footer from '../../shared/components/Footer';
import { stationAPI } from '../../services/stationService';
import { toast } from 'sonner';

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchData = location.state;

  const [selectedTrain, setSelectedTrain] = useState(null);
  const [numberOfTickets, setNumberOfTickets] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);
  const [stations, setStations] = useState([]);

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

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const data = await stationAPI.getActiveStations();
        setStations(data.map(station => station.name || station.code));
      } catch (error) {
        console.error('Lỗi khi tải danh sách ga:', error);
        setStations([]);
        toast.error('Không thể tải danh sách ga. Vui lòng kiểm tra kết nối backend.');
      }
    };

    fetchStations();
  }, []);

  useEffect(() => {
    if (!searchData) {
      navigate('/');
      return;
    }

    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!user) {
      toast.error('Vui lòng đăng nhập để đặt vé');
      navigate('/login');
      return;
    }
    setCurrentUser(user);
  }, [searchData, navigate]);

  if (!searchData || !currentUser) {
    return null;
  }

  const generateTrains = () => {
    const trains = [];
    const selectedHour = searchData.hour;

    if (!selectedHour) {
      for (let hour = 5; hour <= 21; hour++) {
        for (let minute = 0; minute < 60; minute += 10) {
          const trainNumber = `TN${hour.toString().padStart(2, '0')}${minute.toString().padStart(2, '0')}`;
          const departureTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          
          trains.push({
            id: trainNumber,
            name: trainNumber,
            departure: searchData.departure,
            destination: searchData.destination,
            departureTime: departureTime,
            availableSeats: Math.floor(Math.random() * 50) + 100,
            price: calculatePrice(searchData.departure, searchData.destination)
          });
        }
      }
    } else {
      const hour = parseInt(selectedHour);
      for (let minute = 0; minute < 60; minute += 10) {
        const trainNumber = `TN${hour.toString().padStart(2, '0')}${minute.toString().padStart(2, '0')}`;
        const departureTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        trains.push({
          id: trainNumber,
          name: trainNumber,
          departure: searchData.departure,
          destination: searchData.destination,
          departureTime: departureTime,
          availableSeats: Math.floor(Math.random() * 50) + 100,
          price: calculatePrice(searchData.departure, searchData.destination)
        });
      }
    }

    return trains;
  };

  const availableTrains = generateTrains();

  const handleTrainSelect = (train) => {
    setSelectedTrain(train);
    window.scrollTo({ top: document.getElementById('booking-form').offsetTop - 100, behavior: 'smooth' });
  };

  const handleBooking = (e) => {
    e.preventDefault();
    if (!selectedTrain) {
      toast.error('Vui lòng chọn chuyến tàu');
      return;
    }

    if (numberOfTickets > selectedTrain.availableSeats) {
      toast.error(`Chỉ còn ${selectedTrain.availableSeats} chỗ trống`);
      return;
    }

    const bookingDetails = {
      id: Date.now().toString(),
      train: selectedTrain,
      passenger: {
        fullName: currentUser.fullName,
        username: currentUser.username,
        numberOfTickets: numberOfTickets
      },
      searchData: searchData,
      totalPrice: selectedTrain.price * numberOfTickets,
      bookingDate: new Date().toISOString(),
      status: 'confirmed',
      paidAt: new Date().toISOString()
    };

    const existingBookings = JSON.parse(localStorage.getItem('trainBookings') || '[]');
    existingBookings.push(bookingDetails);
    localStorage.setItem('trainBookings', JSON.stringify(existingBookings));

    toast.success(
      `Đặt vé thành công! Mã đặt vé: ${bookingDetails.id}`,
      {
        description: `${selectedTrain.name} | ${numberOfTickets} vé | ${bookingDetails.totalPrice.toLocaleString('vi-VN')} VNĐ`
      }
    );

    navigate('/my-tickets');
  };

  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN') + ' VNĐ';
  };

  return (
    <div className="booking-page min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại tìm kiếm
        </button>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Thông tin chuyến đi</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-700">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-sm text-gray-500">Từ</p>
                <p className="font-semibold">{searchData.departure}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-sm text-gray-500">Đến</p>
                <p className="font-semibold">{searchData.destination}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-sm text-gray-500">Ngày đi</p>
                <p className="font-semibold">{new Date(searchData.date).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Chọn chuyến tàu
          {searchData.hour && <span className="text-lg text-gray-600 ml-3">
            ({searchData.hour}:00 - {searchData.hour}:59)
          </span>}
        </h2>
        
        {availableTrains.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-xl text-gray-600">Không tìm thấy chuyến tàu nào phù hợp</p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary mt-6"
            >
              Tìm kiếm lại
            </button>
          </div>
        ) : (
          <div className="space-y-4 mb-12">
            {availableTrains.map((train) => (
              <div
                key={train.id}
                className={`bg-white rounded-xl shadow-md p-6 transition-all duration-200 cursor-pointer ${
                  selectedTrain?.id === train.id
                    ? 'ring-2 ring-primary-600 shadow-lg'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => handleTrainSelect(train)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary-100 p-4 rounded-lg">
                      <Train className="w-8 h-8 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{train.name}</h3>
                      <div className="flex items-center gap-2 text-gray-600 mt-1">
                        <Clock className="w-4 h-4" />
                        <span>10 phút</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-800">{train.departureTime}</p>
                      <p className="text-sm text-gray-500">{train.departure}</p>
                    </div>
                    <div className="text-gray-400">→</div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-800">{(() => {
                        const [hours, minutes] = train.departureTime.split(':').map(Number);
                        const totalMinutes = hours * 60 + minutes + 10;
                        const arrivalHours = Math.floor(totalMinutes / 60) % 24;
                        const arrivalMinutes = totalMinutes % 60;
                        return `${arrivalHours.toString().padStart(2, '0')}:${arrivalMinutes.toString().padStart(2, '0')}`;
                      })()}</p>
                      <p className="text-sm text-gray-500">{train.destination}</p>
                    </div>
                  </div>

                  <div className="lg:min-w-[200px] text-center lg:text-right">
                    <p className="text-3xl font-bold text-primary-600">{formatPrice(train.price)}</p>
                    <p className="text-gray-500 text-sm mt-1">Còn {train.availableSeats} chỗ</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTrain && (
          <div id="booking-form" className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Thông tin đặt vé</h2>
            
            <div className="bg-primary-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Thông tin hành khách</h3>
              <div className="space-y-2 text-gray-700">
                <p><span className="font-semibold">Họ và tên:</span> {currentUser.fullName}</p>
                <p><span className="font-semibold">Tên đăng nhập:</span> {currentUser.username}</p>
              </div>
            </div>

            <form onSubmit={handleBooking} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-primary-600" />
                  Số lượng vé
                </label>
                <input
                  type="number"
                  value={numberOfTickets}
                  onChange={(e) => setNumberOfTickets(parseInt(e.target.value))}
                  className="input-field"
                  required
                  min="1"
                  max={selectedTrain.availableSeats}
                  placeholder="Nhập số lượng vé"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Tối đa {selectedTrain.availableSeats} vé
                </p>
              </div>

              <div className="bg-primary-50 rounded-lg p-6 mt-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-gray-800">Tổng tiền:</span>
                  <span className="text-3xl font-bold text-primary-600">
                    {formatPrice(selectedTrain.price * numberOfTickets)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Chuyến tàu: {selectedTrain.name}</p>
                  <p>Số lượng vé: {numberOfTickets}</p>
                  <p>Giá mỗi vé: {formatPrice(selectedTrain.price)}</p>
                  <p>Ngày đi: {new Date(searchData.date).toLocaleDateString('vi-VN')}</p>
                  <p>Giờ khởi hành: {selectedTrain.departureTime}</p>
                </div>
              </div>

              <div className="flex gap-4 justify-end mt-8">
                <button
                  type="button"
                  onClick={() => setSelectedTrain(null)}
                  className="btn-secondary"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Xác nhận đặt vé
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
