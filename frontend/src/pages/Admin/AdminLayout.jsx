import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FiHome, FiList, FiPackage, FiMenu, FiX } from 'react-icons/fi';

const AdminLayout = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  const navItems = [
    { path: '/admin', icon: <FiHome />, label: 'Dashboard' },
    { path: '/admin/orders', icon: <FiPackage />, label: 'Orders' },
    { path: '/admin/menu', icon: <FiList />, label: 'Menu Items' },
  ];

  return (
    <div className="admin-layout">
      {/* Mobile Header for Admin */}
      <div className="admin-mobile-header">
        <h2 style={{ color: 'var(--primary)', fontFamily: 'Outfit', margin: 0 }}>Admin Portal</h2>
        <button className="mobile-menu-btn" onClick={toggleMenu}>
          {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      <aside className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header" style={{ padding: '0 2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: 'var(--primary)', fontFamily: 'Outfit', margin: 0 }}>Admin Portal</h2>
          <button className="mobile-close-btn" onClick={closeMenu}>
            <FiX size={24} />
          </button>
        </div>
        <nav>
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
        </nav>
      </aside>
      
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
