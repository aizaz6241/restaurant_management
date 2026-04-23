import React, { useState } from 'react';
import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

const ContactUs = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate sending an email/message to the server
    setStatus('Message sent successfully! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
    setTimeout(() => setStatus(null), 5000);
  };

  return (
    <div style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
      <div className="container animate-fade-in">
        
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Get In Touch</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>We'd love to hear from you. Reach out with any questions or feedback.</p>
        </div>

        <div className="grid-cols-2" style={{ gap: '4rem', alignItems: 'flex-start' }}>
          
          {/* Contact Details */}
          <div>
            <h2 style={{ marginBottom: '2rem' }}>Contact Information</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '1rem', borderRadius: '50%', fontSize: '1.5rem' }}>
                  <FiMapPin />
                </div>
                <div>
                  <h3 style={{ marginBottom: '0.25rem' }}>Our Location</h3>
                  <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                    123 Restaurant Row,<br/>
                    Culinary District, NY 10001
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '1rem', borderRadius: '50%', fontSize: '1.5rem' }}>
                  <FiPhone />
                </div>
                <div>
                  <h3 style={{ marginBottom: '0.25rem' }}>Phone Number</h3>
                  <p style={{ color: 'var(--text-muted)' }}>+1 (555) 123-4567</p>
                  <p style={{ color: 'var(--text-muted)' }}>+1 (555) 987-6543</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '1rem', borderRadius: '50%', fontSize: '1.5rem' }}>
                  <FiMail />
                </div>
                <div>
                  <h3 style={{ marginBottom: '0.25rem' }}>Email Address</h3>
                  <p style={{ color: 'var(--text-muted)' }}>hello@gourmetbites.com</p>
                  <p style={{ color: 'var(--text-muted)' }}>support@gourmetbites.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ marginBottom: '2rem' }}>Send Us A Message</h2>
            
            {status && (
              <div className="badge badge-success" style={{ display: 'block', padding: '1rem', marginBottom: '1.5rem', textAlign: 'center', fontSize: '1rem' }}>
                {status}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Your Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input 
                  type="email" 
                  className="input-field" 
                  required 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="john@example.com"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Message</label>
                <textarea 
                  className="input-field" 
                  required 
                  rows="5"
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  placeholder="How can we help you today?"
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '1.1rem' }}>
                Send Message
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactUs;
