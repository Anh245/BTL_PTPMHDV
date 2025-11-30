# CORS Configuration Fix for Gateway

## Vấn Đề
Frontend-client chạy trên port 5174 bị lỗi CORS khi gọi API qua Gateway.

## Giải Pháp Đã Áp Dụng

### 1. Cập Nhật application.yml
Đã thêm cấu hình CORS trong `application.yml`:
```yaml
globalcors:
  add-to-simple-url-handler-mapping: true
  cors-configurations:
    '[/**]':
      allowedOriginPatterns:
        - "http://localhost:5173"  # Admin Dashboard
        - "http://localhost:5174"  # Client Portal
      allowedMethods:
        - GET
        - POST
        - PUT
        - PATCH
        - DELETE
        - OPTIONS
      allowedHeaders:
        - "*"
      exposedHeaders:
        - "*"
      allowCredentials: true
      maxAge: 3600
```

### 2. Tạo CorsConfiguration Class
Đã tạo `config/CorsConfiguration.java` để đảm bảo CORS hoạt động với Spring Cloud Gateway Reactive.

## Cách Restart Gateway

### Windows:
```bash
# Cách 1: Dùng script
cd multie_services/gateway
restart.bat

# Cách 2: Manual
# Stop Gateway (Ctrl+C trong terminal đang chạy)
# Start lại:
mvnw.cmd spring-boot:run
```

### Linux/Mac:
```bash
# Stop Gateway (Ctrl+C)
# Start lại:
cd multie_services/gateway
./mvnw spring-boot:run
```

## Kiểm Tra CORS Hoạt Động

### 1. Test bằng cURL
```bash
# Test preflight request
curl -X OPTIONS http://localhost:8888/api/stations \
  -H "Origin: http://localhost:5174" \
  -H "Access-Control-Request-Method: GET" \
  -v

# Kết quả mong đợi:
# < HTTP/1.1 200 OK
# < Access-Control-Allow-Origin: http://localhost:5174
# < Access-Control-Allow-Credentials: true
```

### 2. Test từ Browser Console
Mở `http://localhost:5174` và chạy trong console:
```javascript
fetch('http://localhost:8888/api/stations', {
  credentials: 'include'
})
  .then(res => res.json())
  .then(data => console.log('Success:', data))
  .catch(err => console.error('Error:', err));
```

### 3. Kiểm Tra Network Tab
1. Mở DevTools (F12)
2. Vào tab Network
3. Reload trang
4. Xem request đến `/api/stations`
5. Kiểm tra Response Headers:
   - `Access-Control-Allow-Origin: http://localhost:5174`
   - `Access-Control-Allow-Credentials: true`

## Troubleshooting

### Vẫn Bị CORS Error?

#### 1. Gateway chưa restart
```bash
# Stop và start lại Gateway
cd multie_services/gateway
# Ctrl+C để stop
mvnw.cmd spring-boot:run
```

#### 2. Cache của browser
```
- Clear browser cache
- Hard reload (Ctrl+Shift+R)
- Hoặc dùng Incognito mode
```

#### 3. Port không đúng
```
- Kiểm tra frontend-client đang chạy port nào
- Cập nhật allowedOriginPatterns nếu cần
```

#### 4. Kiểm tra Gateway logs
```
- Xem terminal đang chạy Gateway
- Tìm log về CORS
- Tìm log về requests từ frontend
```

### Lỗi Thường Gặp

#### "has been blocked by CORS policy"
- Gateway chưa restart sau khi sửa config
- Port trong config không khớp với port frontend

#### "Credentials flag is 'true', but the 'Access-Control-Allow-Credentials' header is ''"
- `allowCredentials: true` chưa được set
- Hoặc `allowedOriginPatterns` dùng wildcard `*` (không được phép với credentials)

#### Preflight request fails
- OPTIONS method chưa được allow
- Gateway chưa xử lý OPTIONS requests đúng

## Xác Nhận Thành Công

Khi CORS hoạt động đúng, bạn sẽ thấy:
1. ✅ Không có lỗi CORS trong console
2. ✅ API requests trả về 200 OK
3. ✅ Response headers có `Access-Control-Allow-Origin`
4. ✅ Frontend hiển thị dữ liệu từ API

## Thêm Origin Mới

Nếu cần thêm origin khác (ví dụ production URL):

1. Sửa `application.yml`:
```yaml
allowedOriginPatterns:
  - "http://localhost:5173"
  - "http://localhost:5174"
  - "https://yourdomain.com"  # Thêm dòng này
```

2. Sửa `CorsConfiguration.java`:
```java
corsConfig.setAllowedOriginPatterns(Arrays.asList(
    "http://localhost:5173",
    "http://localhost:5174",
    "https://yourdomain.com"  // Thêm dòng này
));
```

3. Restart Gateway

## Lưu Ý Bảo Mật

- ⚠️ Không dùng `allowedOrigins: "*"` với `allowCredentials: true`
- ⚠️ Chỉ thêm origins tin cậy
- ⚠️ Trong production, chỉ allow domain chính thức
- ⚠️ Không expose sensitive headers không cần thiết
