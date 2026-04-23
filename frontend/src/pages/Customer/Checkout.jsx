import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiCheckCircle } from 'react-icons/fi';
import { API_BASE_URL } from '../../config';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const orderData = {
        customerName: formData.customerName,
        phoneNumber: formData.phoneNumber,
        items: cart,
        totalAmount: cartTotal,
      };

      const { data } = await axios.post(`${API_BASE_URL}/api/orders`, orderData);
      
      clearCart();
      navigate(`/track/${data.trackingNumber}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container" style={{ paddingTop: '8rem', textAlign: 'center' }}>
        <h2>Your cart is empty</h2>
        <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/menu')}>
          Go to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }} className="grid-cols-2">
        
        {/* Order Summary */}
        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Order Summary</h2>
          <div style={{ marginBottom: '1.5rem' }}>
            {cart.map(item => (
              <div key={item.menuItem} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>{item.quantity}x {item.name}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.25rem' }}>
            <span>Total</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Checkout Form */}
        <div style={{ padding: '0 1rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Checkout Details</h2>
          {error && <div className="badge badge-danger" style={{ marginBottom: '1rem', display: 'block' }}>{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input 
                type="text" 
                className="input-field" 
                required 
                value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                placeholder="John Doe"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Phone Number</label>
              <input 
                type="tel" 
                className="input-field" 
                required 
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                placeholder="e.g. +1 234 567 8900"
              />
            </div>
            
            <div className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                <FiCheckCircle color="var(--success)" /> Payment Method: Cash on Delivery
              </p>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
