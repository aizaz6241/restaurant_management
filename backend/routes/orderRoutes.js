const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderByTracking,
  getOrders,
  updateOrderStatus,
} = require('../controllers/orderController');

router.route('/').post(createOrder).get(getOrders);
router.route('/track/:trackingNumber').get(getOrderByTracking);
router.route('/:id/status').put(updateOrderStatus);

module.exports = router;
