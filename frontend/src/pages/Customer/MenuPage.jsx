import { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { FiPlus, FiAlertCircle, FiTag, FiX } from 'react-icons/fi';
import { API_BASE_URL } from '../../config';

const MenuPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
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

  // Extract unique categories dynamically from database items
  const categories = ['All', ...new Set(items.map(item => item.category).filter(Boolean))];

  // Split items into Deals and Standard Items for better presentation, filtered by category
  const deals = items.filter(item => item.isDeal && (activeCategory === 'All' || item.category === activeCategory));
  const standardItems = items.filter(item => !item.isDeal && (activeCategory === 'All' || item.category === activeCategory));

  return (
    <div className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontFamily: 'Outfit', fontWeight: 'bold' }}>Our Menu</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>Discover our wide range of delicious items and combo deals.</p>
      </div>

      {/* Dynamic Category Filter Bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '0.75rem', 
        flexWrap: 'wrap', 
        marginBottom: '4rem',
        padding: '0.5rem',
        background: 'rgba(255, 255, 255, 0.45)',
        backdropFilter: 'blur(10px)',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--border)',
        maxWidth: 'fit-content',
        margin: '0 auto 4rem auto',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`btn ${activeCategory === cat ? 'btn-primary' : 'btn-outline'}`}
            style={{
              padding: '0.6rem 1.6rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.95rem',
              fontWeight: '600',
              textTransform: 'capitalize',
              border: activeCategory === cat ? '1px solid var(--primary)' : '1px solid transparent',
              boxShadow: activeCategory === cat ? '0 4px 12px rgba(248, 113, 113, 0.25)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {deals.length > 0 && (
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontFamily: 'Outfit', fontWeight: 'bold' }}>
            <FiTag /> Special Combo Deals
          </h2>
          <div className="grid-cols-4 animate-fade-in" key={`deals-${activeCategory}`}>
            {deals.map((item) => (
              <MenuCard key={item._id} item={item} addToCart={addToCart} onSelect={() => setSelectedItem(item)} />
            ))}
          </div>
        </div>
      )}

      {standardItems.length > 0 ? (
        <div>
          <h2 style={{ marginBottom: '2rem', fontFamily: 'Outfit', fontWeight: 'bold' }}>
            {activeCategory === 'All' ? 'All Items' : `${activeCategory} Items`}
          </h2>
          <div className="grid-cols-4 animate-fade-in" key={`items-${activeCategory}`}>
            {standardItems.map((item) => (
              <MenuCard key={item._id} item={item} addToCart={addToCart} onSelect={() => setSelectedItem(item)} />
            ))}
          </div>
        </div>
      ) : (
        deals.length === 0 && (
          <div className="glass animate-fade-in" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', borderRadius: 'var(--radius-lg)' }}>
            <h3>No items found in this category.</h3>
          </div>
        )
      )}

      {/* Detail Modal Popup */}
      {selectedItem && (
        <FoodDetailModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          addToCart={addToCart} 
        />
      )}
    </div>
  );
};

const MenuCard = ({ item, addToCart, onSelect }) => {
  const [selectedVersion, setSelectedVersion] = useState(
    item.hasVersions && item.versions && item.versions.length > 0 
      ? item.versions[0] 
      : null
  );

  const displayPrice = selectedVersion
    ? (selectedVersion.discountPrice && selectedVersion.discountPrice > 0 ? selectedVersion.discountPrice : selectedVersion.price)
    : (item.discountPrice && item.discountPrice > 0 ? item.discountPrice : item.price);

  const basePrice = selectedVersion ? selectedVersion.price : item.price;

  const isDiscounted = selectedVersion
    ? !!(selectedVersion.discountPrice && selectedVersion.discountPrice > 0)
    : !!(item.discountPrice && item.discountPrice > 0);

  // Solar Orbit coordinate calculations for side items (larger size)
  const radius = 106; // orbit radius (fits cleanly within 220px container)
  const totalSides = item.sides ? item.sides.length : 0;
  const sidePositions = item.sides ? item.sides.map((side, idx) => {
    // Distribute angles evenly, starting at -90deg (top center)
    const angle = (idx * 2 * Math.PI) / totalSides - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return {
      side,
      style: {
        left: `calc(50% + ${x}px - 26px)`, // 26px is half of 52px width
        top: `calc(50% + ${y}px - 26px)`
      }
    };
  }) : [];

  return (
    <div className="menu-card" style={{ position: 'relative', cursor: 'pointer' }} onClick={onSelect}>
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
      
      {/* Solar System Orbit Presentation */}
      <div className="orbit-container">
        {/* Dashed Orbit Ring */}
        <div className="orbit-ring"></div>

        {/* Central Sun (Main Food Image) */}
        <div className="sun-food-wrapper">
          <img src={item.image} alt={item.name} className="sun-food" />
        </div>

        {/* Orbiting Planets (Sides / Add-ons) */}
        {sidePositions.map((pos) => (
          <div 
            key={pos.side._id} 
            className="planet-side-wrapper" 
            style={pos.style}
            data-tooltip={pos.side.name + (pos.side.price > 0 ? ` (+AED ${pos.side.price.toFixed(2)})` : ' (Included)')}
          >
            <img src={pos.side.image} alt={pos.side.name} className="planet-side-img" />
          </div>
        ))}

        {!item.isAvailable && (
          <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 12 }} className="badge badge-danger">
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
                <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.875rem' }}>AED {basePrice.toFixed(2)}</span>
                <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>AED {displayPrice.toFixed(2)}</span>
              </div>
            ) : (
              <span className="menu-card-price" style={{ fontSize: '1.2rem' }}>AED {displayPrice.toFixed(2)}</span>
            )}
          </div>
        </div>
        
        <p className="menu-card-desc">{item.description}</p>

        {item.hasVersions && item.versions && item.versions.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', textTransform: 'uppercase' }}>Portion / Size:</label>
            <select 
              value={selectedVersion ? selectedVersion.name : ''} 
              onClick={(e) => e.stopPropagation()} // Stop it from opening the modal!
              onChange={(e) => {
                const ver = item.versions.find(v => v.name === e.target.value);
                setSelectedVersion(ver);
              }}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'white',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              {item.versions.map(v => (
                <option key={v.name} value={v.name}>
                  {v.name} - AED {v.discountPrice && v.discountPrice > 0 ? v.discountPrice.toFixed(2) : v.price.toFixed(2)}
                </option>
              ))}
            </select>
          </div>
        )}

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
          onClick={(e) => {
            e.stopPropagation(); // Stop it from opening the modal!
            addToCart(item, selectedVersion);
          }}
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

