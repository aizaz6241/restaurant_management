import { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { FiPlus, FiAlertCircle, FiTag } from 'react-icons/fi';
import { API_BASE_URL } from '../../config';

const MenuPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/menu`);
        setItems(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching menu', error);
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '8rem', textAlign: 'center' }}>
        <h2>Loading our delicious menu...</h2>
      </div>
    );
  }

  // Split items into Deals and Standard Items for better presentation
  const deals = items.filter(item => item.isDeal);
  const standardItems = items.filter(item => !item.isDeal);

  return (
    <div className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Our Menu</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>Discover our wide range of delicious items and combo deals.</p>
      </div>

      {deals.length > 0 && (
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
            <FiTag /> Special Combo Deals
          </h2>
          <div className="grid-cols-4 animate-fade-in">
            {deals.map((item) => (
              <MenuCard key={item._id} item={item} addToCart={addToCart} />
            ))}
          </div>
        </div>
      )}

      {standardItems.length > 0 && (
        <div>
          <h2 style={{ marginBottom: '2rem' }}>All Items</h2>
          <div className="grid-cols-4 animate-fade-in">
            {standardItems.map((item) => (
              <MenuCard key={item._id} item={item} addToCart={addToCart} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MenuCard = ({ item, addToCart }) => {
  const displayPrice = item.discountPrice && item.discountPrice > 0 ? item.discountPrice : item.price;
  const isDiscounted = item.discountPrice && item.discountPrice > 0;

  return (
    <div className="menu-card" style={{ position: 'relative' }}>
      {isDiscounted && !item.isDeal && (
        <div style={{ position: 'absolute', top: '-10px', left: '-10px', zIndex: 10, background: 'var(--danger)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', fontSize: '0.8rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
          SALE
        </div>
      )}
      {item.isDeal && (
        <div style={{ position: 'absolute', top: '-10px', left: '-10px', zIndex: 10, background: 'var(--primary)', color: 'var(--primary-dark)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', fontSize: '0.8rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
          COMBO DEAL
        </div>
      )}
      
      <div className="menu-card-img-wrapper" style={{ height: '200px' }}>
        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {!item.isAvailable && (
          <div style={{ position: 'absolute', top: '10px', right: '10px' }} className="badge badge-danger">
            Out of Stock
          </div>
        )}
      </div>
      
      <div className="menu-card-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="menu-card-header" style={{ marginBottom: '0.5rem' }}>
          <h3 className="menu-card-title">{item.name}</h3>
          
          <div style={{ textAlign: 'right' }}>
            {isDiscounted ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
                <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.875rem' }}>${item.price.toFixed(2)}</span>
                <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>${displayPrice.toFixed(2)}</span>
              </div>
            ) : (
              <span className="menu-card-price" style={{ fontSize: '1.2rem' }}>${displayPrice.toFixed(2)}</span>
            )}
          </div>
        </div>
        
        <p className="menu-card-desc" style={{ flex: 1 }}>{item.description}</p>

        {item.isDeal && item.dealItems && item.dealItems.length > 0 && (
          <div style={{ background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px dashed var(--primary-light)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary-dark)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Includes:</div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {item.dealItems.map((d, index) => (
                <li key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{d.quantity}x</span> 
                  <span style={{ color: 'var(--text-muted)' }}>{d.menuItem?.name || 'Item'}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <button 
          className="btn btn-primary" 
          style={{ width: '100%', marginTop: 'auto' }}
          disabled={!item.isAvailable}
          onClick={() => addToCart(item)}
        >
          {item.isAvailable ? (
            <>Add to Cart <FiPlus /></>
          ) : (
            <>Sold Out <FiAlertCircle /></>
          )}
        </button>
      </div>
    </div>
  );
};

export default MenuPage;
