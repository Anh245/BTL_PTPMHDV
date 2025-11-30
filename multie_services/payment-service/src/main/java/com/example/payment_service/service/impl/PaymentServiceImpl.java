package com.example.payment_service.service.impl;

// ... các imports giữ nguyên
import com.example.payment_service.dto.PaymentRequest;
import com.example.payment_service.dto.PaymentResponse;
import com.example.payment_service.entity.PaymentGateway; // Import thêm entity
import com.example.payment_service.entity.Transaction;
import com.example.payment_service.repository.PaymentGatewayRepository; // Import thêm repo
import com.example.payment_service.repository.TransactionRepository;
import com.example.payment_service.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final TransactionRepository transactionRepository;
    private final PaymentGatewayRepository paymentGatewayRepository; // Inject thêm Repository này
    private final RestTemplate restTemplate;

    @Value("${app.services.orders-url}")
    private String ordersServiceUrl;

    @Override
    public PaymentResponse processPayment(PaymentRequest request) {

        // 1. Kiểm tra xem cổng thanh toán có tồn tại và đang active không
        PaymentGateway gateway = null;
        String paymentMethod = request.getPaymentMethod();
        
        // Xử lý đặc biệt cho cash payment (không cần gateway)
        if (!"cash".equalsIgnoreCase(paymentMethod)) {
            gateway = paymentGatewayRepository.findByNameAndIsActiveTrue(paymentMethod)
                    .orElseThrow(() -> new RuntimeException("Cổng thanh toán không hỗ trợ hoặc đang bảo trì: " + paymentMethod));
        }

        // 2. Tạo bản ghi Transaction (Pending)
        Transaction transaction = new Transaction();
        transaction.setOrderId(request.getOrderId());
        transaction.setAmount(request.getAmount());
        transaction.setPaymentMethod(paymentMethod);
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setStatus(Transaction.Status.PENDING);

        // 3. Lưu log Request gửi đi
        String mockRequestLog;
        if (gateway != null) {
            // Có gateway (credit_card, ewallet, etc.)
            mockRequestLog = String.format(
                    "{\"gateway\": \"%s\", \"key\": \"%s\", \"amount\": %s, \"orderInfo\": \"Order %d\"}",
                    gateway.getName(),
                    gateway.getApiKeyPublic(),
                    request.getAmount(),
                    request.getOrderId()
            );
        } else {
            // Cash payment - không cần gateway
            mockRequestLog = String.format(
                    "{\"method\": \"cash\", \"amount\": %s, \"orderInfo\": \"Order %d\"}",
                    request.getAmount(),
                    request.getOrderId()
            );
        }
        transaction.setRequestLog(mockRequestLog);

        // ... Các bước xử lý tiếp theo (Giả lập thanh toán, gọi Orders Service...) giữ nguyên như code cũ
        boolean isPaymentSuccess = true;

        // ... (Giữ nguyên phần còn lại của file gốc)
        if (isPaymentSuccess) {
            transaction.setStatus(Transaction.Status.SUCCESS);
            transaction.setResponseLog("{\"RspCode\":\"00\", \"Message\":\"Confirm Success\"}");
            updateOrderStatus(request.getOrderId());
        } else {
            transaction.setStatus(Transaction.Status.FAILED);
            transaction.setResponseLog("{\"RspCode\":\"99\", \"Message\":\"Fail\"}");
        }

        Transaction saved = transactionRepository.save(transaction);

        PaymentResponse response = new PaymentResponse();
        response.setTransactionId(saved.getId());
        response.setStatus(saved.getStatus().name());
        response.setMessage(isPaymentSuccess ? "Thanh toán thành công" : "Thanh toán thất bại");

        return response;
    }
    private void updateOrderStatus(Integer orderId) {

        try {

            // TODO: Trong production, Orders Service sẽ poll Payment Service để check status
            // Hoặc dùng message queue (Kafka/RabbitMQ) để tránh circular dependency
            
            // TEMPORARY: Comment out để tránh circular call
            // String url = ordersServiceUrl + "/" + orderId + "/confirm";
            // restTemplate.put(url, null);

            System.out.println("Payment processed for Order ID: " + orderId);
            System.out.println("Note: Order status will be updated by Orders Service polling or webhook");

        } catch (Exception e) {

            System.err.println("Lỗi khi gọi Orders Service: " + e.getMessage());

            // TODO: Lưu vào bảng 'failed_notifications' để Retry sau

        }

    }
    // ... (Giữ nguyên hàm updateOrderStatus)
}