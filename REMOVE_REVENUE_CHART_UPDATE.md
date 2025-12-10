# Cập nhật: Xóa biểu đồ doanh thu theo trạng thái thanh toán

## Thay đổi đã thực hiện:

### 1. **Loại bỏ biểu đồ doanh thu:**
- ❌ **Biểu đồ doanh thu theo trạng thái thanh toán** (Doughnut Chart)
- ❌ Hàm `createRevenueChart()`
- ❌ Refs và instances liên quan: `revenueChartRef`, `revenueChartInstance`

### 2. **Cập nhật layout:**
- ✅ Điều chỉnh grid layout để biểu đồ còn lại được sắp xếp hợp lý
- ✅ Biểu đồ trạng thái đơn hàng giờ chiếm 2 cột (`lg:col-span-2`)
- ✅ Biểu đồ số vé bán theo ngày vẫn chiếm 2 cột

### 3. **Sửa lỗi code:**
- ✅ Sửa lỗi biến `value` không được sử dụng trong `createDailyTicketsChart`
- ✅ Cập nhật cleanup function để loại bỏ `revenueChartInstance`
- ✅ Cập nhật `createAllCharts()` để không gọi `createRevenueChart()`

## Layout mới:

### **Trước khi xóa (4 biểu đồ):**
```
┌─────────────────┬─────────────────┐
│  Orders Chart   │  Tickets Chart  │
├─────────────────┼─────────────────┤
│  Revenue Chart  │  Status Chart   │
├─────────────────┴─────────────────┤
│      Daily Tickets Chart          │
└───────────────────────────────────┘
```

### **Sau khi xóa (3 biểu đồ):**
```
┌─────────────────┬─────────────────┐
│  Orders Chart   │  Tickets Chart  │
├─────────────────┴─────────────────┤
│        Status Chart               │
├───────────────────────────────────┤
│      Daily Tickets Chart          │
└───────────────────────────────────┘
```

## Code changes:

### **1. Refs và Instances:**
```javascript
// Cũ (5 biểu đồ)
const revenueChartRef = useRef(null);
const revenueChartInstance = useRef(null);

// Mới (4 biểu đồ) - Đã xóa revenue chart refs
```

### **2. Hàm tạo biểu đồ:**
```javascript
// Đã xóa hoàn toàn
const createRevenueChart = () => {
  // ... toàn bộ logic tạo doughnut chart
};
```

### **3. createAllCharts():**
```javascript
// Cũ
const createAllCharts = () => {
  createOrdersChart();
  createTicketsChart();
  createRevenueChart(); // ❌ Đã xóa
  createStatusChart();
  createDailyTicketsChart();
};

// Mới
const createAllCharts = () => {
  createOrdersChart();
  createTicketsChart();
  createStatusChart();
  createDailyTicketsChart();
};
```

### **4. Cleanup function:**
```javascript
// Cũ
[ordersChartInstance, ticketsChartInstance, revenueChartInstance, statusChartInstance, dailyTicketsChartInstance]

// Mới  
[ordersChartInstance, ticketsChartInstance, statusChartInstance, dailyTicketsChartInstance]
```

### **5. Layout JSX:**
```jsx
{/* Đã xóa */}
<div className="bg-white p-6 rounded-lg shadow-md">
  <canvas ref={revenueChartRef}></canvas>
</div>

{/* Status Chart giờ chiếm 2 cột */}
<div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
  <canvas ref={statusChartRef}></canvas>
</div>
```

## Lý do xóa biểu đồ doanh thu:

### **1. Thông tin trùng lặp:**
- Doanh thu đã được hiển thị trong summary cards ở trên
- Biểu đồ doughnut không cung cấp thêm insight mới

### **2. Tối ưu không gian:**
- Giải phóng không gian cho các biểu đồ quan trọng hơn
- Layout gọn gàng và tập trung hơn

### **3. User Experience:**
- Giảm information overload
- Focus vào metrics quan trọng nhất

## Biểu đồ còn lại (3 biểu đồ):

### **1. Đơn hàng theo thời gian (Line Chart)**
- Xu hướng đặt hàng 7 ngày gần nhất
- Quan trọng cho việc theo dõi performance

### **2. Top 5 vé bán chạy (Bar Chart)**  
- Xác định sản phẩm phổ biến
- Hỗ trợ quyết định inventory và marketing

### **3. Trạng thái đơn hàng (Pie Chart)**
- Phân bố trạng thái orders
- Quan trọng cho operations management

### **4. Số vé bán theo ngày (Line Chart)**
- Xu hướng bán hàng hàng ngày trong tháng
- Insights cho planning và forecasting

## Lợi ích sau khi xóa:

### **1. Layout tối ưu:**
- Biểu đồ trạng thái giờ có không gian lớn hơn (2 cột)
- Dễ đọc và tương tác hơn

### **2. Performance:**
- Ít chart instances cần render
- Tải trang nhanh hơn

### **3. Maintainability:**
- Ít code cần maintain
- Ít dependencies và refs

### **4. Focus:**
- Tập trung vào metrics quan trọng nhất
- Không bị phân tán bởi thông tin trùng lặp

## Thông tin doanh thu vẫn có sẵn:

Mặc dù xóa biểu đồ, thông tin doanh thu vẫn được hiển thị đầy đủ trong:

1. **Summary card "Doanh thu":**
   - Tổng doanh thu đã thanh toán
   - Doanh thu chờ thanh toán

2. **Debug panel:**
   - Doanh thu từ API
   - Doanh thu tính từ orders

3. **Daily tickets chart tooltip:**
   - Doanh thu theo ngày khi hover

Việc xóa biểu đồ doanh thu giúp trang Analytics trở nên gọn gàng và tập trung hơn vào những insights quan trọng nhất.