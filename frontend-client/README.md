# Frontend Client Portal - Hệ Thống Đặt Vé Tàu

Giao diện người dùng cho hệ thống đặt vé tàu trực tuyến.

## Tính Năng

- 🔐 Đăng ký / Đăng nhập
- 🔍 Tìm kiếm lịch trình tàu
- 🎫 Đặt vé trực tuyến
- 💳 Thanh toán
- 📋 Quản lý vé của tôi
- 👤 Quản lý tài khoản

## Cài Đặt

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build cho production
npm build

# Preview production build
npm run preview
```

## Cấu Hình

Tạo file `.env` trong thư mục gốc:

```env
# API Gateway URL
VITE_API_BASE_URL=http://localhost:8888/api

# Builder.io API Key (nếu sử dụng)
VITE_PUBLIC_BUILDER_KEY=your_builder_key_here
```

## Cấu Trúc Thư Mục

```
frontend-client/
├── src/
│   ├── components/        # Shared components
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── ...
│   ├── features/          # Feature-based modules
│   │   ├── auth/          # Authentication
│   │   ├── booking/       # Booking flow
│   │   ├── tickets/       # Ticket management
│   │   └── account/       # User account
│   ├── pages/             # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Booking.jsx
│   │   ├── MyTickets.jsx
│   │   └── Account.jsx
│   ├── services/          # API services
│   │   ├── authService.js
│   │   ├── trainService.js
│   │   ├── stationService.js
│   │   ├── scheduleService.js
│   │   ├── ticketService.js
│   │   ├── orderService.js
│   │   ├── paymentService.js
│   │   └── index.js
│   ├── stores/            # Zustand state stores
│   │   └── useAuthStore.js
│   ├── lib/               # Utilities
│   │   └── axios.js       # Axios configuration
│   ├── shared/            # Shared utilities
│   ├── App.jsx            # Main app component
│   └── main.jsx           # Entry point
├── .env                   # Environment variables
├── package.json
└── vite.config.js
```

## API Services

Tất cả API services đã được cấu hình sẵn trong `src/services/`:

### Authentication
```javascript
import { authAPI } from '@/services';

// Đăng ký
await authAPI.register({ firstname, lastname, username, email, password });

// Đăng nhập
const { accessToken } = await authAPI.login({ username, password });

// Lấy thông tin user
const user = await authAPI.getCurrentUser();

// Đăng xuất
await authAPI.logout();
```

### Tìm Kiếm & Đặt Vé
```javascript
import { scheduleAPI, ticketAPI, orderAPI, paymentAPI } from '@/services';

// Tìm lịch trình
const schedules = await scheduleAPI.searchSchedules({
  departureStation: 'Hà Nội',
  arrivalStation: 'Sài Gòn',
  date: '2024-12-25'
});

// Đặt vé
const ticket = await ticketAPI.createTicket({
  scheduleId: 1,
  passengerName: 'John Doe',
  passengerEmail: 'john@example.com',
  passengerPhone: '0123456789',
  passengerIdNumber: '123456789',
  seatNumber: 'A1',
  price: 500000
});

// Tạo đơn hàng
const order = await orderAPI.createOrder({
  userId: 1,
  ticketId: ticket.id,
  quantity: 1,
  totalAmount: 500000
});

// Thanh toán
const payment = await paymentAPI.processPayment({
  orderId: order.id,
  amount: 500000,
  paymentMethod: 'CREDIT_CARD',
  gatewayId: 1
});
```

### Quản Lý Vé
```javascript
import { ticketAPI } from '@/services';

// Lấy vé của tôi
const myTickets = await ticketAPI.getMyTickets(userId);

// Xem chi tiết vé
const ticket = await ticketAPI.getTicket(ticketId);
```

## Authentication Flow

Authentication is managed using **Zustand** for state management:

1. User đăng ký/đăng nhập
2. Backend trả về access token
3. Token và user data được lưu trong `localStorage` và Zustand store
4. Refresh token được lưu trong HTTP-only cookie
5. Mọi API request tự động gửi kèm token trong header
6. Khi token hết hạn (401), tự động redirect về login
7. State được restore từ localStorage khi app khởi động

### Using Auth Store

```javascript
import useAuthStore from '@/stores/useAuthStore';

function MyComponent() {
  // Access auth state
  const { user, token, isAuthenticated, isLoading, error } = useAuthStore();
  
  // Access auth actions
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const register = useAuthStore((state) => state.register);
  
  // Use in your component
  const handleLogin = async () => {
    await login({ username: 'user', password: 'pass' });
  };
  
  return <div>{user?.fullName}</div>;
}
```

## Error Handling

Axios interceptor tự động xử lý:
- **401**: Token hết hạn → Xóa token & redirect login
- **403**: Không có quyền
- **404**: Không tìm thấy
- **500**: Lỗi server

## Routing

```javascript
/ - Trang chủ
/login - Đăng nhập
/register - Đăng ký
/booking - Tìm kiếm & đặt vé
/my-tickets - Vé của tôi
/account - Tài khoản
```

## Tech Stack

- **React 18** - UI Framework
- **Vite** - Build tool
- **React Router** - Routing
- **Zustand** - State management
- **Axios** - HTTP client
- **TailwindCSS** - Styling
- **Lucide React** - Icons

## Development

```bash
# Start dev server
npm run dev

# Mở browser tại http://localhost:5174
```

## Production Build

```bash
# Build
npm run build

# Preview
npm run preview
```

## Kết Nối Backend

Frontend này kết nối với backend microservices thông qua API Gateway:

- **Gateway URL**: `http://localhost:8888`
- **API Base**: `http://localhost:8888/api`

Đảm bảo Gateway và các services đang chạy trước khi start frontend.

## Troubleshooting

### CORS Error
- Kiểm tra Gateway đã cấu hình CORS cho `http://localhost:5174`
- Xem file `multie_services/gateway/src/main/resources/application.yml`

### 401 Unauthorized
- Token hết hạn hoặc không hợp lệ
- Đăng nhập lại để lấy token mới

### Connection Refused
- Gateway service chưa chạy
- Kiểm tra Gateway đang chạy tại port 8888

## License

MIT
