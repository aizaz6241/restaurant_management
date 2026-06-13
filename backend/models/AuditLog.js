const mongoose = require('mongoose');

const auditLogSchema = mongoose.Schema(
  {
    action: {
      type: String, // 'CREATE_ORDER', 'ADMIN_EDIT_ORDER', 'CUSTOMER_ADD_ITEMS', 'DELETE_ORDER', 'UPDATE_STATUS', 'ACKNOWLEDGE_ORDER'
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    trackingNumber: {
      type: String,
    },
    changedBy: {
      type: String,
      required: true,
      default: 'system',
    },
    details: {
      type: Object, // details of changes e.g. { customerName: { from: 'old', to: 'new' } }
    },
  },
  {
    timestamps: true,
  }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
