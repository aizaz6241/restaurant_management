import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { FiSearch, FiCheckCircle, FiChevronDown, FiChevronUp, FiX, FiPlus, FiMinus } from 'react-icons/fi';
import { API_BASE_URL } from '../../config';
import { getOptimizedImageUrl } from '../../utils/imageOptimizer';

const statusSteps = ['Preparing', 'Delivered'];

const Tracking = () => {
  const { trackingNumber } = useParams();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState(trackingNumber || '');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [collapsedOrders, setCollapsedOrders] = useState({});

  const [addItemsOrder, setAddItemsOrder] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [itemsToAdd, setItemsToAdd] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuError, setMenuError] = useState(null);
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [itemVersions, setItemVersions] = useState({});

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
    
    const handleOrderUpdate = (updatedOrder) => {
      setOrders(prevOrders => 
        prevOrders.map(o => (o._id === updatedOrder._id ? updatedOrder : o))
      );
    };

    socket.on('orderStatusUpdated', handleOrderUpdate);
    socket.on('orderAcknowledged', handleOrderUpdate);

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (addItemsOrder && menuItems.length === 0) {
      const fetchMenu = async () => {
        setMenuLoading(true);
        setMenuError(null);
        try {
          const { data } = await axios.get(`${API_BASE_URL}/api/menu`);
          setMenuItems(data.filter(item => item.isAvailable));
          
          const initialVersions = {};
          data.forEach(item => {
            if (item.hasVersions && item.versions && item.versions.length > 0) {
              initialVersions[item._id] = item.versions[0].name;
            }
          });
          setItemVersions(initialVersions);
        } catch (err) {
          setMenuError('Failed to load menu items.');
        } finally {
          setMenuLoading(false);
        }
      };
      fetchMenu();
    }
  }, [addItemsOrder, menuItems.length]);

  const handleAddItem = (item) => {
    let price = item.price;
    let version = null;
    
    if (item.hasVersions && item.versions && item.versions.length > 0) {
      const selectedVerName = itemVersions[item._id];
      const ver = item.versions.find(v => v.name === selectedVerName);
      if (ver) {
        price = ver.discountPrice && ver.discountPrice > 0 ? ver.discountPrice : ver.price;
        version = ver.name;
      }
    } else {
      price = item.discountPrice && item.discountPrice > 0 ? item.discountPrice : item.price;
    }

    setItemsToAdd(prev => {
      const existingIdx = prev.findIndex(i => i.menuItem === item._id && i.version === version);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        return updated;
      } else {
        return [...prev, {
          menuItem: item._id,
          name: item.name,
          version: version,
          price: price,
          quantity: 1
        }];
      }
    });
  };

  const handleUpdateQty = (index, newQty) => {
    setItemsToAdd(prev => {
      const updated = [...prev];
      if (newQty <= 0) {
        updated.splice(index, 1);
      } else {
        updated[index].quantity = newQty;
      }
      return updated;
    });
  };

  const handleSubmitAddItems = async (e) => {
    e.preventDefault();
    if (itemsToAdd.length === 0 || !addItemsOrder) return;
    
    setLoading(true);
    try {
      const { data } = await axios.put(`${API_BASE_URL}/api/orders/${addItemsOrder._id}/customer-add-items`, {
        itemsToAdd: itemsToAdd
      });
      
      setOrders(prev => prev.map(o => o._id === data._id ? data : o));
      setAddItemsOrder(null);
      setItemsToAdd([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add items to order');
    } finally {
      setLoading(false);
    }
  };

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
                <div className="tracking-order-summary">
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
                      <span className={`badge badge-${order.status === 'Preparing' ? 'warning' : order.status === 'Cancelled' ? 'danger' : 'success'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Total</div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>AED {order.totalAmount.toFixed(2)}</div>
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
                  {/* Order Items & Delivery Address Details */}
                  <div style={{ marginTop: '2.5rem', borderTop: '1px dashed var(--border)', paddingTop: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <h4 style={{ margin: 0, color: 'var(--primary-dark)', fontFamily: 'Outfit', fontWeight: 'bold' }}>Items Ordered</h4>
                      {!order.isAcknowledged && order.status === 'Preparing' && (
                        <button 
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setAddItemsOrder(order);
                          }}
                        >
                          Add Items to Order
                        </button>
                      )}
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.5)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                      {order.items.map(item => (
                        <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                          <span>{item.quantity}x {item.name} {item.version && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({item.version})</span>}</span>
                          <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>AED {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    {order.address && (
                      <div style={{ background: '#fff5f5', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-light)' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-dark)', fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 'bold' }}>Delivery Location / Address</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5', fontStyle: 'italic', color: 'var(--text-main)' }}>{order.address}</p>
                      </div>
                    )}
                  </div>

                  <style>{`
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                  `}</style>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Customer Add Items Modal */}
      {addItemsOrder && (() => {
        const liveOrder = orders.find(o => o._id === addItemsOrder._id);
        if (!liveOrder || liveOrder.isAcknowledged) {
          setTimeout(() => setAddItemsOrder(null), 0);
          return null;
        }
        return (
          <div className="modal-overlay open" onClick={() => setAddItemsOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '940px', display: 'grid' }}>
            {/* Left Column: Menu Catalog */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, fontFamily: 'Outfit', fontSize: '1.5rem' }}>Add Items to Order</h2>
              </div>
              
              {/* Search and Category filters */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Search menu..." 
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  style={{ flex: 1, padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                />
                <select 
                  className="input-field" 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ width: '140px', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                >
                  <option value="All">All Categories</option>
                  {menuItems.length > 0 && ['All', ...new Set(menuItems.map(item => item.category).filter(Boolean))].filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Scrollable list of items */}
              {menuLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading menu...</div>
              ) : menuError ? (
                <div style={{ color: 'var(--danger)', padding: '1rem', textAlign: 'center' }}>{menuError}</div>
              ) : (
                <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px' }}>
                  {menuItems
                    .filter(item => {
                      const matchesSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase());
                      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
                      return matchesSearch && matchesCategory;
                    })
                    .map(item => {
                      const selectedVerName = itemVersions[item._id];
                      const hasVer = item.hasVersions && item.versions && item.versions.length > 0;
                      let currentPrice = item.price;
                      if (hasVer) {
                        const verObj = item.versions.find(v => v.name === selectedVerName);
                        if (verObj) {
                          currentPrice = verObj.discountPrice && verObj.discountPrice > 0 ? verObj.discountPrice : verObj.price;
                        }
                      } else {
                        currentPrice = item.discountPrice && item.discountPrice > 0 ? item.discountPrice : item.price;
                      }

                      return (
                        <div key={item._id} style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', alignItems: 'center' }}>
                          <img 
                            src={getOptimizedImageUrl(item.image, 120)} 
                            alt={item.name} 
                            style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{item.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.2', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</div>
                            {hasVer && (
                              <select
                                value={selectedVerName || ''}
                                onChange={(e) => setItemVersions(prev => ({ ...prev, [item._id]: e.target.value }))}
                                style={{ marginTop: '0.25rem', padding: '0.2rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                              >
                                {item.versions.map(v => (
                                  <option key={v.name} value={v.name}>{v.name} (AED {v.discountPrice && v.discountPrice > 0 ? v.discountPrice : v.price})</option>
                                ))}
                              </select>
                            )}
                          </div>
                          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-end' }}>
                            <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '0.95rem' }}>AED {currentPrice.toFixed(2)}</span>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => handleAddItem(item)}
                              style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  {menuItems.filter(item => {
                    const matchesSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase());
                    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
                    return matchesSearch && matchesCategory;
                  }).length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No items match your criteria.</div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Selected Items Summary */}
            <div className="add-items-modal-right" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '0', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontFamily: 'Outfit', fontSize: '1.25rem' }}>Items to Add</h3>
                  <span className="badge badge-success">{itemsToAdd.reduce((sum, i) => sum + i.quantity, 0)} items</span>
                </div>

                {/* Scrollable selected list */}
                <div style={{ overflowY: 'auto', flex: 1, minHeight: '150px', maxHeight: '280px', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  {itemsToAdd.map((item, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                      <div style={{ flex: 1, marginRight: '0.5rem' }}>
                        <div style={{ fontWeight: '600' }}>{item.name}</div>
                        {item.version && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({item.version})</div>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ padding: '0.1rem 0.4rem', minWidth: '24px', fontSize: '0.8rem' }}
                          onClick={() => handleUpdateQty(index, item.quantity - 1)}
                        >
                          <FiMinus size={10} />
                        </button>
                        <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ padding: '0.1rem 0.4rem', minWidth: '24px', fontSize: '0.8rem' }}
                          onClick={() => handleUpdateQty(index, item.quantity + 1)}
                        >
                          <FiPlus size={10} />
                        </button>
                        <span style={{ fontWeight: 'bold', color: 'var(--text-main)', minWidth: '65px', textAlign: 'right', marginLeft: '0.5rem' }}>
                          AED {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {itemsToAdd.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      Select items from the menu to add to your order.
                    </div>
                  )}
                </div>
              </div>

              {/* Totals & Actions */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Original Total:</span>
                    <span style={{ fontWeight: '500' }}>AED {addItemsOrder.totalAmount.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary)' }}>
                    <span>New Items Subtotal:</span>
                    <span style={{ fontWeight: 'bold' }}>+ AED {itemsToAdd.reduce((sum, i) => sum + (i.price * i.quantity), 0).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border)', paddingTop: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
                    <span>New Estimated Total:</span>
                    <span style={{ color: 'var(--primary-dark)' }}>
                      AED {(addItemsOrder.totalAmount + itemsToAdd.reduce((sum, i) => sum + (i.price * i.quantity), 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    style={{ flex: 1, padding: '0.5rem' }} 
                    onClick={() => setAddItemsOrder(null)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    style={{ flex: 2, padding: '0.5rem' }}
                    disabled={itemsToAdd.length === 0}
                    onClick={handleSubmitAddItems}
                  >
                    Confirm & Add
                  </button>
                </div>
              </div>
            </div>

            {/* Absolute close button */}
            <button className="modal-close-btn" onClick={() => setAddItemsOrder(null)} style={{ border: 'none', outline: 'none' }}>
              <FiX size={20} />
            </button>
          </div>
        </div>
        );
      })()}
    </div>
  );
};

export default Tracking;
