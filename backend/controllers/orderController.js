const Order = require('../models/Order');
const AuditLog = require('../models/AuditLog');

// Utility function to generate a random tracking number
const generateTrackingNumber = () => {
  return 'ORD' + Math.floor(100000 + Math.random() * 900000);
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
  try {
    const { customerName, phoneNumber, address, items, totalAmount } = req.body;

    if (items && items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = new Order({
      customerName,
      phoneNumber,
      address,
      items,
      totalAmount,
      trackingNumber: generateTrackingNumber(),
      isAcknowledged: false, // Starts as false so admin alarm rings!
    });

    const createdOrder = await order.save();

    // Save audit log
    const log = new AuditLog({
      action: 'CREATE_ORDER',
      orderId: createdOrder._id,
      trackingNumber: createdOrder.trackingNumber,
      changedBy: 'customer',
      details: {
        customerName,
        totalAmount,
        itemsCount: items.length
      }
    });
    await log.save();

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
      const oldStatus = order.status;
      order.status = status;
      order.isAcknowledged = true;
      const updatedOrder = await order.save();

      // Save audit log
      const log = new AuditLog({
        action: 'UPDATE_STATUS',
        orderId: order._id,
        trackingNumber: order.trackingNumber,
        changedBy: req.admin?.username || 'admin',
        details: {
          oldStatus,
          newStatus: status
        }
      });
      await log.save();

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

// @desc    Edit order details (Admin)
// @route   PUT /api/orders/:id
// @access  Private/Admin
const editOrder = async (req, res) => {
  try {
    const { customerName, phoneNumber, address, items, totalAmount, status } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      const oldData = {
        customerName: order.customerName,
        phoneNumber: order.phoneNumber,
        address: order.address,
        items: JSON.parse(JSON.stringify(order.items)),
        totalAmount: order.totalAmount,
        status: order.status,
      };

      order.customerName = customerName || order.customerName;
      order.phoneNumber = phoneNumber || order.phoneNumber;
      order.address = address || order.address;
      if (items) order.items = items;
      if (totalAmount !== undefined) order.totalAmount = totalAmount;
      if (status) order.status = status;
      order.isAcknowledged = true;
      order.hasCustomerChanges = false;

      const updatedOrder = await order.save();

      // Save audit log
      const log = new AuditLog({
        action: 'ADMIN_EDIT_ORDER',
        orderId: order._id,
        trackingNumber: order.trackingNumber,
        changedBy: req.admin?.username || 'admin',
        details: {
          old: oldData,
          new: {
            customerName: updatedOrder.customerName,
            phoneNumber: updatedOrder.phoneNumber,
            address: updatedOrder.address,
            items: updatedOrder.items,
            totalAmount: updatedOrder.totalAmount,
            status: updatedOrder.status,
          }
        }
      });
      await log.save();

      // Emit socket event
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

// @desc    Delete an order (Admin)
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      const tracking = order.trackingNumber;
      await Order.findByIdAndDelete(req.params.id);

      // Save audit log
      const log = new AuditLog({
        action: 'DELETE_ORDER',
        trackingNumber: tracking,
        changedBy: req.admin?.username || 'admin',
        details: {
          deletedOrder: {
            customerName: order.customerName,
            phoneNumber: order.phoneNumber,
            address: order.address,
            totalAmount: order.totalAmount,
            items: order.items
          }
        }
      });
      await log.save();

      // Emit socket event
      const io = req.app.get('socketio');
      if (io) {
        io.emit('orderDeleted', req.params.id);
      }

      res.json({ message: 'Order deleted successfully' });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Customer adds items to active pending order
// @route   PUT /api/orders/:id/customer-add-items
// @access  Public
const customerAddItems = async (req, res) => {
  try {
    const { itemsToAdd } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      if (order.status !== 'Pending') {
        return res.status(400).json({ message: 'Order can only be modified while in Pending status.' });
      }

      const oldAmount = order.totalAmount;

      // Add or merge items
      itemsToAdd.forEach(newItem => {
        const existingItemIndex = order.items.findIndex(item => 
          item.menuItem.toString() === newItem.menuItem.toString() && 
          item.version === newItem.version
        );

        if (existingItemIndex > -1) {
          order.items[existingItemIndex].quantity += newItem.quantity;
        } else {
          order.items.push(newItem);
        }
      });

      // Recalculate totalAmount
      const newTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      order.totalAmount = newTotal;
      order.hasCustomerChanges = true;
      order.isAcknowledged = false; // Reset to unticked so alarm sounds again!

      const updatedOrder = await order.save();

      // Save audit log
      const log = new AuditLog({
        action: 'CUSTOMER_ADD_ITEMS',
        orderId: order._id,
        trackingNumber: order.trackingNumber,
        changedBy: 'customer',
        details: {
          addedItems: itemsToAdd,
          oldTotal: oldAmount,
          newTotal: newTotal
        }
      });
      await log.save();

      // Emit socket event
      const io = req.app.get('socketio');
      if (io) {
        io.emit('orderEditedByCustomer', updatedOrder);
      }

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Acknowledge order to stop alarm (Admin)
// @route   PUT /api/orders/:id/acknowledge
// @access  Private/Admin
const acknowledgeOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      const oldStatus = order.status;
      order.isAcknowledged = true;
      if (order.status === 'Pending') {
        order.status = 'Approved';
      }
      const updatedOrder = await order.save();

      // Save audit log
      const log = new AuditLog({
        action: 'ACKNOWLEDGE_ORDER',
        orderId: order._id,
        trackingNumber: order.trackingNumber,
        changedBy: req.admin?.username || 'admin',
        details: {
          oldStatus,
          newStatus: order.status,
          status: 'Acknowledged & Approved'
        }
      });
      await log.save();

      // Emit socket event
      const io = req.app.get('socketio');
      if (io) {
        io.emit('orderAcknowledged', updatedOrder);
      }

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all audit logs (Admin)
// @route   GET /api/orders/logs
// @access  Private/Admin
const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrderByTracking,
  getOrders,
  updateOrderStatus,
  editOrder,
  deleteOrder,
  customerAddItems,
  acknowledgeOrder,
  getAuditLogs
};
