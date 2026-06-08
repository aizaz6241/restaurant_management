import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';
import logoImg from '../assets/logo.jpg';

const Header = () => {
  const { cartCount, toggleCart } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header className="navbar glass">
        <div className="container" style={{ position: 'relative' }}>
          <Link to="/" className="logo" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <img src={logoImg} alt="Sher Afghan Logo" style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} />
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'Outfit', color: 'var(--text-main)' }}>Sher Afghan</span>
          </Link>
          
          <nav className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
            <Link to="/" onClick={closeMenu}>Home</Link>
            <Link to="/about" onClick={closeMenu}>About Us</Link>
            <Link to="/menu" onClick={closeMenu}>Our Menu</Link>
            <Link to="/track" onClick={closeMenu}>Track Order</Link>
            <Link to="/contact" onClick={closeMenu}>Contact</Link>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="cart-icon" onClick={toggleCart}>
              <FiShoppingCart size={24} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </div>
            
            <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </header>
      <CartDrawer />
    </>
  );
};

export default Header;
