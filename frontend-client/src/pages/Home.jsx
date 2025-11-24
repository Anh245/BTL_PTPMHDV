/*
Công nghệ chủ đạo:
ReactJS – framework để xây dựng giao diện người dùng theo dạng component.
JSX – cú pháp giống HTML nằm trong JavaScript.
TailwindCSS – CSS framework tiện lợi

  Trang này gộp các component con lại thành một layout hoàn chỉnh:
 */
import Header from '../shared/components/Header';
import Footer from '../shared/components/Footer';
import Hero from '../components/Hero';
import Features from '../components/Features';
import PopularRoutes from '../components/PopularRoutes';
import Testimonials from '../components/Testimonials';

function Home() {
  return (
    <div className="app-container min-h-screen bg-white">
      <Header />
      <main className="main-content">
        <Hero />
        <Features />
        <PopularRoutes />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}

export default Home;
