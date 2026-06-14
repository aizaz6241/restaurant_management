import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiList, FiPackage, FiMenu, FiX, FiGrid, FiLogOut } from 'react-icons/fi';
import { io } from 'socket.io-client';
import logoImg from '../../assets/logo.jpg';
import { API_BASE_URL } from '../../config';
import { playLoudChime, showDesktopNotification } from '../../utils/audioAlert';
import api from '../../utils/api';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unacknowledgedIds, setUnacknowledgedIds] = useState([]);
  const [isAlertVisible, setIsAlertVisible] = useState(true);
  const [dismissedCount, setDismissedCount] = useState(0);

  useEffect(() => {
    if (unacknowledgedIds.length > dismissedCount) {
      setIsAlertVisible(true);
    } else if (unacknowledgedIds.length === 0) {
      setIsAlertVisible(false);
      setDismissedCount(0);
    }
  }, [unacknowledgedIds, dismissedCount]);

  useEffect(() => {
    // Fetch initial unacknowledged orders to restore alarm state on refresh
    const fetchInitialAlerts = async () => {
      try {
        const { data } = await api.get('/api/orders');
        const unreadIds = data.filter(o => !o.isAcknowledged && o.status === 'Preparing').map(o => o._id);
        setUnacknowledgedIds(unreadIds);
      } catch (err) {
        console.error('Error fetching initial unread orders:', err);
      }
    };
    fetchInitialAlerts();

    // Request browser notification permission if not already requested
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const socket = io(API_BASE_URL);

    socket.on('newOrder', (newOrder) => {
      setUnacknowledgedIds(prev => {
        if (prev.includes(newOrder._id)) return prev;
        return [...prev, newOrder._id];
      });
      showDesktopNotification(newOrder);
    });

    socket.on('orderEditedByCustomer', (updatedOrder) => {
      setUnacknowledgedIds(prev => {
        if (prev.includes(updatedOrder._id)) return prev;
        return [...prev, updatedOrder._id];
      });
      showDesktopNotification(updatedOrder);
    });

    socket.on('orderStatusUpdated', (updatedOrder) => {
      if (updatedOrder.isAcknowledged || updatedOrder.status !== 'Preparing') {
        setUnacknowledgedIds(prev => prev.filter(id => id !== updatedOrder._id));
      } else {
        setUnacknowledgedIds(prev => {
          if (prev.includes(updatedOrder._id)) return prev;
          return [...prev, updatedOrder._id];
        });
      }
    });

    socket.on('orderAcknowledged', (updatedOrder) => {
      setUnacknowledgedIds(prev => prev.filter(id => id !== updatedOrder._id));
    });

    socket.on('orderDeleted', (deletedId) => {
      setUnacknowledgedIds(prev => prev.filter(id => id !== deletedId));
    });

    return () => socket.disconnect();
  }, []);

  // Audio Loop: Trigger chime sound repeatedly while unacknowledged alerts exist
  useEffect(() => {
    if (unacknowledgedIds.length === 0) return;

    // Play once immediately
    playLoudChime();

    // Repeat alarm chime every 2.5 seconds continuously until silenced
    const interval = setInterval(() => {
      playLoudChime();
    }, 2500);

    return () => clearInterval(interval);
  }, [unacknowledgedIds]);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin', icon: <FiHome />, label: 'Dashboard' },
    { path: '/admin/orders', icon: <FiPackage />, label: 'Orders' },
    { path: '/admin/menu', icon: <FiList />, label: 'Menu Items' },
    { path: '/admin/sides', icon: <FiGrid />, label: 'Sides/Addons' },
    { path: '/admin/logs', icon: <FiList />, label: 'Audit Logs' },
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

      {/* Floating Warning Alert for Unacknowledged Orders (for broken speakers) */}
      {unacknowledgedIds.length > 0 && isAlertVisible && (
        <div 
          className="glass new-order-alert-banner"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid var(--danger)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxWidth: '350px',
            background: 'rgba(254, 242, 242, 0.95)',
            color: '#991b1b',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            animation: 'pulse-border 1.5s infinite alternate'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🚨</span>
            New Order Warning!
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#7f1d1d', lineHeight: '1.4' }}>
            You have <strong>{unacknowledgedIds.length}</strong> new unacknowledged order(s) waiting. Please check the orders list.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {location.pathname !== '/admin/orders' && (
              <button 
                className="btn" 
                style={{ 
                  background: 'var(--danger)', 
                  color: 'white', 
                  border: 'none', 
                  padding: '0.45rem 0.8rem', 
                  borderRadius: 'var(--radius-sm)', 
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  flex: 1
                }}
                onClick={() => {
                  setIsAlertVisible(false);
                  setDismissedCount(unacknowledgedIds.length);
                  navigate('/admin/orders');
                }}
              >
                View Orders
              </button>
            )}
            <button 
              className="btn btn-outline" 
              style={{ 
                borderColor: '#b91c1c', 
                color: '#b91c1c', 
                padding: '0.45rem 0.8rem', 
                borderRadius: 'var(--radius-sm)', 
                fontSize: '0.85rem',
                cursor: 'pointer',
                flex: 1
              }}
              onClick={() => {
                setIsAlertVisible(false);
                setDismissedCount(unacknowledgedIds.length);
              }}
            >
              Dismiss
            </button>
          </div>
          <style>{`
            @keyframes pulse-border {
              0% { box-shadow: 0 0 0 0px rgba(239, 68, 68, 0.4); border-color: rgba(239, 68, 68, 0.8); }
              100% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); border-color: rgba(239, 68, 68, 1); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
