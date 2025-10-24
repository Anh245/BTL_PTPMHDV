# 🚉 Hệ thống quản lý ga tàu điện

Hệ thống quản lý ga tàu điện được xây dựng theo mô hình **Service-Oriented Architecture (SOA)** với các microservices độc lập, sử dụng React + Tailwind CSS cho frontend và Node.js + Express + JWT cho backend.

## 🏗️ Kiến trúc hệ thống

### Mô hình SOA (Service-Oriented Architecture)

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Microservices │
│   (React)       │◄──►│   (Express)     │◄──►│   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Redis Cache   │    │   MongoDB       │
                       │   (Session)     │    │   (Database)    │
                       └─────────────────┘    └─────────────────┘
```

### Các Microservices

1. **API Gateway** (Port 3000) - Điểm vào chính, xử lý routing và authentication
2. **Auth Service** (Port 3001) - Quản lý xác thực và phân quyền
3. **Station Service** (Port 3002) - Quản lý thông tin ga tàu
4. **Train Service** (Port 3003) - Quản lý thông tin tàu
5. **Schedule Service** (Port 3004) - Quản lý lịch trình chạy tàu

## 🚀 Tính năng chính

### 🔐 Xác thực và Phân quyền
- Đăng nhập/Đăng ký với JWT
- Phân quyền 3 cấp: Admin, Manager, Operator
- Bảo mật API với middleware JWT

### 🚉 Quản lý Ga tàu
- CRUD operations cho ga tàu
- Thông tin chi tiết: tọa độ, tiện ích, sân ga
- Tìm kiếm và lọc theo thành phố

### 🚂 Quản lý Tàu
- CRUD operations cho tàu
- Phân loại tàu: tốc hành, địa phương, hàng, cao tốc
- Quản lý bảo trì và trạng thái

### 📅 Quản lý Lịch trình
- Tạo và quản lý lịch trình chạy tàu
- Tần suất: hàng ngày, hàng tuần, tùy chỉnh
- Quản lý ghế ngồi và giá vé
- Cập nhật trạng thái real-time

### 📊 Dashboard
- Tổng quan hệ thống
- Thống kê real-time
- Lịch trình hôm nay

## 🛠️ Công nghệ sử dụng

### Frontend
- **React 18** - UI Framework
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **React Query** - State management & API calls
- **React Hook Form** - Form handling
- **Lucide React** - Icons
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Redis** - Caching
- **bcryptjs** - Password hashing

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **Nginx** - Reverse proxy

## 📁 Cấu trúc dự án

```
train-station-management-system/
├── services/                    # Microservices
│   ├── gateway/                # API Gateway
│   │   ├── src/
│   │   │   └── index.js
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── auth-service/           # Authentication Service
│   ├── station-service/        # Station Management Service
│   ├── train-service/          # Train Management Service
│   └── schedule-service/       # Schedule Management Service
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # API services
│   │   └── App.jsx
│   ├── package.json
│   └── Dockerfile
├── database/                   # Database scripts
│   └── init/
│       ├── init.js            # Database initialization
│       └── sample-data.js     # Sample data
├── docker-compose.yml         # Docker orchestration
├── package.json              # Root package.json
└── README.md


## 🚀 Cài đặt và Chạy

### Yêu cầu hệ thống
- Node.js 18+
- Docker & Docker Compose
- Git

## 🌐 Truy cập ứng dụng

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:3000/api
- **MongoDB**: mongodb://localhost:27017
- **Redis**: redis://localhost:6379

## 👥 Tài khoản mặc định

### Admin
- Username: `admin`
- Password: `admin123`
- Role: Admin

### Manager
- Username: `manager1`
- Password: `manager123`
- Role: Manager

### Operator
- Username: `operator1`
- Password: `operator123`
- Role: Operator

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/login          # Đăng nhập
POST /api/auth/register       # Đăng ký
GET  /api/auth/verify         # Xác thực token
GET  /api/auth/users          # Lấy danh sách users (Admin only)
```

### Station Endpoints
```
GET    /api/stations          # Lấy danh sách ga tàu
GET    /api/stations/:id      # Lấy thông tin ga tàu
POST   /api/stations          # Tạo ga tàu mới
PUT    /api/stations/:id      # Cập nhật ga tàu
DELETE /api/stations/:id      # Xóa ga tàu
PATCH  /api/stations/:id/toggle # Chuyển trạng thái
```

### Train Endpoints
```
GET    /api/trains            # Lấy danh sách tàu
GET    /api/trains/:id        # Lấy thông tin tàu
POST   /api/trains            # Tạo tàu mới
PUT    /api/trains/:id        # Cập nhật tàu
DELETE /api/trains/:id        # Xóa tàu
PATCH  /api/trains/:id/status # Cập nhật trạng thái
```

### Schedule Endpoints
```
GET    /api/schedules         # Lấy danh sách lịch trình
GET    /api/schedules/:id     # Lấy thông tin lịch trình
POST   /api/schedules         # Tạo lịch trình mới
PUT    /api/schedules/:id     # Cập nhật lịch trình
PATCH  /api/schedules/:id/status # Cập nhật trạng thái
PATCH  /api/schedules/:id/reserve # Đặt vé


## 🔒 Bảo mật

- JWT tokens với expiration time
- Password hashing với bcrypt
- Rate limiting
- CORS configuration
- Input validation
- SQL injection protection với Mongoose
- XSS protection với helmet

## 📈 Monitoring & Logging

- Morgan logging middleware
- Health check endpoints
- Error handling middleware
- Request/Response logging

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Support

Nếu bạn gặp vấn đề hoặc có câu hỏi, vui lòng tạo issue trên GitHub repository.

## 🎯 Roadmap

- [ ] Real-time notifications với WebSocket
- [ ] Mobile app với React Native
- [ ] Advanced analytics dashboard
- [ ] Integration với payment gateway
- [ ] Multi-language support
- [ ] Advanced reporting system
- [ ] Machine learning cho dự đoán delay
- [ ] Integration với external APIs (weather, traffic)

---

**Được phát triển với ❤️ cho hệ thống quản lý ga tàu điện Việt Nam**

# Website-quan-ly-ga-tau-dien
