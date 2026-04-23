import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { FiSearch, FiCheckCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { API_BASE_URL } from '../../config';

const statusSteps = ['Pending', 'Approved', 'Preparing', 'On the Way', 'Delivered'];

const Tracking = () => {
  const { trackingNumber } = useParams();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState(trackingNumber || '');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [collapsedOrders, setCollapsedOrders] = useState({});

  const fetchOrders = async (tracking) => {
    if (!tracking) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/orders/track/${tracking}`);
      const ordersData = Array.isArray(data) ? data : [data];
      setOrders(ordersData);
      
      // By default, collapse all except the first one if there are multiple
      if (ordersData.length > 1) {
        const initialCollapsed = {};
        ordersData.forEach((o, index) => {
          if (index !== 0) initialCollapsed[o._id] = true;
        });
        setCollapsedOrders(initialCollapsed);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'No orders found');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trackingNumber) {
      fetchOrders(trackingNumber);
    }
  }, [trackingNumber]);

  useEffect(() => {
    const socket = io(API_BASE_URL);
    socket.on('orderStatusUpdated', (updatedOrder) => {
      setOrders(prevOrders => 
        prevOrders.map(o => (o._id === updatedOrder._id ? updatedOrder : o))
      );
    });

    return () => socket.disconnect();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/track/${searchQuery}`);
    }
  };

  const toggleCollapse = (orderId) => {
    setCollapsedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  return (
    <div className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ marginBottom: '1rem' }}>Track Your Orders</h1>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Enter Tracking No. or Phone" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem' }}>
              <FiSearch />
            </button>
          </form>
        </div>

        {loading && <div style={{ textAlign: 'center' }}>Loading...</div>}
        {error && <div className="badge badge-danger" style={{ display: 'block', textAlign: 'center', padding: '1rem' }}>{error}</div>}

        {!loading && !error && orders.length > 0 && (
          <div style={{ marginBottom: '1.5rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
            {orders.length} Order{orders.length !== 1 ? 's' : ''} Found
          </div>
        )}

        {orders.map(order => {
          const isCollapsed = collapsedOrders[order._id];
          
          return (
            <div key={order._id} className="animate-fade-in glass" style={{ borderRadius: 'var(--radius-lg)', marginBottom: '2rem', overflow: 'hidden' }}>
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '1.5rem',
                  cursor: 'pointer',
                  borderBottom: isCollapsed ? 'none' : '1px solid var(--border)' 
                }}
                onClick={() => toggleCollapse(order._id)}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', flex: 1, alignItems: 'center' }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Order ID</div>
                    <div style={{ color: 'var(--primary)', fontFamily: 'Outfit', fontWeight: 'bold', fontSize: '1.1rem' }}>{order.trackingNumber}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Date</div>
                    <div style={{ fontWeight: '500', fontSize: '1rem' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Status</div>
                    <div>
                      <span className={`badge badge-${order.status === 'Pending' ? 'warning' : order.status === 'Cancelled' ? 'danger' : 'success'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Total</div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>${order.totalAmount.toFixed(2)}</div>
                  </div>
                </div>
                <button className="btn-icon" style={{ padding: '0', color: 'var(--text-muted)', marginLeft: '1rem' }}>
                  {isCollapsed ? <FiChevronDown size={24} /> : <FiChevronUp size={24} />}
                </button>
              </div>

              {!isCollapsed && (
                <div style={{ padding: '0 2rem 2rem 2rem' }}>
                  {order.status === 'Cancelled' ? (
                    <div className="badge badge-danger" style={{ fontSize: '1rem', padding: '1rem', display: 'block', textAlign: 'center' }}>
                      This order has been cancelled.
                    </div>
                  ) : (
                    <div className="timeline">
                      {statusSteps.map((step, index) => {
                        const currentStepIndex = statusSteps.indexOf(order.status);
                        const isCompleted = index <= currentStepIndex;
                        const isActive = index === currentStepIndex;
                        return (
                          <div key={step} className={`timeline-item ${isCompleted ? 'active' : ''}`}>
                            <div className="timeline-point" style={{ background: isCompleted ? 'var(--primary)' : 'white' }}></div>
                            <div className="timeline-content" style={{ opacity: isCompleted ? 1 : 0.5 }}>
                              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {step}
                                {isActive && step === 'Delivered' ? (
                                  <FiCheckCircle size={20} color="var(--success)" />
                                ) : isActive ? (
                                  <div className="spinner" style={{ width: '12px', height: '12px', border: '2px solid var(--primary-light)', borderTop: '2px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                ) : null}
                              </h4>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <style>{`
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                  `}</style>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Tracking;
