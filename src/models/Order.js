const mongoose = require("mongoose");
const axios = require("axios");

const key = "8ec7fffe5c6d104a15a0232b765a56f6"; // API Key
const baseURL = "https://indianprovider.com/api/v2";

// Define the schema for orders
const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    orderId: {
      type: String, // Store the order ID received from the API
      required: true,
    },
    status: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);

const OrderModel = {
  createOrder: async (userId, link) => {
    const action = "add";
    const service = 2572;
    const quantity = 10;

    try {
      const response = await axios.post(
        baseURL,
        { key, action, service, link, quantity },
        { headers: { "Content-Type": "application/json" } }
      );

      // Save the order details in MongoDB
      const newOrder = new Order({
        userId,
        link,
        orderId: response.data.order, // Assuming API response contains an order ID
        status: "processing",
      });

      await newOrder.save();
      return newOrder;
    } catch (error) {
      throw new Error(error.response?.data || "Failed to create order");
    }
  },

  getOrderStatus: async (orderId) => {
    try {
      const response = await axios.get(`${baseURL}?key=${key}&action=status&id=${orderId}`);

      // Update order status in the database
      await Order.findOneAndUpdate({ orderId }, { status: response.data.status });

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || "Failed to fetch order status");
    }
  },
};

module.exports = OrderModel;
