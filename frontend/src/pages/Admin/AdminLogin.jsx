import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { API_BASE_URL } from '../../config';
import logoImg from '../../assets/logo.jpg';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/admin/login`, {
        username,
        password,
      });

      localStorage.setItem('adminToken', data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top right, var(--primary-light), var(--bg-color))',
      padding: '1.5rem',
      fontFamily: 'Outfit, sans-serif'
    }}>
      <div className="glass animate-fade-in" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '2.5rem 2rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <img 
            src={logoImg} 
            alt="Sher Afghan Logo" 
            style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              objectFit: 'cover', 
              margin: '0 auto 1rem auto',
              boxShadow: '0 8px 16px rgba(248, 113, 113, 0.25)',
              border: '3px solid white'
            }} 
          />
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>Admin Portal</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Please enter your credentials to log in</p>
        </div>

        {error && (
          <div className="badge badge-danger" style={{ 
            display: 'block', 
            padding: '0.75rem', 
            borderRadius: 'var(--radius-sm)', 
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontSize: '0.85rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
          <div className="input-group" style={{ position: 'relative' }}>
            <label className="input-label" style={{ fontWeight: '600' }}>Username</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <FiUser size={18} />
              </span>
              <input 
                type="text" 
                className="input-field" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div className="input-group" style={{ position: 'relative', marginBottom: '2rem' }}>
            <label className="input-label" style={{ fontWeight: '600' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <FiLock size={18} />
              </span>
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="input-field" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0
                }}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ 
              width: '100%', 
              padding: '0.85rem', 
              fontSize: '1rem', 
              fontWeight: 'bold', 
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 4px 12px rgba(248, 113, 113, 0.3)'
            }} 
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
