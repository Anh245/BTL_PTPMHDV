import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      location: 'Hà Nội',
      rating: 5,
      comment: 'Dịch vụ xuất sắc! Đặt vé nhanh chóng và dễ dàng. Cập nhật thời gian thực giúp tôi nắm bắt thông tin trong suốt hành trình.',
      avatar: 'https://i.pravatar.cc/150?img=12'
    },
    {
      id: 2,
      name: 'Trần Thị B',
      location: 'TP Hồ Chí Minh',
      rating: 5,
      comment: 'Nền tảng rất đáng tin cậy. Tôi đã sử dụng TrainGo cho tất cả các đặt vé tàu của mình. Hỗ trợ khách hàng tuyệt vời!',
      avatar: 'https://i.pravatar.cc/150?img=45'
    },
    {
      id: 3,
      name: 'Lê Văn C',
      location: 'Đà Nẵng',
      rating: 4,
      comment: 'Trải nghiệm tổng thể rất tốt. Giao diện thân thiện với người dùng và quy trình thanh toán an toàn. Rất khuyến khích!',
      avatar: 'https://i.pravatar.cc/150?img=33'
    },
    {
      id: 4,
      name: 'Phạm Thị D',
      location: 'Huế',
      rating: 5,
      comment: 'Dịch vụ đặt vé tàu tốt nhất tôi từng sử dụng. Quy trình hủy vé rất dễ dàng khi tôi cần thay đổi kế hoạch.',
      avatar: 'https://i.pravatar.cc/150?img=47'
    },
    {
      id: 5,
      name: 'Hoàng Văn E',
      location: 'Nha Trang',
      rating: 5,
      comment: 'Dịch vụ ấn tượng với giá cả cạnh tranh. Trải nghiệm trên di động mượt mà và tôi có thể đặt vé mọi lúc mọi nơi.',
      avatar: 'https://i.pravatar.cc/150?img=68'
    },
    {
      id: 6,
      name: 'Võ Thị F',
      location: 'Hải Phòng',
      rating: 4,
      comment: 'Chuyên nghiệp và hiệu quả. Tôi đánh giá cao dịch vụ hỗ trợ khách hàng 24/7 đã giúp tôi giải quyết vấn đề nhanh chóng.',
      avatar: 'https://i.pravatar.cc/150?img=29'
    }
  ];

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section id="testimonials" className="testimonials-section py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="section-header text-center mb-16">
          <h2 className="section-title text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Khách hàng nói gì về chúng tôi
          </h2>
          <p className="section-subtitle text-lg text-gray-600 max-w-2xl mx-auto">
            Tham gia cùng hàng nghìn khách du lịch hài lòng tin tưởng TrainGo
          </p>
        </div>

        <div className="testimonials-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card card relative">
              <Quote className="quote-icon absolute top-4 right-4 w-8 h-8 text-primary-100" />
              
              <div className="customer-info flex items-center mb-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="customer-avatar w-16 h-16 rounded-full object-cover mr-4"
                />
                <div className="customer-details">
                  <h4 className="customer-name font-bold text-gray-800">{testimonial.name}</h4>
                  <p className="customer-location text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </div>

              <div className="rating-stars flex mb-4">
                {renderStars(testimonial.rating)}
              </div>

              <p className="testimonial-text text-gray-600 leading-relaxed">
                "{testimonial.comment}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
