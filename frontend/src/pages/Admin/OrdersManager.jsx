import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { io } from 'socket.io-client';
import { FiCheck, FiEdit2, FiTrash2, FiX, FiPlus, FiAlertCircle, FiPrinter, FiSearch, FiCalendar } from 'react-icons/fi';
import { API_BASE_URL } from '../../config';
import api from '../../utils/api';
import logoImg from '../../assets/logo.jpg';

const statusOptions = ['Preparing', 'Delivered', 'Cancelled'];

const OrdersManager = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Modals state
  const [editOrder, setEditOrder] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [orderToPrint, setOrderToPrint] = useState(null);
  const [previewOrder, setPreviewOrder] = useState(null);

  const [isPrinterDevice, setIsPrinterDevice] = useState(() => localStorage.getItem('isPrinterDevice') === 'true');
  const [autoPrintOnAck, setAutoPrintOnAck] = useState(() => localStorage.getItem('autoPrintOnAck') !== 'false');
  const [autoPrintOnNew, setAutoPrintOnNew] = useState(() => localStorage.getItem('autoPrintOnNew') === 'true');
  
  const printedOrderIds = useRef(new Set());

  const getOrderPrintKey = (order) => {
    return `${order._id}-${order.items.length}-${order.totalAmount}-${order.isAcknowledged}`;
  };

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

      // Auto print new orders
      const isPrinter = localStorage.getItem('isPrinterDevice') === 'true';
      const autoPrintNew = localStorage.getItem('autoPrintOnNew') === 'true';
      if (isPrinter && autoPrintNew) {
        triggerPrint(newOrder);
      }
    });

    socket.on('orderEditedByCustomer', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    socket.on('orderStatusUpdated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    socket.on('orderAcknowledged', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));

      // Auto print acknowledged orders
      const isPrinter = localStorage.getItem('isPrinterDevice') === 'true';
      const autoPrintAck = localStorage.getItem('autoPrintOnAck') !== 'false';
      if (isPrinter && autoPrintAck) {
        triggerPrint(updatedOrder);
      }
    });

    socket.on('orderDeleted', (deletedId) => {
      setOrders(prev => prev.filter(o => o._id !== deletedId));
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const handleAfterPrint = () => {
      setOrderToPrint(null);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const triggerPrint = (order) => {
    if (localStorage.getItem('isPrinterDevice') !== 'true') return;
    
    const printKey = getOrderPrintKey(order);
    if (printedOrderIds.current.has(printKey)) {
      console.log('Order already printed, skipping:', order.trackingNumber);
      return;
    }
    printedOrderIds.current.add(printKey);

    setOrderToPrint(order);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleManualPrint = (order) => {
    const printKey = getOrderPrintKey(order);
    printedOrderIds.current.delete(printKey);
    triggerPrint(order);
  };

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

  const filteredOrders = orders.filter(order => {
    // 1. Status Filter
    const matchesStatus = filter === 'All' || order.status === filter;
    
    // 2. Search Query Filter
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      order.trackingNumber.toLowerCase().includes(query) ||
      order.customerName.toLowerCase().includes(query) ||
      order.phoneNumber.includes(query) ||
      order.items.some(item => item.name.toLowerCase().includes(query));
      
    // 3. Date Range Filter
    let matchesDate = true;
    if (startDate || endDate) {
      const orderDate = new Date(order.createdAt);
      const orderDateString = orderDate.toISOString().split('T')[0];
      
      if (startDate && orderDateString < startDate) {
        matchesDate = false;
      }
      if (endDate && orderDateString > endDate) {
        matchesDate = false;
      }
    }
    
    return matchesStatus && matchesSearch && matchesDate;
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Manage Orders</h1>
        
        {/* Local Printer Settings */}
        <div className="glass" style={{ display: 'flex', gap: '1rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', alignItems: 'center', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 'bold', color: 'var(--primary-dark)' }}>
            <span>🖨️ Printer Settings:</span>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={isPrinterDevice} 
              onChange={(e) => {
                setIsPrinterDevice(e.target.checked);
                localStorage.setItem('isPrinterDevice', e.target.checked);
              }} 
            />
            Connect printer (BILL)
          </label>
          {isPrinterDevice && (
            <>
              <div style={{ borderLeft: '1px solid var(--border)', height: '15px' }}></div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={autoPrintOnAck} 
                  onChange={(e) => {
                    setAutoPrintOnAck(e.target.checked);
                    localStorage.setItem('autoPrintOnAck', e.target.checked);
                  }} 
                />
                Auto-Print on Acknowledge
              </label>
              <div style={{ borderLeft: '1px solid var(--border)', height: '15px' }}></div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={autoPrintOnNew} 
                  onChange={(e) => {
                    setAutoPrintOnNew(e.target.checked);
                    localStorage.setItem('autoPrintOnNew', e.target.checked);
                  }} 
                />
                Auto-Print on New Order
              </label>
            </>
          )}
        </div>
      </div>

      {/* Glassmorphism Orders Filter Bar */}
      <div className="glass" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '1.25rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', alignItems: 'center', border: '1px solid var(--border)' }}>
        <div style={{ flex: '1', minWidth: '220px', position: 'relative' }}>
          <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search ID, customer name, items, phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '35px', width: '100%', margin: 0 }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <FiCalendar style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>From:</span>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-field"
            style={{ width: '140px', margin: 0, padding: '0.5rem' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <FiCalendar style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>To:</span>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-field"
            style={{ width: '140px', margin: 0, padding: '0.5rem' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select 
            className="input-field" 
            style={{ width: '150px', margin: 0 }} 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {(searchQuery || startDate || endDate || filter !== 'All') && (
            <button 
              className="btn btn-outline" 
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', height: '42px' }} 
              onClick={() => {
                setSearchQuery('');
                setStartDate('');
                setEndDate('');
                setFilter('All');
              }}
            >
              Clear
            </button>
          )}
        </div>
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
              const isUnread = !order.isAcknowledged && order.status === 'Preparing';
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
                    <span className={`badge badge-${order.status === 'Preparing' ? 'warning' : order.status === 'Cancelled' ? 'danger' : 'success'}`}>
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

                      {isPrinterDevice && (
                        <button 
                          onClick={() => setPreviewOrder(order)}
                          className="btn btn-outline"
                          style={{ padding: '0.4rem', color: 'var(--primary)', borderColor: 'var(--primary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="View & Print Receipt"
                        >
                          <FiPrinter size={14} />
                        </button>
                      )}

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

      {/* Hidden POS Receipt for Print Dialog */}
      {orderToPrint && createPortal(
        <div id="print-receipt-section">
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <img 
              src={logoImg} 
              alt="Sher Afghan Logo" 
              style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', display: 'block', margin: '0 auto 5px auto' }}
            />
            <h2 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase' }}>Sher Afghan</h2>
            <p style={{ margin: '0', fontSize: '12px' }}>Afghani & Traditional Cuisine</p>
          </div>

          <div style={{ borderTop: '1px dashed black', borderBottom: '1px dashed black', padding: '5px 0', marginBottom: '10px', fontSize: '12px' }}>
            <div><strong>RECEIPT ID:</strong> {orderToPrint.trackingNumber}</div>
            <div><strong>DATE:</strong> {new Date(orderToPrint.createdAt).toLocaleString()}</div>
            <div><strong>STATUS:</strong> {orderToPrint.status}</div>
          </div>

          <div style={{ marginBottom: '10px', fontSize: '12px' }}>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '13px', textTransform: 'uppercase', borderBottom: '1px solid black', display: 'inline-block' }}>Customer Info</h4>
            <div><strong>Name:</strong> {orderToPrint.customerName}</div>
            <div><strong>Phone:</strong> {orderToPrint.phoneNumber}</div>
            {orderToPrint.address && (
              <div style={{ marginTop: '3px' }}>
                <strong>Delivery Location:</strong>
                <div style={{ fontStyle: 'italic', paddingLeft: '5px', wordBreak: 'break-word' }}>{orderToPrint.address}</div>
              </div>
            )}
          </div>

          <div style={{ borderBottom: '1px dashed black', paddingBottom: '5px', marginBottom: '10px', fontSize: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid black' }}>
                  <th style={{ textAlign: 'left', padding: '5px', width: '55%', border: '1px solid black' }}>Item Description</th>
                  <th style={{ textAlign: 'center', padding: '5px', width: '15%', border: '1px solid black' }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '5px', width: '30%', border: '1px solid black' }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {orderToPrint.items.map((item, index) => (
                  <tr key={index}>
                    <td style={{ padding: '5px', width: '55%', wordBreak: 'break-word', border: '1px solid black' }}>
                      {item.name}
                      {item.version && <span style={{ fontSize: '10px', color: '#000000', display: 'block', fontWeight: 'bold' }}>({item.version})</span>}
                    </td>
                    <td style={{ textAlign: 'center', padding: '5px', width: '15%', border: '1px solid black', verticalAlign: 'middle' }}>
                      {item.quantity}
                    </td>
                    <td style={{ textAlign: 'right', verticalAlign: 'middle', padding: '5px', width: '30%', border: '1px solid black', whiteSpace: 'nowrap' }}>
                      AED {(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ textAlign: 'right', fontSize: '13px', fontWeight: 'bold', marginTop: '5px' }}>
            TOTAL AMOUNT: AED {orderToPrint.totalAmount.toFixed(2)}
          </div>

          <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '11px', borderTop: '1px dashed black', paddingTop: '10px' }}>
            Thank you for ordering!<br />
            Afghani hospitality at its finest.
          </div>
        </div>,
        document.body
      )}

      {/* Receipt Preview Modal */}
      {previewOrder && (
        <div className="modal-overlay open" onClick={() => setPreviewOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', display: 'block', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <h2 style={{ margin: 0, fontFamily: 'Outfit', fontSize: '1.35rem' }}>Receipt: {previewOrder.trackingNumber}</h2>
              <button className="btn-icon" onClick={() => setPreviewOrder(null)}>
                <FiX size={20} />
              </button>
            </div>

            {/* Receipt Preview Container (with Courier style) */}
            <div className="receipt-preview-container" style={{ marginBottom: '1.5rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <img 
                  src={logoImg} 
                  alt="Sher Afghan Logo" 
                  style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', display: 'block', margin: '0 auto 5px auto' }}
                />
                <h3 style={{ margin: '0 0 3px 0', fontSize: '15px', fontWeight: 'bold', textTransform: 'uppercase' }}>Sher Afghan</h3>
                <p style={{ margin: '0', fontSize: '11px', color: '#555' }}>Afghani & Traditional Cuisine</p>
              </div>

              <div style={{ borderTop: '1px dashed #777', borderBottom: '1px dashed #777', padding: '5px 0', marginBottom: '10px', fontSize: '11px' }}>
                <div><strong>RECEIPT ID:</strong> {previewOrder.trackingNumber}</div>
                <div><strong>DATE:</strong> {new Date(previewOrder.createdAt).toLocaleString()}</div>
                <div><strong>STATUS:</strong> {previewOrder.status}</div>
              </div>

              <div style={{ marginBottom: '10px', fontSize: '11px' }}>
                <div style={{ fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #777', paddingBottom: '2px', marginBottom: '3px', display: 'inline-block' }}>Customer Info</div>
                <div><strong>Name:</strong> {previewOrder.customerName}</div>
                <div><strong>Phone:</strong> {previewOrder.phoneNumber}</div>
                {previewOrder.address && (
                  <div style={{ marginTop: '3px' }}>
                    <strong>Delivery Location:</strong>
                    <div style={{ fontStyle: 'italic', paddingLeft: '5px', wordBreak: 'break-word' }}>{previewOrder.address}</div>
                  </div>
                )}
              </div>

              <div style={{ borderBottom: '1px dashed #777', paddingBottom: '5px', marginBottom: '10px', fontSize: '11px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #777' }}>
                      <th style={{ textAlign: 'left', padding: '4px', width: '55%', border: '1px solid #777' }}>Item Description</th>
                      <th style={{ textAlign: 'center', padding: '4px', width: '15%', border: '1px solid #777' }}>Qty</th>
                      <th style={{ textAlign: 'right', padding: '4px', width: '30%', border: '1px solid #777' }}>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td style={{ padding: '4px', width: '55%', wordBreak: 'break-word', border: '1px solid #777' }}>
                          {item.name}
                          {item.version && <span style={{ fontSize: '9px', color: '#000000', display: 'block', fontWeight: 'bold' }}>({item.version})</span>}
                        </td>
                        <td style={{ textAlign: 'center', padding: '4px', width: '15%', border: '1px solid #777', verticalAlign: 'middle' }}>
                          {item.quantity}
                        </td>
                        <td style={{ textAlign: 'right', verticalAlign: 'middle', padding: '4px', width: '30%', border: '1px solid #777', whiteSpace: 'nowrap' }}>
                          AED {(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ textAlign: 'right', fontSize: '12px', fontWeight: 'bold', marginTop: '5px' }}>
                TOTAL AMOUNT: AED {previewOrder.totalAmount.toFixed(2)}
              </div>

              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '10px', borderTop: '1px dashed #777', paddingTop: '8px', color: '#555' }}>
                Thank you for ordering!<br />
                Afghani hospitality at its finest.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setPreviewOrder(null)}>Close</button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} 
                onClick={() => handleManualPrint(previewOrder)}
              >
                <FiPrinter size={16} /> Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManager;
