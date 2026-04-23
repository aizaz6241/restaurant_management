const Order = require('../models/Order');

// Utility function to generate a random tracking number
const generateTrackingNumber = () => {
  return 'ORD' + Math.floor(100000 + Math.random() * 900000);
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
  try {
    const { customerName, phoneNumber, items, totalAmount } = req.body;

    if (items && items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = new Order({
      customerName,
      phoneNumber,
      items,
      totalAmount,
      trackingNumber: generateTrackingNumber(),
    });

    const createdOrder = await order.save();

    // Emit socket event for real-time admin update
    const io = req.app.get('socketio');
    if (io) {
      io.emit('newOrder', createdOrder);
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by tracking number
// @route   GET /api/orders/track/:trackingNumber
// @access  Public
const getOrderByTracking = async (req, res) => {
  try {
    const searchTerm = req.params.trackingNumber;
    const orders = await Order.find({
      $or: [
        { trackingNumber: searchTerm.toUpperCase() },
        { phoneNumber: searchTerm }
      ]
    }).sort({ createdAt: -1 });

    if (orders && orders.length > 0) {
      res.json(orders);
    } else {
      res.status(404).json({ message: 'No orders found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = status;
      const updatedOrder = await order.save();

      // Emit socket event for real-time customer update
      const io = req.app.get('socketio');
      if (io) {
        io.emit('orderStatusUpdated', updatedOrder);
      }

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, getOrderByTracking, getOrders, updateOrderStatus };
