# Hệ Thống Quản Lý Đặt Vé Tàu

## Mô Tả Dự Án
Hệ thống quản lý đặt vé tàu với kiến trúc microservices, bao gồm backend (Spring Boot) và frontend (React + Vite).

## Cấu Trúc Dự Án

### Backend - Microservices
- **Gateway Service** (Port 8888): API Gateway điều hướng requests
- **Auth Service** (Port 5001): Xác thực và quản lý người dùng
- **Trains Service** (Port 5002): Quản lý thông tin tàu
- **Stations Service** (Port 5003): Quản lý thông tin ga
- **Tickets Service** (Port 5004): Quản lý vé tàu
- **Schedules Service** (Port 5005): Quản lý lịch trình tàu
- **Orders Service** (Port 5006): Quản lý đơn hàng
- **Payment Service** (Port 5007): Xử lý thanh toán

### Frontend
- **Admin Dashboard** (Port 5173): Giao diện quản trị
- **Client Portal**: Giao diện người dùng

---

## Hướng Dẫn Cài Đặt

### Frontend
```bash
# Cài đặt dependencies
npm install

# Di chuyển vào thư mục frontend
cd frontend

# Chạy development server
npm run dev

# Đăng xuất Builder.io (nếu cần)
npx "@builder.io/cli" logout
```

---

## Tài Liệu API

### Base URL
Tất cả API được truy cập qua Gateway: `http://localhost:8888`

---

## 1. Auth Service - `/api/auth`

### 1.1 Đăng Ký
- **Endpoint**: `POST /api/auth/signup`
- **Mô tả**: Tạo tài khoản người dùng mới
- **Body**:
```json
{
  "username": "string",
  "password": "string",
  "email": "string",
  "firstname": "string",
  "lastname": "string"
}
```
- **Response**: `201 Created` - "Tạo tài khoản thành công, id={userId}"

### 1.2 Đăng Nhập
- **Endpoint**: `POST /api/auth/signin`
- **Mô tả**: Đăng nhập và nhận access token
- **Body**:
```json
{
  "username": "string",
  "password": "string"
}
```
- **Response**: 
```json
{
  "accessToken": "string"
}
```
- **Note**: Refresh token được lưu trong HTTP-only cookie

### 1.3 Đăng Xuất
- **Endpoint**: `POST /api/auth/signout`
- **Mô tả**: Đăng xuất và xóa refresh token
- **Response**: `200 OK` - "Signed out"

### 1.4 Làm Mới Token
- **Endpoint**: `GET /api/auth/refresh`
- **Mô tả**: Lấy access token mới từ refresh token
- **Response**:
```json
{
  "accessToken": "string"
}
```

### 1.5 Thông Tin Người Dùng Hiện Tại
- **Endpoint**: `GET /api/auth/me`
- **Mô tả**: Lấy thông tin người dùng đang đăng nhập
- **Authorization**: Bearer Token
- **Response**:
```json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "firstname": "string",
  "lastname": "string",
  "role": "USER|ADMIN"
}
```

---

## 2. Trains Service - `/api/trains`

### 2.1 Tạo Tàu
- **Endpoint**: `POST /api/trains/create`
- **Quyền**: ADMIN
- **Body**:
```json
{
  "trainNumber": "string",
  "name": "string",
  "type": "string",
  "totalSeats": "number"
}
```

### 2.2 Lấy Danh Sách Tàu
- **Endpoint**: `GET /api/trains`
- **Quyền**: USER, ADMIN
- **Response**: Array of trains

### 2.3 Lấy Thông Tin Tàu
- **Endpoint**: `GET /api/trains/{id}`
- **Quyền**: USER, ADMIN

### 2.4 Cập Nhật Tàu
- **Endpoint**: `PUT /api/trains/{id}`
- **Quyền**: ADMIN

### 2.5 Xóa Tàu
- **Endpoint**: `DELETE /api/trains/{id}`
- **Quyền**: ADMIN

### 2.6 Cập Nhật Trạng Thái Tàu
- **Endpoint**: `PUT /api/trains/{id}/status`
- **Quyền**: ADMIN
- **Body**: `"active"` | `"inactive"` | `"maintenance"`

---

## 3. Stations Service - `/api/stations`

### 3.1 Tạo Ga
- **Endpoint**: `POST /api/stations`
- **Body**:
```json
{
  "name": "string",
  "code": "string",
  "city": "string",
  "address": "string"
}
```

### 3.2 Lấy Danh Sách Ga
- **Endpoint**: `GET /api/stations`

### 3.3 Lấy Thông Tin Ga
- **Endpoint**: `GET /api/stations/{id}`

### 3.4 Cập Nhật Ga
- **Endpoint**: `PUT /api/stations/{id}`

### 3.5 Xóa Ga
- **Endpoint**: `DELETE /api/stations/{id}`

