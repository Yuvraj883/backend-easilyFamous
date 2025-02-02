const express = require("express");
const OrderController = require("../controllers/proxy");

const router = express.Router();

router.post("/create", OrderController.createOrder); // POST: Create Order
router.get("/status", OrderController.getOrderStatus); // GET: Check Order Status

module.exports = router;
