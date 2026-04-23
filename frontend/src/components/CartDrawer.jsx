import { FiX, FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
  const { cart, isCartOpen, toggleCart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    toggleCart();
    navigate('/checkout');
  };

  return (
    <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`}>
      <div className="cart-drawer">
        <div className="cart-header">
          <h2>Your Order</h2>
          <button onClick={toggleCart} className="btn-icon">
            <FiX size={24} />
          </button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>
              <p>Your cart is empty.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.menuItem} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-img" />
                <div className="cart-item-info">
                  <h4 style={{ marginBottom: '0.25rem' }}>{item.name}</h4>
                  <p style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <div className="cart-item-actions">
                    <button className="qty-btn" onClick={() => updateQuantity(item.menuItem, item.quantity - 1)}>
                      <FiMinus size={14} />
                    </button>
                    <span style={{ fontSize: '0.875rem', fontWeight: 'bold', width: '20px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button className="qty-btn" onClick={() => updateQuantity(item.menuItem, item.quantity + 1)}>
                      <FiPlus size={14} />
                    </button>
                    <button style={{ marginLeft: 'auto', color: 'var(--danger)' }} onClick={() => removeFromCart(item.menuItem)}>
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
              <span>Total:</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
