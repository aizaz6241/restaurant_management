import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiList, FiPackage, FiMenu, FiX, FiGrid, FiLogOut, FiCheck } from 'react-icons/fi';
import { io } from 'socket.io-client';
import logoImg from '../../assets/logo.jpg';
import { API_BASE_URL } from '../../config';
import { playLoudChime, showDesktopNotification } from '../../utils/audioAlert';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState([]);

  useEffect(() => {
    // Request browser notification permission if not already requested
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const socket = io(API_BASE_URL);

    socket.on('newOrder', (newOrder) => {
      // Add order to active alerts (preventing duplicates)
      setActiveAlerts(prev => {
        if (prev.some(o => o._id === newOrder._id)) return prev;
        return [...prev, newOrder];
      });
      // Show desktop browser notification
      showDesktopNotification(newOrder);
    });

    return () => socket.disconnect();
  }, []);

  // Audio Loop: Trigger chime sound repeatedly while active alerts exist
  useEffect(() => {
    if (activeAlerts.length === 0) return;

    // Play once immediately
    playLoudChime();

    // Repeat alarm chime every 2.5 seconds continuously until silenced
    const interval = setInterval(() => {
      playLoudChime();
    }, 2500);

    return () => clearInterval(interval);
  }, [activeAlerts]);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const handleAcknowledge = (orderId) => {
    setActiveAlerts(prev => prev.filter(o => o._id !== orderId));
  };

  const handleAcknowledgeAll = () => {
    setActiveAlerts([]);
  };

  const navItems = [
    { path: '/admin', icon: <FiHome />, label: 'Dashboard' },
    { path: '/admin/orders', icon: <FiPackage />, label: 'Orders' },
    { path: '/admin/menu', icon: <FiList />, label: 'Menu Items' },
    { path: '/admin/sides', icon: <FiGrid />, label: 'Sides/Addons' },
  ];

  return (
    <div className="admin-layout">
      {/* Mobile Header for Admin */}
      <div className="admin-mobile-header" style={{ alignItems: 'center', gap: '0.75rem' }}>
        <img src={logoImg} alt="Sher Afghan Logo" style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }} />
        <h2 style={{ color: 'var(--primary)', fontFamily: 'Outfit', margin: 0, fontSize: '1.25rem' }}>Admin Portal</h2>
        <button className="mobile-menu-btn" onClick={toggleMenu} style={{ marginLeft: 'auto' }}>
          {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      <aside className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header" style={{ padding: '0 2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src={logoImg} alt="Sher Afghan Logo" style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }} />
            <h2 style={{ color: 'var(--primary)', fontFamily: 'Outfit', margin: 0, fontSize: '1.25rem' }}>Admin Portal</h2>
          </div>
          <button className="mobile-close-btn" onClick={closeMenu}>
            <FiX size={24} />
          </button>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 60px)' }}>
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={closeMenu}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          <button 
            onClick={handleLogout} 
            className="admin-nav-item"
            style={{ 
              width: '100%', 
              background: 'none', 
              border: 'none', 
              textAlign: 'left', 
              cursor: 'pointer',
              color: 'var(--danger)',
              marginTop: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontFamily: 'inherit',
              fontSize: 'inherit'
            }}
          >
            <FiLogOut />
            Logout
          </button>
        </nav>
      </aside>
      
      <main className="admin-content">
        <Outlet />
      </main>

      {/* Floating alarm alerts panel */}
      {activeAlerts.length > 0 && (
        <div 
          className="alarm-alert-card animate-fade-in" 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            width: '320px',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.15), 0 10px 10px -5px rgba(239, 68, 68, 0.04)',
            borderLeft: '5px solid var(--danger)',
            fontFamily: 'Outfit, sans-serif'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🚨</span>
            <h4 style={{ margin: 0, color: 'var(--danger)', fontWeight: '700', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              New Order Alarm ({activeAlerts.length})
            </h4>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', marginBottom: '0.75rem' }}>
            {activeAlerts.map(order => (
              <div 
                key={order._id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '0.5rem 0.75rem', 
                  background: 'rgba(239, 68, 68, 0.05)', 
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(239, 68, 68, 0.1)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--text-main)' }}>{order.trackingNumber}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.customerName}</div>
                </div>
                <button 
                  onClick={() => handleAcknowledge(order._id)}
                  style={{
                    background: 'var(--success)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(16, 185, 129, 0.2)',
                    transition: 'transform 0.1s'
                  }}
                  title="Silence Order"
                >
                  <FiCheck size={16} />
                </button>
              </div>
            ))}
          </div>

          <button 
            onClick={handleAcknowledgeAll}
            className="btn"
            style={{ 
              width: '100%', 
              background: 'var(--text-main)', 
              color: 'white', 
              fontSize: '0.85rem', 
              padding: '0.5rem',
              fontWeight: '600',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer'
            }}
          >
            Acknowledge & Silence All
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
