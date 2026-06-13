import { Link } from 'react-router-dom';
import { FiArrowRight, FiStar, FiMapPin, FiClock, FiHeart, FiCompass } from 'react-icons/fi';

const reviews = [
  { 
    id: 1, 
    name: 'Ahmad Shah', 
    role: 'Dubai Local Guide', 
    comment: 'The best Kabuli Pulao I have had in Dubai! The lamb was cooked to perfection—so tender it literally fell off the bone. The carrots and raisins had the perfect hint of sweetness.', 
    rating: 5 
  },
  { 
    id: 2, 
    name: 'Zainab Hussain', 
    role: 'Food Enthusiast', 
    comment: 'Their Afghani Mantu (dumplings) are absolutely divine. The garlic yogurt sauce and lentil topping make it so unique. It felt like eating home-cooked food in Kabul.', 
    rating: 5 
  },
  { 
    id: 3, 
    name: 'Yousuf Khan', 
    role: 'Regular Customer', 
    comment: 'Authentic charcoal taste in their tikka kababs. The portion size is huge, perfect for family dinners. Highly recommend their fresh tandoori naan as well!', 
    rating: 5 
  },
];

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="hero-bg-shape" style={{ background: 'radial-gradient(circle, var(--primary-light) 0%, transparent 70%)' }}></div>
        <div className="container" style={{ display: 'flex', alignItems: 'center', minHeight: 'calc(100vh - 80px)', flexWrap: 'wrap-reverse', padding: '2rem 0' }}>
          <div style={{ flex: '1 1 500px', padding: '2rem 0' }} className="animate-fade-in">
            <div className="badge badge-primary" style={{ marginBottom: '1.5rem', display: 'inline-block', letterSpacing: '1px' }}>
              🇦🇫 AUTHENTIC AFGHANI CUISINE
            </div>
            <h1 style={{ fontSize: '4.5rem', marginBottom: '1.5rem', color: 'var(--text-main)', lineHeight: '1.1', fontFamily: 'Outfit' }}>
              Savor the True Taste of <span style={{ color: 'var(--primary)' }}>Kabul</span>
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.7', maxWidth: '600px' }}>
              Welcome to <strong>Sher Afghan Restaurant</strong>. Experience traditional slow-cooked Kabuli Pulao, charcoal-grilled smoke-kissed kebabs, and freshly baked clay-oven Naan right here in Dubai.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/menu" className="btn btn-primary" style={{ padding: '0.85rem 2.5rem', fontSize: '1.1rem' }}>
                Explore Menu <FiArrowRight />
              </Link>
              <Link to="/contact" className="btn btn-outline" style={{ padding: '0.85rem 2.5rem', fontSize: '1.1rem' }}>
                Find Our Restaurant
              </Link>
            </div>
          </div>
          
          <div style={{ flex: '1 1 500px', padding: '2rem' }} className="animate-fade-in">
            <div style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
              <img 
                src="https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80" 
                alt="Authentic Kabuli Pulao" 
                style={{ width: '100%', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-2xl)', border: '4px solid var(--border)' }}
              />
              <div className="glass" style={{ position: 'absolute', bottom: '-20px', left: '-20px', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <h4 style={{ color: 'var(--primary-dark)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>🦁</span> Sher Afghan Special
                </h4>
                <p style={{ fontWeight: '600', color: 'var(--text-main)' }}>Kabuli Pulao & Tender Lamb</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section (Specialties) */}
      <section style={{ padding: '6rem 0', backgroundColor: 'var(--bg-card)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div className="badge badge-primary" style={{ marginBottom: '1rem' }}>Chef's Recommendations</div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontFamily: 'Outfit' }}>Our Signature Delicacies</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Sourced from traditional recipes passed down through generations.</p>
          </div>
          
          <div className="grid-cols-3">
             <div className="menu-card" style={{ boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
               <img src="https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=500&q=60" alt="Kabuli Pulao" style={{ height: '240px', width: '100%', objectFit: 'cover' }} />
               <div style={{ padding: '2rem' }}>
                 <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>Special Kabuli Pulao</h3>
                 <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Steamed long-grain rice topped with sweet raisins, julienned carrots, and served with incredibly tender mutton.</p>
               </div>
             </div>
             
             <div className="menu-card" style={{ boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
               <img src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=60" alt="Chapli Kabab" style={{ height: '240px', width: '100%', objectFit: 'cover' }} />
               <div style={{ padding: '2rem' }}>
                 <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>Peshawari Chapli Kabab</h3>
                 <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Spiced patty of minced beef and cracked wheat, shallow-fried with fresh tomatoes, coriander, and green chilies.</p>
               </div>
             </div>
             
             <div className="menu-card" style={{ boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
               <img src="https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=500&q=60" alt="Afghani Mantu" style={{ height: '240px', width: '100%', objectFit: 'cover' }} />
               <div style={{ padding: '2rem' }}>
                 <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>Traditional Afghani Mantu</h3>
                 <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Dumplings stuffed with spiced ground beef and onions, steamed and topped with yellow split-peas gravy and garlic sour cream.</p>
               </div>
             </div>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
             <Link to="/menu" className="btn btn-outline" style={{ padding: '0.85rem 2.5rem', fontWeight: '600' }}>View Full Afghani Menu</Link>
          </div>
        </div>
      </section>

      {/* Our Heritage / Culture Section (New Section 1) */}
      <section style={{ padding: '7rem 0', background: 'var(--bg-body)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '4rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 450px' }}>
            <img 
              src="/afghani_hospitality.png" 
              alt="Afghani Dining Culture" 
              style={{ width: '100%', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }}
            />
          </div>
          <div style={{ flex: '1 1 500px' }}>
            <div className="badge badge-primary" style={{ marginBottom: '1rem' }}>Our Heritage</div>
            <h2 style={{ fontSize: '2.75rem', marginBottom: '1.5rem', fontFamily: 'Outfit', color: 'var(--text-main)' }}>The Art of Afghani Hospitality</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
              At <strong>Sher Afghan Restaurant</strong>, dining is not just about eating—it is a celebration of rich culture and warm hospitality. Our traditional dishes represent a crossroad of Silk Road flavors, combining aromatic spices, slow-cooking techniques, and fresh ingredients.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', lineHeight: '1.8', marginBottom: '2rem' }}>
              From the heavy copper tandoors creating fresh hot bread to our signature charcoal grill filling the air with wood-smoke aroma, we invite you to sit back and experience food cooked with deep love and passion.
            </p>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div>
                <h3 style={{ color: 'var(--primary)', fontSize: '2rem', marginBottom: '0.25rem' }}>100%</h3>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Halal & Fresh Meat</span>
              </div>
              <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '2rem' }}>
                <h3 style={{ color: 'var(--primary)', fontSize: '2rem', marginBottom: '0.25rem' }}>Authentic</h3>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Kabul-style Spices</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Tandoor & Fresh Naan Section (New Section 2) */}
      <section style={{ padding: '6rem 0', backgroundColor: 'var(--bg-card)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '4rem', flexWrap: 'wrap-reverse' }}>
          <div style={{ flex: '1 1 500px' }}>
            <div className="badge badge-primary" style={{ marginBottom: '1rem' }}>From Our Clay Oven</div>
            <h2 style={{ fontSize: '2.75rem', marginBottom: '1.5rem', fontFamily: 'Outfit', color: 'var(--text-main)' }}>Freshly Baked Tandoori Naan</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
              No Afghani meal is complete without bread. Our custom tandoor clay ovens run non-stop, slapping hand-stretched, sesame-seeded dough against hot clay walls. 
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
              Every naan emerges piping hot, crispy on the outside, and incredibly soft on the inside—perfect for scooping up our savory curries or wrapping around juicy skewers of charcoal kebabs.
            </p>
            <ul style={{ padding: 0, listStyle: 'none', color: 'var(--text-main)', fontWeight: '500', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>✔ Traditional Afghani Flat Naan</li>
              <li>✔ Sesame Butter Naan</li>
              <li>✔ Roghni Sweet Naan</li>
            </ul>
          </div>
          <div style={{ flex: '1 1 450px' }}>
            <img 
              src="https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=800&q=80" 
              alt="Fresh Tandoor Naan" 
              style={{ width: '100%', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', border: '4px solid var(--border)' }}
            />
          </div>
        </div>
      </section>

      {/* Family Feasts / Platters Section (New Section 3) */}
      <section style={{ padding: '7rem 0', background: 'var(--bg-body)', textAlign: 'center' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto 4rem auto' }}>
            <div className="badge badge-primary" style={{ marginBottom: '1rem' }}>Feast Together</div>
            <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem', fontFamily: 'Outfit' }}>Sher Afghan Family Platters</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: '1.7' }}>
              In Afghan traditions, sharing food brings people together. Our specialized family platters combine our best pulao rice, grilled skewers, mantu, fresh salad, and mint raita on giant copper platters. Perfect for gatherings of 3 to 6 people!
            </p>
          </div>
          
          <div className="grid-cols-2" style={{ gap: '3rem' }}>
            <div className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)', textAlign: 'left', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '2.5rem' }}>🍢</span>
              <h3 style={{ margin: '1rem 0 0.5rem 0', fontSize: '1.75rem' }}>Grand Charcoal Feast</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>Includes 2 Skewers Lamb Chops, 2 Skewers Chicken Tikka Kabab, 2 Skewers Beef Seekh Kabab, served with fresh garlic sauce, house salad, and 3 Tandoori Naans.</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>AED 149.00</span>
                <Link to="/menu" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>Order Feast</Link>
              </div>
            </div>
            
            <div className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)', textAlign: 'left', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '2.5rem' }}>🍛</span>
              <h3 style={{ margin: '1rem 0 0.5rem 0', fontSize: '1.75rem' }}>Royal Kabul Platter</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>A huge serving of Kabuli Pulao topped with slow-braised lamb shanks, served alongside Mantu (steamed dumplings), fresh Hummus, and sweet Afghani dessert.</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>AED 179.00</span>
                <Link to="/menu" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>Order Feast</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section style={{ padding: '6rem 0', backgroundColor: 'var(--bg-card)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div className="badge badge-primary" style={{ marginBottom: '1rem' }}>Testimonials</div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontFamily: 'Outfit' }}>What Our Guests Say</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Discover why food lovers across Dubai recommend Sher Afghan Restaurant.</p>
          </div>

          <div className="grid-cols-3">
            {reviews.map(review => (
              <div key={review.id} className="glass" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: 'white' }}>
                <div style={{ display: 'flex', gap: '0.25rem', color: 'var(--warning)', marginBottom: '1rem' }}>
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} fill={i < review.rating ? 'currentColor' : 'none'} />
                  ))}
                </div>
                <p style={{ fontStyle: 'italic', marginBottom: '1.5rem', color: 'var(--text-main)', lineHeight: '1.7' }}>
                  "{review.comment}"
                </p>
                <div>
                  <h4 style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{review.name}</h4>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{review.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visit Us / Find Us Section (New Section 4) */}
      <section style={{ padding: '6rem 0', background: 'var(--bg-body)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'stretch', gap: '4rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="badge badge-primary" style={{ marginBottom: '1rem', alignSelf: 'flex-start' }}>Visit Us</div>
            <h2 style={{ fontSize: '2.75rem', marginBottom: '1.5rem', fontFamily: 'Outfit', color: 'var(--text-main)' }}>Find Us in Dubai</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', lineHeight: '1.7', marginBottom: '2rem' }}>
              We are located in the heart of Dubailand, Al Barsha South 3, right near the famous Dubai Miracle Garden & Butterfly Garden. Come visit us for a dine-in experience or order delivery to enjoy at home.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.75rem', borderRadius: '50%', display: 'flex' }}><FiMapPin size={20} /></div>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--text-main)' }}>Location</h4>
                  <span style={{ color: 'var(--text-muted)' }}>Arjan-Dubailand, Al Barsha South 3, Dubai</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.75rem', borderRadius: '50%', display: 'flex' }}><FiClock size={20} /></div>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--text-main)' }}>Opening Hours</h4>
                  <span style={{ color: 'var(--text-muted)' }}>Daily: 11:30 AM - 12:00 Midnight</span>
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '2.5rem' }}>
              <a 
                href="https://maps.app.goo.gl/zrCgSokhu133dTRH8" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-primary"
                style={{ padding: '0.85rem 2rem', textDecoration: 'none', display: 'inline-flex' }}
              >
                Open Google Maps Location
              </a>
            </div>
          </div>
          
          <div style={{ flex: '1 1 500px', minHeight: '350px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3613.6841285077274!2d55.24254887537805!3d25.07869687778553!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f6e62d47fb2bf%3A0xe5a3c2005a7698a3!2sArjan%20-%20Dubailand%20-%20Al%20Barsha%20South%203%20-%20Dubai%20-%20United%20Arab%20Emirates!5e0!3m2!1sen!2s!4v1717876800000!5m2!1sen!2s" 
              width="100%" 
              height="100%" 
              style={{ border: 0, minHeight: '350px' }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      {/* CTA / Order Now Section */}
      <section style={{ padding: '6rem 0', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: '3.5rem', marginBottom: '1rem', color: 'white', fontFamily: 'Outfit' }}>Bismillah! Craving Afghani Food?</h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '2.5rem', opacity: 0.95, maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
            Bring the mouth-watering flavors of Kabul right to your dining table. Quick delivery across Dubailand and surrounding areas.
          </p>
          <Link to="/menu" className="btn" style={{ background: 'white', color: 'var(--primary-dark)', padding: '1rem 3.5rem', fontSize: '1.25rem', fontWeight: 'bold', boxShadow: 'var(--shadow-lg)' }}>
            Start Your Order Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
