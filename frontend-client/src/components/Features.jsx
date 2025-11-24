import { Clock, Shield, Headphones, XCircle } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Clock className="w-12 h-12 text-primary-600" />,
      title: 'Cập nhật lịch trình thời gian thực',
      description: 'Nhận thông báo tức thì về lịch trình tàu, chậm trễ và thay đổi sân ga.'
    },
    {
      icon: <Shield className="w-12 h-12 text-primary-600" />,
      title: 'Thanh toán trực tuyến an toàn',
      description: 'Giao dịch của bạn được bảo vệ với mã hóa và bảo mật cấp ngân hàng.'
    },
    {
      icon: <Headphones className="w-12 h-12 text-primary-600" />,
      title: 'Hỗ trợ khách hàng 24/7',
      description: 'Đội ngũ hỗ trợ tận tâm của chúng tôi luôn sẵn sàng phục vụ bạn mọi lúc.'
    },
    {
      icon: <XCircle className="w-12 h-12 text-primary-600" />,
      title: 'Hủy vé dễ dàng',
      description: 'Hủy hoặc thay đổi đặt chỗ chỉ với vài cú nhấp chuột và nhận hoàn tiền ngay lập tức.'
    }
  ];

  return (
    <section className="features-section py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="section-header text-center mb-16">
          <h2 className="section-title text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Tại sao chọn TrainGo?
          </h2>
          <p className="section-subtitle text-lg text-gray-600 max-w-2xl mx-auto">
            Trải nghiệm dịch vụ đặt vé tàu tốt nhất với các tính năng cao cấp của chúng tôi
          </p>
        </div>

        <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="feature-card card text-center hover:scale-105 transition-transform duration-300">
              <div className="feature-icon-wrapper flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="feature-title text-xl font-bold text-gray-800 mb-3">
                {feature.title}
              </h3>
              <p className="feature-description text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
