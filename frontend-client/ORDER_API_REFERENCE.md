# Order API Reference

## Create Order Endpoint

`POST /api/orders/create`

### Request Body

```json
{
  "userRefId": 1,
  "userEmailSnapshot": "user@example.com",
  "scheduleRefId": 1,
  "scheduleInfoSnapshot": "{\"trainNumber\":\"SE1\",\"departureStation\":\"Hà Nội\"}",
  "ticketTypeRefId": 1,
  "ticketTypeNameSnapshot": "Standard",
  "quantity": 2,
  "totalAmount": 1000000,
  "paymentMethod": "cash"
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userRefId` | Integer | Yes | ID của user đặt vé |
| `userEmailSnapshot` | String | No | Email của user (snapshot) |
| `scheduleRefId` | Integer | Yes | ID của schedule |
| `scheduleInfoSnapshot` | String (JSON) | No | Thông tin schedule dạng JSON string |
| `ticketTypeRefId` | Integer | No | ID loại vé |
| `ticketTypeNameSnapshot` | String | No | Tên loại vé (snapshot) |
| `quantity` | Integer | Yes | Số lượng vé |
| `totalAmount` | BigDecimal | Yes | Tổng tiền |
| `paymentMethod` | Enum | Yes | Phương thức thanh toán |

### Enum Values

#### PaymentMethod

**Valid values**:
- `cash` - Tiền mặt
- `credit_card` - Thẻ tín dụng
- `ewallet` - Ví điện tử

**Invalid values** (will cause 500 error):
- ❌ `direct_booking`
- ❌ `bank_transfer`
- ❌ Any other string

#### PaymentStatus (Auto-set by backend)

- `pending` - Chờ thanh toán (default)
- `paid` - Đã thanh toán
- `failed` - Thanh toán thất bại
- `refunded` - Đã hoàn tiền

#### OrderStatus (Auto-set by backend)

- `created` - Đơn hàng mới tạo (default)
- `confirmed` - Đã xác nhận
- `cancelled` - Đã hủy

### Response

```json
{
  "id": 1,
  "userRefId": 1,
  "userEmailSnapshot": "user@example.com",
  "scheduleRefId": 1,
  "scheduleInfoSnapshot": "{\"trainNumber\":\"SE1\"}",
  "ticketTypeRefId": 1,
  "ticketTypeNameSnapshot": "Standard",
  "quantity": 2,
  "totalAmount": 1000000,
  "paymentMethod": "cash",
  "paymentStatus": "pending",
  "orderStatus": "created",
  "createdAt": "2025-11-29T10:08:54"
}
```

## Error Cases

### 500 Internal Server Error

**Cause**: Invalid enum value

```json
{
  "paymentMethod": "direct_booking"  // ❌ Not a valid enum
}
```

**Solution**: Use valid enum value

```json
{
  "paymentMethod": "cash"  // ✅ Valid
}
```

### 400 Bad Request

**Cause**: Missing required fields

```json
{
  "userRefId": 1
  // Missing scheduleRefId, quantity, totalAmount, paymentMethod
}
```

**Solution**: Include all required fields

## Frontend Usage

### Correct Implementation

```javascript
const orderData = {
  userRefId: user.id,
  userEmailSnapshot: user.email,
  scheduleRefId: selectedSchedule.id,
  scheduleInfoSnapshot: JSON.stringify({
    trainNumber: selectedSchedule.trainNumber,
    departureStation: selectedSchedule.departureStation,
    arrivalStation: selectedSchedule.arrivalStation
  }),
  ticketTypeRefId: 1,
  ticketTypeNameSnapshot: 'Standard',
  quantity: numberOfTickets,
  totalAmount: selectedSchedule.basePrice * numberOfTickets,
  paymentMethod: 'cash' // ✅ Valid enum value
};

const order = await orderAPI.createOrder(orderData);
```

### Payment Method Selection

If you want to let users choose payment method:

```javascript
const paymentMethods = [
  { value: 'cash', label: 'Tiền mặt' },
  { value: 'credit_card', label: 'Thẻ tín dụng' },
  { value: 'ewallet', label: 'Ví điện tử' }
];

// In component
<select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
  {paymentMethods.map(method => (
    <option key={method.value} value={method.value}>
      {method.label}
    </option>
  ))}
</select>

// In submit
const orderData = {
  // ... other fields
  paymentMethod: paymentMethod // Will be 'cash', 'credit_card', or 'ewallet'
};
```

## Database Schema

```sql
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_ref_id INT NOT NULL,
  user_email_snapshot VARCHAR(100),
  schedule_ref_id INT NOT NULL,
  schedule_info_snapshot JSON,
  ticket_type_ref_id INT,
  ticket_type_name_snapshot VARCHAR(50),
  quantity INT,
  total_amount DECIMAL(10,2),
  payment_method ENUM('cash', 'credit_card', 'ewallet'),
  payment_status ENUM('pending', 'paid', 'failed', 'refunded'),
  order_status ENUM('created', 'confirmed', 'cancelled'),
  created_at DATETIME
);
```

## Common Mistakes

### ❌ Wrong

```javascript
paymentMethod: 'direct_booking'  // Not in enum
paymentMethod: 'CASH'            // Case sensitive, should be lowercase
paymentMethod: 'card'            // Should be 'credit_card'
paymentMethod: 'wallet'          // Should be 'ewallet'
```

### ✅ Correct

```javascript
paymentMethod: 'cash'
paymentMethod: 'credit_card'
paymentMethod: 'ewallet'
```

## Testing

### Test Case 1: Create Order with Cash

```javascript
const orderData = {
  userRefId: 1,
  scheduleRefId: 1,
  quantity: 2,
  totalAmount: 1000000,
  paymentMethod: 'cash'
};

const order = await orderAPI.createOrder(orderData);
expect(order.paymentMethod).toBe('cash');
expect(order.paymentStatus).toBe('pending');
expect(order.orderStatus).toBe('created');
```

### Test Case 2: Create Order with Credit Card

```javascript
const orderData = {
  userRefId: 1,
  scheduleRefId: 1,
  quantity: 1,
  totalAmount: 500000,
  paymentMethod: 'credit_card'
};

const order = await orderAPI.createOrder(orderData);
expect(order.paymentMethod).toBe('credit_card');
```

### Test Case 3: Invalid Payment Method (Should Fail)

```javascript
const orderData = {
  userRefId: 1,
  scheduleRefId: 1,
  quantity: 1,
  totalAmount: 500000,
  paymentMethod: 'invalid_method'
};

await expect(orderAPI.createOrder(orderData)).rejects.toThrow();
```

## Notes

- Backend có fallback: Nếu `paymentMethod` invalid, sẽ default về `cash`
- `scheduleInfoSnapshot` là JSON string, không phải object
- `totalAmount` phải là số, không phải string
- Tất cả enum values đều **lowercase**
