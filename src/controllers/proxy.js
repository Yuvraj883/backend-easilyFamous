const OrderModel = require("../models/Order");

const OrderController = {
  createOrder: async (req, res) => {
    try {
      const { link } = req.body;
      if (!link) {
        return res.status(400).json({ error: "Missing 'link' parameter" });
      }
      const result = await OrderModel.createOrder(link);
      res.json(result);
    } catch (error) {
      console.error("❌ ERROR:", error.message);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },

  getOrderStatus: async (req, res) => {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: "Missing 'id' parameter" });
      }
      const result = await OrderModel.getOrderStatus(id);
      res.json(result);
    } catch (error) {
      console.error("❌ ERROR:", error.message);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },
};

module.exports = OrderController;
