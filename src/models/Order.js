const axios = require("axios");

// const key = "8ec7fffe5c6d104a15a0232b765a56f6"; // API Key
const key = "b76524e6bfba07def82b5fd9dc3b6108"
const baseURL = "https://indianprovider.com/api/v2";

const OrderModel = {
  createOrder: async (link) => {
    const action = "add";
    const service = 2572;
    const quantity = 10;

    try {
      const response = await axios.post(
        baseURL,
        { key, action, service, link, quantity },
        { headers: { "Content-Type": "application/json" } }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || "Failed to create order");
    }
  },

  getOrderStatus: async (orderId) => {
    try {
      const response = await axios.get(`${baseURL}?key=${key}&action=status&id=${orderId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || "Failed to fetch order status");
    }
  },
};

module.exports = OrderModel;
