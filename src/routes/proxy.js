import express from 'express'
import OrderController from '../controllers/proxy.js'

const router = express.Router()

router.post('/create', OrderController.createOrder) // POST: Create Order
router.get('/status', OrderController.getOrderStatus) // GET: Check Order Status

export default router
