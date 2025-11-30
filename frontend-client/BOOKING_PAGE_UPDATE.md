# Booking Page Update - Ticket Counting Logic

## Vấn Đề

Trang `/booking` hiển thị sai số vé và giá vé vì:
1. Chỉ dùng data từ Schedule (không có `availableSeats`)
2. Hiển thị `schedule.basePrice` (giá cũ) thay vì `ticket.price` (giá mới)

## Giải Pháp

Cập nhật **TẤT CẢ** methods trong `scheduleService.js` để tự động lấy thông tin từ Tickets:

### 1. `getSchedule(id)` - Single Schedule

```javascript
// Trước: Chỉ trả về schedule
const schedule = await api.get(`/schedules/${id}`);
return schedule.data;

// Sau: Thêm thông tin từ tickets
const schedule = await api.get(`/schedules/${id}`);
const tickets = await api.get('/tickets');

// Tính availableSeats và lấy giá từ tickets
return {
  ...schedule.data,
  availableSeats: totalAvailableSeats,
  basePrice: ticketPrice
};
```

### 2. `searchSchedules(params)` - Search Results

```javascript
// Trước: Chỉ filter schedules
const schedules = await api.get('/schedules');
return schedules.filter(...);

// Sau: Thêm thông tin tickets cho mỗi schedule
const schedules = await api.get('/schedules');
const tickets = await api.get('/tickets');

return schedules.map(schedule => ({
  ...schedule,
  availableSeats: calculateFromTickets(schedule.id),
  basePrice: getPriceFromTickets(schedule.id)
}));
```

### 3. `getAvailableSchedules()` - Popular Routes

Đã được cập nhật trước đó với logic tương tự.

## Flow Hoạt Động

### Trang Home → Booking

```
1. User tìm kiếm: Hà Nội → Sài Gòn, 2025-12-01
   ↓
2. Call searchSchedules({ 
     departureStation: "Hà Nội",
     arrivalStation: "Sài Gòn", 
     date: "2025-12-01" 
   })
   ↓
3. Backend: GET /api/schedules (lấy tất cả)
   ↓
4. Frontend: Filter theo departure, arrival, date
   ↓
5. Frontend: GET /api/tickets (lấy tất cả)
   ↓
6. Frontend: Với mỗi schedule, tính:
   - availableSeats = Σ(totalQuantity - soldQuantity)
   - basePrice = ticket.price (giá mới nhất)
   ↓
7. Hiển thị kết quả với số vé và giá CHÍNH XÁC
```

### Popular Routes → Booking

```
1. User click "Đặt vé ngay" trên Popular Routes
   ↓
2. Navigate to /booking với scheduleId
   ↓
3. Call getSchedule(scheduleId)
   ↓
4. Backend: GET /api/schedules/{id}
   ↓
5. Frontend: GET /api/tickets
   ↓
6. Frontend: Tính availableSeats và lấy giá từ tickets
   ↓
7. Hiển thị schedule với thông tin CHÍNH XÁC
```

## Kết Quả

### Trước

```jsx
// Booking page
<p>Còn chỗ</p>  // Không biết còn bao nhiêu
<p>Giá: 500,000 VNĐ</p>  // Giá cũ từ schedule
```

### Sau

```jsx
// Booking page
<p>Còn 85 vé</p>  // Số vé chính xác từ tickets
<p>Giá: 550,000 VNĐ</p>  // Giá mới admin vừa cập nhật
```

## Performance

### Số API Calls

**Trang Home (Popular Routes)**:
- 1 call: GET /schedules
- 1 call: GET /tickets
- Total: 2 calls

**Trang Booking (Search)**:
- 1 call: GET /schedules
- 1 call: GET /tickets
- Total: 2 calls

**Trang Booking (Direct)**:
- 1 call: GET /schedules/{id}
- 1 call: GET /tickets
- Total: 2 calls

### Optimization (Nếu Cần)

Nếu chậm, có thể:

1. **Cache tickets data**:
```javascript
let cachedTickets = null;
let cacheTime = null;

const getTickets = async () => {
  if (cachedTickets && Date.now() - cacheTime < 60000) {
    return cachedTickets;
  }
  const res = await api.get('/tickets');
  cachedTickets = res.data;
  cacheTime = Date.now();
  return cachedTickets;
};
```

2. **Backend endpoint mới**:
```
GET /api/schedules/with-availability
→ Backend tự động join schedules + tickets
→ Frontend chỉ cần 1 call
```

3. **Lazy loading**:
```javascript
// Load schedules trước
setSchedules(schedulesData);

// Load ticket info sau
enrichWithTicketInfo(schedulesData).then(setSchedules);
```

## Testing

### Test Case 1: Search Schedules

```
Input: Hà Nội → Sài Gòn, 2025-12-01
Expected:
- Hiển thị schedules đúng tuyến và ngày
- Mỗi schedule có availableSeats > 0
- Giá hiển thị = ticket.price (không phải schedule.basePrice)
```

### Test Case 2: Direct Schedule

```
Input: scheduleId = 1
Expected:
- Hiển thị schedule với id = 1
- availableSeats = tổng vé available từ tickets
- Giá = ticket.price
```

### Test Case 3: No Tickets

```
Input: Schedule không có tickets
Expected:
- availableSeats = 0
- Giá = schedule.basePrice (fallback)
- Không crash
```

### Test Case 4: All Sold Out

```
Input: Schedule có tickets nhưng totalQuantity = soldQuantity
Expected:
- availableSeats = 0
- Schedule không hiển thị (filtered out)
```

## Checklist

- [x] Cập nhật `getSchedule(id)`
- [x] Cập nhật `searchSchedules(params)`
- [x] Cập nhật `getAvailableSchedules()`
- [x] Test trên trang Home
- [x] Test trên trang Booking (search)
- [x] Test trên trang Booking (direct)
- [x] Verify số vé hiển thị đúng
- [x] Verify giá hiển thị đúng
- [x] Handle error cases

## Lưu Ý

⚠️ **Quan trọng**: Logic này phụ thuộc vào Tickets API trả về đúng data:
- `scheduleRefId`: Phải match với `schedule.id`
- `totalQuantity`: Tổng số vé
- `soldQuantity`: Số vé đã bán
- `status`: 'active' để đếm vé
- `price`: Giá vé hiện tại

⚠️ **Cache**: Nếu admin cập nhật giá, user cần refresh page để thấy giá mới (hoặc implement auto-refresh).

⚠️ **Performance**: Với nhiều schedules (>100), có thể cần optimize bằng cách cache hoặc backend aggregation.
