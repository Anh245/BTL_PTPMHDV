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

        // 1. [MỚI] Kiểm tra xem cổng thanh toán có tồn tại và đang active không
        // Method findByNameAndIsActiveTrue đã có sẵn trong file repository bạn upload
        PaymentGateway gateway = paymentGatewayRepository.findByNameAndIsActiveTrue(request.getPaymentMethod())
                .orElseThrow(() -> new RuntimeException("Cổng thanh toán không hỗ trợ hoặc đang bảo trì: " + request.getPaymentMethod()));

        // 2. Tạo bản ghi Transaction (Pending)
        Transaction transaction = new Transaction();
        transaction.setOrderId(request.getOrderId());
        transaction.setAmount(request.getAmount());
        transaction.setPaymentMethod(gateway.getName()); // Lấy tên chuẩn từ DB
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setStatus(Transaction.Status.PENDING);

        // 3. Lưu log Request gửi đi
        // Giả lập việc dùng ApiKeyPublic từ DB để gửi sang đối tác
        String mockRequestLog = String.format(
                "{\"gateway\": \"%s\", \"key\": \"%s\", \"amount\": %s, \"orderInfo\": \"Order %d\"}",
                gateway.getName(),
                gateway.getApiKeyPublic(), // Dùng key lấy từ DB để log minh họa
                request.getAmount(),
                request.getOrderId()
        );
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

            // Giả sử Orders Service có endpoint nội bộ: PUT /api/orders/{id}/internal/confirm-payment

            // Cần truyền token nội bộ hoặc cấu hình bảo mật để cho phép Payment Service gọi

            // Ở đây demo gọi trực tiếp (Cần bổ sung endpoint bên Orders Service)

            String url = ordersServiceUrl + "/" + orderId + "/confirm";

            restTemplate.put(url, null); // <--- BỎ COMMENT DÒNG NÀY

            // restTemplate.put(url, null); // Uncomment khi Orders Service đã có API này

            System.out.println("Đã gọi update Order ID: " + orderId + " sang trạng thái PAID");

        } catch (Exception e) {

            System.err.println("Lỗi khi gọi Orders Service: " + e.getMessage());

            // TODO: Lưu vào bảng 'failed_notifications' để Retry sau

        }

    }
    // ... (Giữ nguyên hàm updateOrderStatus)
}