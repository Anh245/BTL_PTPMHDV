import { Train, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="footer-section bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="footer-content grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="footer-brand">
            <div className="brand-logo flex items-center space-x-2 mb-4">
              <Train className="w-8 h-8 text-primary-500" />
              <span className="text-2xl font-bold text-white">TrainGo</span>
            </div>
            <p className="brand-description text-gray-400 mb-6">
              Đối tác đáng tin cậy của bạn cho việc đặt vé tàu nhanh, an toàn và đáng tin cậy trên toàn quốc.
            </p>
            <div className="social-links flex space-x-4">
              <a href="#" className="social-icon bg-gray-800 p-2 rounded-full hover:bg-primary-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="social-icon bg-gray-800 p-2 rounded-full hover:bg-primary-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="social-icon bg-gray-800 p-2 rounded-full hover:bg-primary-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="social-icon bg-gray-800 p-2 rounded-full hover:bg-primary-600 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="footer-links">
            <h3 className="footer-heading text-white font-bold text-lg mb-4">Liên kết nhanh</h3>
            <ul className="links-list space-y-3">
              <li>
                <a href="#home" className="footer-link hover:text-primary-500 transition-colors">Trang chủ</a>
              </li>
              <li>
                <a href="#routes" className="footer-link hover:text-primary-500 transition-colors">Tuyến đường</a>
              </li>
              <li>
                <a href="#booking" className="footer-link hover:text-primary-500 transition-colors">Đặt vé</a>
              </li>
              <li>
                <a href="#about" className="footer-link hover:text-primary-500 transition-colors">Về chúng tôi</a>
              </li>
              <li>
                <a href="#faq" className="footer-link hover:text-primary-500 transition-colors">Câu hỏi thường gặp</a>
              </li>
            </ul>
          </div>

          <div className="footer-legal">
            <h3 className="footer-heading text-white font-bold text-lg mb-4">Pháp lý</h3>
            <ul className="links-list space-y-3">
              <li>
                <a href="#terms" className="footer-link hover:text-primary-500 transition-colors">Điều khoản dịch vụ</a>
              </li>
              <li>
                <a href="#privacy" className="footer-link hover:text-primary-500 transition-colors">Chính sách bảo mật</a>
              </li>
              <li>
                <a href="#refund" className="footer-link hover:text-primary-500 transition-colors">Chính sách hoàn tiền</a>
              </li>
              <li>
                <a href="#cookies" className="footer-link hover:text-primary-500 transition-colors">Chính sách cookie</a>
              </li>
            </ul>
          </div>

          <div className="footer-contact">
            <h3 className="footer-heading text-white font-bold text-lg mb-4">Liên hệ chúng tôi</h3>
            <ul className="contact-list space-y-4">
              <li className="contact-item flex items-start">
                <MapPin className="w-5 h-5 mr-3 mt-1 text-primary-500 flex-shrink-0" />
                <span>Tòa nhà CC2, KĐT Đồng Tàu, Phường Hoàng Mai, Hà Nội</span>
              </li>
              <li className="contact-item flex items-start">
                <Phone className="w-5 h-5 mr-3 mt-1 text-primary-500 flex-shrink-0" />
                <span>+84 123 456 789</span>
              </li>
              <li className="contact-item flex items-start">
                <Mail className="w-5 h-5 mr-3 mt-1 text-primary-500 flex-shrink-0" />
                <span>hotro@traingo.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom border-t border-gray-800 pt-8">
          <div className="copyright-wrapper flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="copyright-text text-gray-400 text-sm">
              &copy; {currentYear} TrainGo. Tất cả quyền được bảo lưu.
            </p>
            <p className="payment-methods text-gray-400 text-sm">
              Chúng tôi chấp nhận: Visa, Mastercard, PayPal và nhiều hơn nữa
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
