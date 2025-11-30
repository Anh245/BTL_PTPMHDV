# API Services Documentation

Thư mục này chứa tất cả các service để giao tiếp với backend API thông qua Gateway.

## Cấu Trúc

- `authService.js` - Xác thực và quản lý người dùng
- `trainService.js` - Quản lý thông tin tàu
- `stationService.js` - Quản lý thông tin ga
- `scheduleService.js` - Quản lý lịch trình tàu
- `ticketService.js` - Quản lý vé tàu
- `orderService.js` - Quản lý đơn hàng
- `paymentService.js` - Xử lý thanh toán
- `index.js` - Export tất cả services

## Cách Sử Dụng

### Import Services

```javascript
// Import từng service
import { authAPI } from '@/services/authService';
import { trainAPI } from '@/services/trainService';

// Hoặc import tất cả từ index
import { authAPI, trainAPI, scheduleAPI } from '@/services';
```

### Ví Dụ Sử Dụng

#### 1. Authentication

```javascript
import { authAPI } from '@/services';

// Đăng ký
const registerUser = async () => {
  try {
    const result = await authAPI.register({
      firstname: 'John',
      lastname: 'Doe',
      username: 'johndoe',
      email: 'john@example.com',
      password: 'password123'
    });
    console.log('Registered:', result);
  } catch (error) {
    console.error('Registration failed:', error);
  }
};

// Đăng nhập
const loginUser = async () => {
  try {
    const result = await authAPI.login({
      username: 'johndoe',
      password: 'password123'
    });
    localStorage.setItem('token', result.accessToken);
    console.log('Logged in:', result);
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Lấy thông tin user hiện tại
const getCurrentUser = async () => {
  try {
    const user = await authAPI.getCurrentUser();
    console.log('Current user:', user);
  } catch (error) {
    console.error('Failed to get user:', error);
  }
};
```

#### 2. Tìm Kiếm Lịch Trình

```javascript
import { scheduleAPI, stationAPI } from '@/services';

// Tìm kiếm lịch trình
const searchSchedules = async () => {
  try {
    const schedules = await scheduleAPI.searchSchedules({
      departureStation: 'Hà Nội',
      arrivalStation: 'Sài Gòn',
      date: '2024-12-25'
    });
    console.log('Found schedules:', schedules);
  } catch (error) {
    console.error('Search failed:', error);
  }
};

// Lấy danh sách ga
const getStations = async () => {
  try {
    const stations = await stationAPI.getActiveStations();
    console.log('Active stations:', stations);
  } catch (error) {
    console.error('Failed to get stations:', error);
  }
};
```

#### 3. Đặt Vé

```javascript
import { ticketAPI, orderAPI, paymentAPI } from '@/services';

// Tạo ticket
const bookTicket = async () => {
  try {
    const ticket = await ticketAPI.createTicket({
      scheduleId: 1,
      passengerName: 'John Doe',
      passengerEmail: 'john@example.com',
      passengerPhone: '0123456789',
      passengerIdNumber: '123456789',
      seatNumber: 'A1',
      price: 500000
    });
    console.log('Ticket created:', ticket);
    return ticket;
  } catch (error) {
    console.error('Booking failed:', error);
  }
};

// Tạo order
const createOrder = async (ticketId) => {
  try {
    const order = await orderAPI.createOrder({
      userId: 1,
      ticketId: ticketId,
      quantity: 1,
      totalAmount: 500000
    });
    console.log('Order created:', order);
    return order;
  } catch (error) {
    console.error('Order creation failed:', error);
  }
};

// Thanh toán
const processPayment = async (orderId) => {
  try {
    const payment = await paymentAPI.processPayment({
      orderId: orderId,
      amount: 500000,
      paymentMethod: 'CREDIT_CARD',
      gatewayId: 1
    });
    console.log('Payment processed:', payment);
  } catch (error) {
    console.error('Payment failed:', error);
  }
};
```

#### 4. Quản Lý Vé Của Tôi

```javascript
import { ticketAPI } from '@/services';

// Lấy vé của user
const getMyTickets = async (userId) => {
  try {
    const tickets = await ticketAPI.getMyTickets(userId);
    console.log('My tickets:', tickets);
  } catch (error) {
    console.error('Failed to get tickets:', error);
  }
};
```

## Error Handling

Tất cả các service đều sử dụng axios interceptor để xử lý lỗi:

- **401 Unauthorized**: Token không hợp lệ hoặc hết hạn → Tự động xóa token và redirect về login
- **403 Forbidden**: Không có quyền truy cập
- **404 Not Found**: Resource không tồn tại
- **500 Internal Server Error**: Lỗi server

```javascript
try {
  const result = await authAPI.login(credentials);
} catch (error) {
  if (error.response) {
    // Server trả về error response
    console.error('Status:', error.response.status);
    console.error('Data:', error.response.data);
  } else if (error.request) {
    // Request được gửi nhưng không nhận được response
    console.error('No response received');
  } else {
    // Lỗi khác
    console.error('Error:', error.message);
  }
}
```

## Authentication Flow

1. User đăng nhập → Nhận access token
2. Token được lưu trong localStorage
3. Mọi request sau đó tự động gửi kèm token trong header `Authorization: Bearer {token}`
4. Refresh token được lưu trong HTTP-only cookie
5. Khi access token hết hạn, gọi `/auth/refresh` để lấy token mới

## Configuration

API base URL được cấu hình trong `.env`:

```env
VITE_API_BASE_URL=http://localhost:8888/api
```

Axios instance được cấu hình trong `lib/axios.js` với:
- Base URL từ environment variable
- Credentials enabled (cho cookies)
- Auto token injection
- Auto error handling
