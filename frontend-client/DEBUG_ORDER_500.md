# Debug Order 500 Error

## Vấn Đề
`POST /api/orders/create` trả về 500 Internal Server Error

## Các Nguyên Nhân Có Thể

### 1. Invalid Enum Value ✅ (Đã Fix)
```javascript
// ❌ Sai
paymentMethod: 'direct_booking'

// ✅ Đúng
paymentMethod: 'cash'
```

### 2. Type Mismatch ✅ (Đã Fix)
```javascript
// Đảm bảo đúng type
userRefId: parseInt(user.id),        // Integer
scheduleRefId: parseInt(schedule.id), // Integer
quantity: parseInt(numberOfTickets),  // Integer
totalAmount: parseFloat(totalPrice)   // Number → BigDecimal
```

### 3. Database Constraint Violation

Có thể vi phạm:
- Foreign key constraint
- NOT NULL constraint
- Unique constraint

#### Kiểm Tra Backend Logs

Xem terminal đang chạy orders-service để tìm stack trace:

```
Caused by: java.sql.SQLException: ...
Caused by: org.hibernate.exception.ConstraintViolationException: ...
```

### 4. Missing Required Fields

Kiểm tra tất cả required fields:

```javascript
const orderData = {
  userRefId: user.id,           // Required (NOT NULL)
  scheduleRefId: schedule.id,   // Required (NOT NULL)
  quantity: numberOfTickets,    // Required
  totalAmount: totalPrice,      // Required
  paymentMethod: 'cash'         // Required
};
```

### 5. scheduleInfoSnapshot Format

Có thể JSON string quá dài hoặc có ký tự đặc biệt:

```javascript
// Đảm bảo JSON.stringify đúng
const scheduleInfoSnapshot = JSON.stringify({
  trainNumber: schedule.trainNumber,
  departureStation: schedule.departureStation,
  arrivalStation: schedule.arrivalStation
});

// Kiểm tra length
console.log('Snapshot length:', scheduleInfoSnapshot.length);
```

## Debug Steps

### Step 1: Check Request Data

Thêm log trước khi gửi:

```javascript
console.log('Order data:', JSON.stringify(orderData, null, 2));
```

Verify:
- ✅ Tất cả fields có giá trị
- ✅ Không có `undefined` hoặc `null`
- ✅ Types đúng (number, string)

### Step 2: Check Backend Logs

Xem terminal orders-service:

```
# Tìm stack trace
ERROR ... 
Caused by: ...
```

Common errors:
- `ConstraintViolationException`: Vi phạm constraint
- `DataIntegrityViolationException`: Data không hợp lệ
- `IllegalArgumentException`: Enum value sai

### Step 3: Test với cURL

Test trực tiếp API:

```bash
curl -X POST http://localhost:8888/api/orders/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userRefId": 1,
    "userEmailSnapshot": "test@example.com",
    "scheduleRefId": 1,
    "scheduleInfoSnapshot": "{\"trainNumber\":\"SE1\"}",
    "ticketTypeRefId": 1,
    "ticketTypeNameSnapshot": "Standard",
    "quantity": 1,
    "totalAmount": 500000,
    "paymentMethod": "cash"
  }'
```

### Step 4: Check Database

Verify data tồn tại:

```sql
-- Check user exists
SELECT * FROM users WHERE id = 1;

-- Check schedule exists  
SELECT * FROM schedules WHERE id = 1;

-- Check orders table structure
DESCRIBE orders;

-- Check constraints
SHOW CREATE TABLE orders;
```

### Step 5: Simplify Request

Test với minimal data:

```javascript
const orderData = {
  userRefId: 1,
  scheduleRefId: 1,
  quantity: 1,
  totalAmount: 100000,
  paymentMethod: 'cash'
};
```

Nếu works → Vấn đề ở optional fields
Nếu vẫn lỗi → Vấn đề ở database hoặc backend logic

## Common Fixes

### Fix 1: Ensure Integer Types

```javascript
userRefId: parseInt(user.id) || 0,
scheduleRefId: parseInt(schedule.id) || 0,
quantity: parseInt(numberOfTickets) || 1
```

### Fix 2: Ensure Number for BigDecimal

```javascript
totalAmount: parseFloat(totalPrice) || 0
```

### Fix 3: Handle Null/Undefined

```javascript
userEmailSnapshot: user.email || '',
scheduleInfoSnapshot: scheduleInfoSnapshot || '{}',
ticketTypeNameSnapshot: 'Standard'
```

### Fix 4: Validate Before Send

```javascript
if (!user.id || !selectedSchedule.id) {
  alert('Missing required data');
  return;
}

if (numberOfTickets < 1) {
  alert('Invalid quantity');
  return;
}

if (totalPrice <= 0) {
  alert('Invalid price');
  return;
}
```

## Backend Fixes (If Needed)

### Fix 1: Better Error Handling

```java
@Override
public OrderResponse createOrder(OrderRequest request) {
    try {
        // Validate
        if (request.getUserRefId() == null) {
            throw new IllegalArgumentException("userRefId is required");
        }
        if (request.getScheduleRefId() == null) {
            throw new IllegalArgumentException("scheduleRefId is required");
        }
        
        // Create order
        Order order = new Order();
        // ... mapping
        
        return mapToResponse(orderRepository.save(order));
    } catch (Exception e) {
        log.error("Error creating order", e);
        throw e;
    }
}
```

### Fix 2: Handle Enum Gracefully

```java
try {
    order.setPaymentMethod(Order.PaymentMethod.valueOf(request.getPaymentMethod()));
} catch (IllegalArgumentException | NullPointerException e) {
    // Default to cash instead of throwing error
    order.setPaymentMethod(Order.PaymentMethod.cash);
}
```

### Fix 3: Add Validation

```java
@Data
public class OrderRequest {
    @NotNull(message = "userRefId is required")
    private Integer userRefId;
    
    @NotNull(message = "scheduleRefId is required")
    private Integer scheduleRefId;
    
    @Min(value = 1, message = "quantity must be at least 1")
    private Integer quantity;
    
    @DecimalMin(value = "0.0", message = "totalAmount must be positive")
    private BigDecimal totalAmount;
    
    @Pattern(regexp = "cash|credit_card|ewallet", message = "Invalid payment method")
    private String paymentMethod;
}
```

## Checklist

- [ ] Đã fix enum value (`cash`, `credit_card`, `ewallet`)
- [ ] Đã ensure Integer types với `parseInt()`
- [ ] Đã ensure Number type cho `totalAmount`
- [ ] Đã check backend logs
- [ ] Đã verify user và schedule tồn tại trong DB
- [ ] Đã test với minimal data
- [ ] Đã add console.log để debug
- [ ] Đã check database constraints

## Next Steps

1. **Check backend logs** - Đây là bước quan trọng nhất!
2. **Copy stack trace** và tìm root cause
3. **Fix theo error message** cụ thể
4. **Test lại**

Nếu vẫn lỗi, cung cấp:
- Backend stack trace
- Request data từ console.log
- Database schema của orders table
