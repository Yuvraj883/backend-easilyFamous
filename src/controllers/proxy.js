import OrderModel from '../models/Order.js'

const OrderController = {
  createOrder: async (req, res) => {
    try {
      // Extract token from request headers
      const token = req.headers.authorization?.split(' ')[1]
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized: Missing token' })
      }

      // Validate the token and extract user details
      let user
      try {
        user = validateToken(token)
      } catch (err) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' })
      }

      const { link } = req.body
      if (!link) {
        return res.status(400).json({ error: "Missing 'link' parameter" })
      }

      // Save the order with userId
      const result = await OrderModel.createOrder(user._id, link)
      res.json({ message: 'Order created successfully', order: result })
    } catch (error) {
      console.error('❌ ERROR:', error.message)
      res
        .status(500)
        .json({ error: 'Internal Server Error', details: error.message })
    }
  },

  getOrderStatus: async (req, res) => {
    try {
      // Extract and validate token
      const token = req.headers.authorization?.split(' ')[1]
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized: Missing token' })
      }

      let user
      try {
        user = validateToken(token)
      } catch (err) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' })
      }

      const { id } = req.query
      if (!id) {
        return res.status(400).json({ error: "Missing 'id' parameter" })
      }

      // Fetch the order status
      const result = await OrderModel.getOrderStatus(id)
      res.json(result)
    } catch (error) {
      console.error('❌ ERROR:', error.message)
      res
        .status(500)
        .json({ error: 'Internal Server Error', details: error.message })
    }
  },
}

export default OrderController
