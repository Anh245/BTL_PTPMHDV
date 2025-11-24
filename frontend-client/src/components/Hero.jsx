import { Search, Calendar, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    departure: '',
    destination: '',
    date: '',
    hour: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchData.departure === searchData.destination) {
      alert('Ga đi và ga đến không thể giống nhau');
      return;
    }
    navigate('/booking', { state: searchData });
  };

  const handleChange = (e) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value
    });
  };

  const popularStations = [
    'Nhổn', 'Minh Khai', 'Phú Diễn','Cầu Diễn', 'Lê Đức Thọ', 'Đại học Quốc gia', 'Chùa Hà','Cầu Giấy'
  ];

  return (
    <section id="home" className="hero-section relative bg-gradient-to-r from-primary-700 to-primary-900 text-white py-20 md:py-32">
      <div className="absolute inset-0 bg-black opacity-40"></div>
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1600&q=80)',
        }}
      ></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="hero-title text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Đặt vé tàu dễ dàng và nhanh chóng
          </h1>
          <p className="hero-subtitle text-xl md:text-2xl text-gray-100 mb-8">
            Hệ thống đặt vé nhanh, an toàn và đáng tin cậy
          </p>
        </div>

        <div className="search-form-container max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* GA ĐI */}
              <div className="form-group">
                <label className="form-label block text-gray-700 font-semibold mb-2 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                  Ga đi
                </label>
                <select
                  name="departure"
                  value={searchData.departure}
                  onChange={handleChange}
                  className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-3
                             text-gray-900 font-semibold focus:border-primary-500
                             focus:ring-2 focus:ring-primary-300 outline-none"
                  required
                >
                  <option value="" disabled>Chọn ga đi</option>
                  {popularStations.map(station => (
                    <option key={station} value={station} className="text-black">
                      {station}
                    </option>
                  ))}
                </select>
              </div>

              {/* GA ĐẾN */}
              <div className="form-group">
                <label className="form-label block text-gray-700 font-semibold mb-2 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                  Ga đến
                </label>
                <select
                  name="destination"
                  value={searchData.destination}
                  onChange={handleChange}
                  className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-3
                             text-gray-900 font-semibold focus:border-primary-500
                             focus:ring-2 focus:ring-primary-300 outline-none"
                  required
                >
                  <option value="" disabled>Chọn ga đến</option>
                  {popularStations.map(station => (
                    <option key={station} value={station} className="text-black">
                      {station}
                    </option>
                  ))}
                </select>
              </div>

              {/* NGÀY ĐI */}
              <div className="form-group">
                <label className="form-label block text-gray-700 font-semibold mb-2 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                  Ngày đi
                </label>
                <input
                  type="date"
                  name="date"
                  value={searchData.date}
                  onChange={handleChange}
                  className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-3
                             text-gray-900 font-semibold focus:border-primary-500
                             focus:ring-2 focus:ring-primary-300 outline-none"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* GIỜ ĐI */}
              <div className="form-group">
                <label className="form-label block text-gray-700 font-semibold mb-2 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                  Giờ đi (tùy chọn)
                </label>
                <select
                  name="hour"
                  value={searchData.hour}
                  onChange={handleChange}
                  className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-3
                             text-gray-900 font-semibold focus:border-primary-500
                             focus:ring-2 focus:ring-primary-300 outline-none"
                >
                  <option value="">Tất cả</option>
                  {Array.from({ length: 17 }, (_, i) => i + 5).map(hour => (
                    <option key={hour} value={hour}>{hour}:00 - {hour}:59</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="search-button-wrapper text-center">
              <button type="submit" className="btn-primary flex items-center justify-center mx-auto gap-2 px-12 py-4 text-lg">
                <Search className="w-5 h-5" />
                Tìm tàu
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Hero;
