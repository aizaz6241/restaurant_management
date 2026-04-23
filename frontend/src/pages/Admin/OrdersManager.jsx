import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../../config';

const statusOptions = ['Pending', 'Approved', 'Preparing', 'On the Way', 'Delivered', 'Cancelled'];

const OrdersManager = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('All');

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/orders`);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    fetchOrders();

    const socket = io(API_BASE_URL);
    socket.on('newOrder', (newOrder) => {
      setOrders(prev => [newOrder, ...prev]);
    });

    socket.on('orderStatusUpdated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    return () => socket.disconnect();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/api/orders/${id}/status`, { status: newStatus });
    } catch (error) {
      console.error('Error updating status', error);
    }
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

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Tracking ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order._id}>
                <td style={{ fontWeight: 'bold' }}>{order.trackingNumber}</td>
                <td>
                  <div>{order.customerName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.phoneNumber}</div>
                </td>
                <td>
                  {order.items.map(item => (
                    <div key={item._id} style={{ fontSize: '0.85rem' }}>{item.quantity}x {item.name}</div>
                  ))}
                </td>
                <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>${order.totalAmount.toFixed(2)}</td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td>
                  <span className={`badge badge-${order.status === 'Pending' ? 'warning' : order.status === 'Cancelled' ? 'danger' : 'success'}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <select 
                    className="input-field" 
                    value={order.status} 
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    style={{ padding: '0.5rem', width: '130px' }}
                  >
                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersManager;