/* Food Detail Modal Popup */
const FoodDetailModal = ({ item, onClose, addToCart }) => {
  const [selectedVersion, setSelectedVersion] = useState(
    item.hasVersions && item.versions && item.versions.length > 0 
      ? item.versions[0] 
      : null
  );

  const displayPrice = selectedVersion
    ? (selectedVersion.discountPrice && selectedVersion.discountPrice > 0 ? selectedVersion.discountPrice : selectedVersion.price)
    : (item.discountPrice && item.discountPrice > 0 ? item.discountPrice : item.price);

  const basePrice = selectedVersion ? selectedVersion.price : item.price;

  const isDiscounted = selectedVersion
    ? !!(selectedVersion.discountPrice && selectedVersion.discountPrice > 0)
    : !!(item.discountPrice && item.discountPrice > 0);

  // Large Orbit calculations inside the modal
  const radius = 142; // Larger radius for modal layout
  const totalSides = item.sides ? item.sides.length : 0;
  const sidePositions = item.sides ? item.sides.map((side, idx) => {
    const angle = (idx * 2 * Math.PI) / totalSides - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return {
      side,
      style: {
        left: `calc(50% + ${x}px - 30px)`, // 30px is half of 60px width
        top: `calc(50% + ${y}px - 30px)`
      }
    };
  }) : [];

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <FiX size={20} />
        </button>

        {/* Left Side: Orbit Food View */}
        <div className="modal-left">
          <div className="modal-orbit-container">
            <div className="modal-orbit-ring"></div>
            <div className="modal-sun-food-wrapper">
              <img src={item.image} alt={item.name} className="modal-sun-food" />
            </div>

            {sidePositions.map((pos) => (
              <div 
                key={pos.side._id} 
                className="modal-planet-side-wrapper" 
                style={pos.style}
                data-tooltip={pos.side.name + (pos.side.price > 0 ? ` (+AED ${pos.side.price.toFixed(2)})` : ' (Included)')}
              >
                <img src={pos.side.image} alt={pos.side.name} className="modal-planet-side-img" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Text & Purchase options */}
        <div className="modal-right">
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{item.name}</h2>
          
          <div style={{ marginBottom: '1.25rem' }}>
            {isDiscounted ? (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'baseline' }}>
                <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.8rem' }}>AED {displayPrice.toFixed(2)}</span>
                <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '1.1rem' }}>AED {basePrice.toFixed(2)}</span>
              </div>
            ) : (
              <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.8rem' }}>AED {displayPrice.toFixed(2)}</span>
            )}
          </div>

          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            {item.description}
          </p>

          {item.hasVersions && item.versions && item.versions.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Portion / Size:</label>
              <select 
                value={selectedVersion ? selectedVersion.name : ''} 
                onChange={(e) => {
                  const ver = item.versions.find(v => v.name === e.target.value);
                  setSelectedVersion(ver);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'white',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                {item.versions.map(v => (
                  <option key={v.name} value={v.name}>
                    {v.name} - AED {v.discountPrice && v.discountPrice > 0 ? v.discountPrice.toFixed(2) : v.price.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {item.isDeal && item.dealItems && item.dealItems.length > 0 && (
            <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', border: '1px dashed var(--primary-light)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--primary-dark)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Includes:</div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
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
            style={{ width: '100%', padding: '1rem' }}
            disabled={!item.isAvailable}
            onClick={() => {
              addToCart(item, selectedVersion);
              onClose();
            }}
          >
            {item.isAvailable ? (
              <>Add to Cart <FiPlus /></>
            ) : (
              <>Sold Out <FiAlertCircle /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuPage;
