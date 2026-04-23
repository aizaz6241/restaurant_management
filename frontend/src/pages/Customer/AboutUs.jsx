import React from 'react';
import { FiAward, FiHeart, FiClock } from 'react-icons/fi';

const AboutUs = () => {
  return (
    <div style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
      <div className="container animate-fade-in">
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: '800px', margin: '0 auto 4rem auto' }}>
          <div className="badge badge-primary" style={{ marginBottom: '1rem', display: 'inline-block' }}>
            Our Story
          </div>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
            About Gourmet Bites
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
            Born out of a passion for high-quality, delicious food. We believe that everyone deserves to experience restaurant-quality meals, whether they are dining out or eating in the comfort of their home.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid-cols-2" style={{ alignItems: 'center', marginBottom: '5rem' }}>
          <div>
            <img 
              src="https://images.unsplash.com/photo-1414235077428-338988a2e8c0?auto=format&fit=crop&w=1200&q=80" 
              alt="Restaurant Interior" 
              style={{ width: '100%', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)' }}
            />
          </div>
          <div style={{ padding: '0 2rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>A Tradition of Excellence</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: '1.7' }}>
              We started our journey in 2010 with a small kitchen and a big dream. Since then, we have grown into a beloved culinary destination. Our recipes are passed down through generations, elevated with modern cooking techniques and the finest local ingredients.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.7' }}>
              Whether you are craving a comforting classic or looking to explore new flavors, our expert chefs create every dish with love and dedication.
            </p>
          </div>
        </div>

        {/* Highlights */}
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '3rem' }}>Why People Love Us</h2>
        <div className="grid-cols-3">
          <div className="glass" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', fontSize: '2rem' }}>
              <FiAward />
            </div>
            <h3 style={{ marginBottom: '1rem' }}>Premium Ingredients</h3>
            <p style={{ color: 'var(--text-muted)' }}>We source our ingredients from local farmers and authentic distributors to ensure the highest quality in every bite.</p>
          </div>
          
          <div className="glass" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#fef3c7', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', fontSize: '2rem' }}>
              <FiHeart />
            </div>
            <h3 style={{ marginBottom: '1rem' }}>Made With Love</h3>
            <p style={{ color: 'var(--text-muted)' }}>Cooking is an art, and our chefs are passionate artists. Every dish is prepared with immense care and attention to detail.</p>
          </div>
          
          <div className="glass" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#d1fae5', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', fontSize: '2rem' }}>
              <FiClock />
            </div>
            <h3 style={{ marginBottom: '1rem' }}>Fast Delivery</h3>
            <p style={{ color: 'var(--text-muted)' }}>We understand cravings! Our dedicated delivery team ensures your food arrives hot, fresh, and exceptionally fast.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutUs;
