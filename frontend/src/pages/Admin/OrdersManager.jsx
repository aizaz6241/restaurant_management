import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { FiCheck, FiEdit2, FiTrash2, FiX, FiPlus, FiAlertCircle } from 'react-icons/fi';
import { API_BASE_URL } from '../../config';
import api from '../../utils/api';

const statusOptions = ['Pending', 'Approved', 'Preparing', 'On the Way', 'Delivered', 'Cancelled'];

const OrdersManager = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('All');
  
  // Modals state
  const [editOrder, setEditOrder] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/api/orders');
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    fetchOrders();

    const socket = io(API_BASE_URL);
    
    socket.on('newOrder', (newOrder) => {
      setOrders(prev => {
        if (prev.some(o => o._id === newOrder._id)) return prev;
        return [newOrder, ...prev];
      });
    });

    socket.on('orderEditedByCustomer', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    socket.on('orderStatusUpdated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    socket.on('orderAcknowledged', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    socket.on('orderDeleted', (deletedId) => {
      setOrders(prev => prev.filter(o => o._id !== deletedId));
    });

    return () => socket.disconnect();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const { data } = await api.put(`/api/orders/${id}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o._id === id ? data : o));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      const { data } = await api.put(`/api/orders/${id}/acknowledge`);
      setOrders(prev => prev.map(o => o._id === id ? data : o));
    } catch (error) {
      console.error('Error acknowledging order:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/api/orders/${deleteId}`);
      setOrders(prev => prev.filter(o => o._id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editOrder) return;
    try {
      // Recalculate total amount from items list
      const recalculatedTotal = editOrder.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
      
      const payload = {
        customerName: editOrder.customerName,
        phoneNumber: editOrder.phoneNumber,
        address: editOrder.address,
        items: editOrder.items,
        totalAmount: recalculatedTotal
      };
      
      const { data } = await api.put(`/api/orders/${editOrder._id}`, payload);
      setOrders(prev => prev.map(o => o._id === editOrder._id ? data : o));
      setEditOrder(null);
    } catch (error) {
      console.error('Error saving order edits:', error);
    }
  };

  const updateEditItemQty = (index, newQty) => {
    if (!editOrder) return;
    const updatedItems = [...editOrder.items];
    if (newQty <= 0) {
      updatedItems.splice(index, 1); // remove item if qty is 0
    } else {
      updatedItems[index].quantity = parseInt(newQty, 10);
    }
    setEditOrder({
      ...editOrder,
      items: updatedItems
    });
  };

  const deleteEditItem = (index) => {
    if (!editOrder) return;
    const updatedItems = [...editOrder.items];
    updatedItems.splice(index, 1);
    setEditOrder({
      ...editOrder,
      items: updatedItems
    });
  };

  const filteredOrders = filter === 'All' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Manage Orders</h1>
        <select 
          className="input-field" 
          style={{ width: '200px' }} 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All Orders</option>
          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="table-container" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Tracking ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => {
              const isUnread = !order.isAcknowledged && order.status === 'Pending';
              return (
                <tr key={order._id} className={isUnread ? 'unread-order-row' : ''}>
                  <td>
                    <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {order.trackingNumber}
                      {order.hasCustomerChanges && (
                        <span className="badge badge-customer-edit" style={{ fontSize: '0.65rem', padding: '0.2rem 0.4rem' }}>
                          Items Added
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 'bold' }}>{order.customerName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.phoneNumber}</div>
                    {order.address && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '0.35rem', fontStyle: 'italic', background: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border)', maxWidth: '220px', whiteSpace: 'normal' }}>
                        <strong>Loc:</strong> {order.address}
                      </div>
                    )}
                  </td>
                  <td>
                    {order.items.map(item => (
                      <div key={item._id} style={{ fontSize: '0.85rem' }}>
                        {item.quantity}x {item.name} {item.version && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({item.version})</span>}
                      </div>
                    ))}
                  </td>
                  <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>AED {order.totalAmount.toFixed(2)}</td>
                  <td>{new Date(order.createdAt).toLocaleString()}</td>
                  <td>
                    <span className={`badge badge-${order.status === 'Pending' ? 'warning' : order.status === 'Cancelled' ? 'danger' : 'success'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {isUnread && (
                        <button 
                          onClick={() => handleAcknowledge(order._id)}
                          className="btn"
                          style={{ background: 'var(--success)', color: 'white', border: 'none', padding: '0.4rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Acknowledge Order (Silence Alarm)"
                        >
                          <FiCheck size={16} />
                        </button>
                      )}
                      
                      <select 
                        className="input-field" 
                        value={order.status} 
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        style={{ padding: '0.4rem', width: '110px', fontSize: '0.85rem' }}
                      >
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>

                      <button 
                        onClick={() => setEditOrder(order)}
                        className="btn btn-outline"
                        style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Edit Details"
                      >
                        <FiEdit2 size={14} />
                      </button>

                      <button 
                        onClick={() => setDeleteId(order._id)}
                        className="btn btn-outline"
                        style={{ padding: '0.4rem', color: 'var(--danger)', borderColor: 'var(--danger)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Delete Order"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Order Modal */}
      {editOrder && (
        <div className="modal-overlay open" onClick={() => setEditOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', display: 'block', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <h2 style={{ margin: 0, fontFamily: 'Outfit', fontSize: '1.5rem' }}>Edit Order: {editOrder.trackingNumber}</h2>
              <button className="btn-icon" onClick={() => setEditOrder(null)}>
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="input-group">
                  <label className="input-label">Customer Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required 
                    value={editOrder.customerName} 
                    onChange={(e) => setEditOrder({...editOrder, customerName: e.target.value})} 
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Phone Number</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required 
                    value={editOrder.phoneNumber} 
                    onChange={(e) => setEditOrder({...editOrder, phoneNumber: e.target.value})} 
                  />
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: '1.25rem' }}>
                <label className="input-label">Delivery Address</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required 
                  value={editOrder.address} 
                  onChange={(e) => setEditOrder({...editOrder, address: e.target.value})} 
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="input-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Items Ordered</label>
                <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-color)', padding: '0.5rem' }}>
                  {editOrder.items.map((item, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderBottom: '1px solid var(--border)', gap: '1rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: '500', flex: 1 }}>
                        {item.name} {item.version && `(${item.version})`}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input 
                          type="number" 
                          className="input-field" 
                          min="1" 
                          style={{ width: '60px', padding: '0.25rem', textAlign: 'center' }} 
                          value={item.quantity} 
                          onChange={(e) => updateEditItemQty(index, e.target.value)} 
                        />
                        <button 
                          type="button" 
                          onClick={() => deleteEditItem(index)}
                          style={{ border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                          title="Remove item"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {editOrder.items.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
                      No items in this order. Remove or close modal.
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  Estimated Total: <span style={{ color: 'var(--primary)' }}>
                    AED {editOrder.items.reduce((sum, i) => sum + (i.price * i.quantity), 0).toFixed(2)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setEditOrder(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }} disabled={editOrder.items.length === 0}>Save Changes</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="modal-overlay open" onClick={() => setDeleteId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', display: 'block', padding: '2rem', textAlign: 'center' }}>
            <FiAlertCircle size={48} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', fontFamily: 'Outfit' }}>Delete Order?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Are you sure you want to delete this order? This action cannot be undone and will be recorded in the audit logs.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ background: 'var(--danger)', borderColor: 'var(--danger)', padding: '0.5rem 1.5rem' }} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManager;