### 3.6 Bật/Tắt Trạng Thái Ga
- **Endpoint**: `PATCH /api/stations/{id}/toggle`
- **Mô tả**: Chuyển đổi trạng thái active/inactive của ga

---

## 4. Schedules Service - `/api/schedules`

### 4.1 Tạo Lịch Trình
- **Endpoint**: `POST /api/schedules/create`
- **Quyền**: ADMIN
- **Body**:
```json
{
  "trainId": "number",
  "departureStationId": "number",
  "arrivalStationId": "number",
  "departureTime": "datetime",
  "arrivalTime": "datetime",
  "price": "number"
}
```

### 4.2 Lấy Danh Sách Lịch Trình
- **Endpoint**: `GET /api/schedules`
- **Quyền**: USER, ADMIN

### 4.3 Lấy Thông Tin Lịch Trình
- **Endpoint**: `GET /api/schedules/{id}`
- **Mô tả**: Cho phép gọi giữa các service (không yêu cầu auth)

### 4.4 Cập Nhật Lịch Trình
- **Endpoint**: `PUT /api/schedules/{id}`
- **Quyền**: ADMIN

### 4.5 Xóa Lịch Trình
- **Endpoint**: `DELETE /api/schedules/{id}`
- **Quyền**: ADMIN

---

## 5. Tickets Service - `/api/tickets`

### 5.1 Tạo Vé
- **Endpoint**: `POST /api/tickets/create`
- **Quyền**: ADMIN
- **Body**:
```json
{
  "scheduleId": "number",
  "seatNumber": "string",
  "price": "number",
  "availableQuantity": "number"
}
```

### 5.2 Lấy Danh Sách Vé
- **Endpoint**: `GET /api/tickets`
- **Quyền**: USER, ADMIN

### 5.3 Lấy Thông Tin Vé
- **Endpoint**: `GET /api/tickets/{id}`
- **Quyền**: USER, ADMIN

### 5.4 Cập Nhật Vé
- **Endpoint**: `PATCH /api/tickets/{id}`
- **Quyền**: ADMIN

### 5.5 Xóa Vé
- **Endpoint**: `DELETE /api/tickets/{id}`
- **Quyền**: ADMIN

### 5.6 Mua Vé
- **Endpoint**: `POST /api/tickets/{id}/purchase`
- **Quyền**: USER, ADMIN
- **Query Params**: `quantity` (default: 1)
- **Mô tả**: Mua số lượng vé cho lịch trình cụ thể

---

## 6. Orders Service - `/api/orders`

### 6.1 Tạo Đơn Hàng
- **Endpoint**: `POST /api/orders/create`
- **Quyền**: USER
- **Body**:
```json
{
  "userId": "number",
  "ticketId": "number",
  "quantity": "number",
  "totalAmount": "number"
}
```

### 6.2 Lấy Danh Sách Đơn Hàng
- **Endpoint**: `GET /api/orders`
- **Quyền**: USER

### 6.3 Lấy Thông Tin Đơn Hàng
- **Endpoint**: `GET /api/orders/{id}`
- **Quyền**: USER

### 6.4 Xóa Đơn Hàng
- **Endpoint**: `DELETE /api/orders/{id}`
- **Quyền**: USER

### 6.5 Xác Nhận Thanh Toán
- **Endpoint**: `PUT /api/orders/{id}/confirm`
- **Mô tả**: Xác nhận đơn hàng đã thanh toán (public endpoint cho inter-service)

---

## 7. Payment Service - `/api/payment`

### 7.1 Xử Lý Thanh Toán
- **Endpoint**: `POST /api/payment/process`
- **Quyền**: USER
- **Body**:
```json
{
  "orderId": "number",
  "amount": "number",
  "paymentMethod": "string",
  "gatewayId": "number"
}
```
- **Mô tả**: Xử lý thanh toán và tự động xác nhận đơn hàng

---

## Phân Quyền

### Roles
- **USER**: Người dùng thông thường - có thể xem thông tin, mua vé, quản lý đơn hàng
- **ADMIN**: Quản trị viên - có toàn quyền CRUD trên tất cả resources

### Authentication
- Sử dụng JWT (JSON Web Token)
- Access Token: Gửi trong header `Authorization: Bearer {token}`
- Refresh Token: Lưu trong HTTP-only cookie
- Token expiration: Access token ngắn hạn, Refresh token dài hạn

---

## CORS Configuration
- Allowed Origin: `http://localhost:5173`
- Allowed Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Credentials: Enabled

---

## Database
Mỗi microservice có database riêng (Database per Service pattern)

---

## Công Nghệ Sử Dụng

### Backend
- Java 17+
- Spring Boot 3.x
- Spring Cloud Gateway
- Spring Security + JWT
- Spring Data JPA
- MySQL/PostgreSQL

### Frontend
- React 18
- Vite
- Zustand (State Management)
- Axios
- TailwindCSS
- Shadcn/ui

---

## Liên Hệ & Đóng Góp

