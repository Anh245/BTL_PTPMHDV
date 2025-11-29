package com.example.payment_service.config;

import com.example.payment_service.entity.PaymentGateway;
import com.example.payment_service.repository.PaymentGatewayRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PaymentDataInitializer {

    @Bean
    CommandLineRunner initPaymentGateways(PaymentGatewayRepository repository) {
        return args -> {
            // Kiểm tra nếu chưa có VNPay thì thêm vào
            if (repository.findByNameAndIsActiveTrue("VNPay").isEmpty()) {
                PaymentGateway vnpay = new PaymentGateway();
                vnpay.setName("VNPay");
                vnpay.setApiKeyPublic("vnp_req_public_key_sample"); // Key public ví dụ
                vnpay.setIsActive(true);
                repository.save(vnpay);
                System.out.println("Đã khởi tạo cổng thanh toán: VNPay");
            }

            // Kiểm tra nếu chưa có Momo
            if (repository.findByNameAndIsActiveTrue("Momo").isEmpty()) {
                PaymentGateway momo = new PaymentGateway();
                momo.setName("Momo");
                momo.setApiKeyPublic("momo_req_public_key_sample");
                momo.setIsActive(true);
                repository.save(momo);
                System.out.println("Đã khởi tạo cổng thanh toán: Momo");
            }
        };
    }
}