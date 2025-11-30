// Service để xử lý payment (thanh toán)
// Kết nối với payment-service qua API Gateway
import api from "../lib/axios";

export const paymentAPI = {
  // Xử lý thanh toán
  // Input: { orderId, amount, paymentMethod, gatewayId }
  // Output: Payment response with status
  processPayment: async (paymentData) => {
    const res = await api.post('/payment/process', paymentData);
    return res.data;
  },

  // Lấy thông tin payment theo order ID
  // Input: order ID
  // Output: Payment object
  getPaymentByOrder: async (orderId) => {
    const res = await api.get(`/payment/order/${orderId}`);
    return res.data;
  },

  // Lấy lịch sử thanh toán của user
  // Output: Array of payments
  getPaymentHistory: async () => {
    const res = await api.get('/payment/history');
    return res.data;
  }
};
