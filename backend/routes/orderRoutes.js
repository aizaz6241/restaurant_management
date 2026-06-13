const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderByTracking,
  getOrders,
  updateOrderStatus,
  editOrder,
  deleteOrder,
  customerAddItems,
  acknowledgeOrder,
  getAuditLogs
} = require('../controllers/orderController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.route('/').post(createOrder).get(protectAdmin, getOrders);
router.route('/logs').get(protectAdmin, getAuditLogs);
router.route('/track/:trackingNumber').get(getOrderByTracking);
router.route('/:id/customer-add-items').put(customerAddItems);
router.route('/:id/status').put(protectAdmin, updateOrderStatus);
router.route('/:id/acknowledge').put(protectAdmin, acknowledgeOrder);
router.route('/:id').put(protectAdmin, editOrder).delete(protectAdmin, deleteOrder);

module.exports = router;
