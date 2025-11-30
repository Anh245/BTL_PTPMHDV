import api from "../lib/axios";

export const orderAPI = {
  // Create a new order
  createOrder: async (orderData) => {
    const res = await api.post('/orders/create', orderData);
    return res.data;
  },

  // Get all orders
  getOrders: async () => {
    const res = await api.get('/orders');
    return res.data;
  },

  // Get order by ID
  getOrder: async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  // Confirm payment for an order
  confirmPayment: async (id) => {
    const res = await api.put(`/orders/${id}/confirm`);
    return res.data;
  },

  // Delete order
  deleteOrder: async (id) => {
    const res = await api.delete(`/orders/${id}`);
    return res.data;
  },

  // Get orders by user ID
  getUserOrders: async (userId) => {
    const res = await api.get(`/orders/user/${userId}`);
    return res.data;
  },

  // Cancel order (userId is extracted from JWT token by backend)
  cancelOrder: async (orderId) => {
    const res = await api.put(`/orders/${orderId}/cancel`);
    return res.data;
  }
};
