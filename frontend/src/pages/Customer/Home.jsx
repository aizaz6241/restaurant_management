import { Link } from 'react-router-dom';
import { FiArrowRight, FiStar } from 'react-icons/fi';

const reviews = [
  { id: 1, name: 'Sarah Jenkins', role: 'Food Critic', comment: 'The flavors are beautifully balanced. Best pasta I have had outside of Italy. Absolutely stunning experience from start to finish.', rating: 5 },
  { id: 2, name: 'Michael Chen', role: 'Regular Customer', comment: 'Lightning fast delivery and the food always arrives piping hot. The signature pizza is a masterclass in culinary balance.', rating: 5 },
  { id: 3, name: 'Emily Rodriguez', role: 'Local Guide', comment: 'Incredible atmosphere, even better food. Their attention to detail with locally sourced ingredients really shines through.', rating: 4 },
];

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-shape"></div>
        <div className="container" style={{ display: 'flex', alignItems: 'center', minHeight: 'calc(100vh - 80px)', flexWrap: 'wrap-reverse' }}>
          <div style={{ flex: '1 1 500px', padding: '2rem 0' }} className="animate-fade-in">
            <div className="badge badge-primary" style={{ marginBottom: '1.5rem', display: 'inline-block' }}>
              Fresh & Delicious
            </div>
            <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
              Experience the True Taste of <span style={{ color: 'var(--primary)' }}>Gourmet</span>
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.6', maxWidth: '600px' }}>
              Handcrafted dishes made from the freshest ingredients. Order online and get it quickly delivered to your doorstep.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/menu" className="btn btn-primary">
                Order Now <FiArrowRight />
              </Link>
              <Link to="/track" className="btn btn-outline">
                Track Order
              </Link>
            </div>
          </div>
          
          <div style={{ flex: '1 1 500px', padding: '2rem' }} className="animate-fade-in">
            <div style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
              <img 
                src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80" 
                alt="Delicious Pizza" 
                style={{ width: '100%', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)' }}
              />
              <div className="glass" style={{ position: 'absolute', bottom: '-20px', left: '-20px', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ color: 'var(--primary-dark)', marginBottom: '0.25rem' }}>Fast Delivery</h4>
                <p style={{ fontWeight: '500' }}>Within 30 Mins!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section style={{ padding: '6rem 0', backgroundColor: 'var(--bg-card)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Discover Our Featured Items</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Handpicked selections beloved by our loyal guests.</p>
          </div>
          
          <div className="grid-cols-3">
             <div className="menu-card" style={{ boxShadow: 'var(--shadow-md)' }}>
               <img src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=60" alt="Burger" style={{ height: '200px', objectFit: 'cover' }} />
               <div style={{ padding: '1.5rem' }}>
                 <h3 style={{ marginBottom: '0.5rem' }}>Gourmet Truffle Burger</h3>
                 <p style={{ color: 'var(--text-muted)' }}>Premium beef patty with black truffle aioli and aged cheddar.</p>
               </div>
             </div>
             <div className="menu-card" style={{ boxShadow: 'var(--shadow-md)' }}>
               <img src="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=60" alt="Pizza" style={{ height: '200px', objectFit: 'cover' }} />
               <div style={{ padding: '1.5rem' }}>
                 <h3 style={{ marginBottom: '0.5rem' }}>Classic Margherita</h3>
                 <p style={{ color: 'var(--text-muted)' }}>Wood-fired crust, San Marzano tomato sauce, and fresh mozzarella.</p>
               </div>
             </div>
             <div className="menu-card" style={{ boxShadow: 'var(--shadow-md)' }}>
               <img src="https://images.unsplash.com/photo-1623341214825-9f4f963727da?auto=format&fit=crop&w=500&q=60" alt="Pasta" style={{ height: '200px', objectFit: 'cover' }} />
               <div style={{ padding: '1.5rem' }}>
                 <h3 style={{ marginBottom: '0.5rem' }}>Seafood Linguine</h3>
                 <p style={{ color: 'var(--text-muted)' }}>Fresh linguine tossed with wild-caught shrimp, mussels, and calamari.</p>
               </div>
             </div>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
             <Link to="/menu" className="btn btn-outline" style={{ padding: '0.75rem 2rem' }}>View Full Menu</Link>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section style={{ padding: '6rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>What Our Customers Say</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Don't just take our word for it. Read the reviews.</p>
          </div>

          <div className="grid-cols-3">
            {reviews.map(review => (
              <div key={review.id} className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', gap: '0.25rem', color: 'var(--warning)', marginBottom: '1rem' }}>
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} fill={i < review.rating ? 'currentColor' : 'none'} />
                  ))}
                </div>
                <p style={{ fontStyle: 'italic', marginBottom: '1.5rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                  "{review.comment}"
                </p>
                <div>
                  <h4 style={{ fontWeight: 'bold' }}>{review.name}</h4>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{review.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section style={{ padding: '5rem 0', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'white' }}>Hungry Yet?</h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 }}>
            Join thousand of satisfied customers who order with us daily.
          </p>
          <Link to="/menu" className="btn" style={{ background: 'white', color: 'var(--primary-dark)', padding: '1rem 3rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
            Start Your Order
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;
