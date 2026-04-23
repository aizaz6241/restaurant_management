import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';

const Header = () => {
  const { cartCount, toggleCart } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header className="navbar glass">
        <div className="container" style={{ position: 'relative' }}>
          <Link to="/" className="logo" onClick={closeMenu}>
            <span role="img" aria-label="pizza">🍕</span> Gourmet Bites
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
