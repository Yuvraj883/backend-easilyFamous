const OrderModel = require("../models/Order");

const OrderController = {
  createOrder: async (req, res) => {
    try {
      const { link } = req.body;
      const result = await OrderModel.createOrder(link);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getOrderStatus: async (req, res) => {
    try {
      const { id } = req.query;
      const result = await OrderModel.getOrderStatus(id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = OrderController;
