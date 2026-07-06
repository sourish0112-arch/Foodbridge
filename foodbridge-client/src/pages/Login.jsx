import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const floaters = [
  { emoji: '🍱', top: '8%',  left: '5%',  delay: '0s',   size: '3rem' },
  { emoji: '🥗', top: '15%', right: '8%', delay: '1.5s', size: '2.5rem' },
  { emoji: '🍛', top: '55%', left: '3%',  delay: '3s',   size: '2.8rem' },
  { emoji: '🤝', top: '70%', right: '5%', delay: '0.8s', size: '2.5rem' },
  { emoji: '🌱', top: '35%', left: '8%',  delay: '2s',   size: '2rem' },
  { emoji: '🍲', top: '80%', left: '15%', delay: '4s',   size: '2.2rem' },
  { emoji: '❤️', top: '25%', right: '3%', delay: '2.5s', size: '1.8rem' },
  { emoji: '🥘', top: '88%', right: '12%',delay: '1s',   size: '2.4rem' },
];

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await API.post('/auth/login', form);
      login(data.user, data.token);
      if (data.user.role === 'restaurant') navigate('/restaurant');
      else if (data.user.role === 'shelter') navigate('/shelter');
      else navigate('/volunteer');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-bg">
      {/* Floating food emojis */}
      {floaters.map((f, i) => (
        <div key={i} className="floating-emoji" style={{
          top: f.top, left: f.left, right: f.right,
          animationDelay: f.delay, fontSize: f.size
        }}>{f.emoji}</div>
      ))}

      <div className="auth-card">
        {/* Logo area */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🍱</div>
          <h1 style={{
            fontFamily: 'Sora, sans-serif', fontSize: '1.9rem',
            fontWeight: 800, color: '#1B3A2D', letterSpacing: '-0.03em'
          }}>FoodBridge</h1>
          <p style={{ color: '#888', fontSize: '0.92rem', marginTop: '0.25rem' }}>
            Connecting surplus food with those who need it
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fff0ee', color: '#c0392b', padding: '0.75rem 1rem',
            borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.9rem',
            borderLeft: '3px solid #E05C3A'
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input type="email" name="email" placeholder="you@example.com"
            value={form.email} onChange={handleChange} required />

          <label>Password</label>
          <input type="password" name="password" placeholder="••••••••"
            value={form.password} onChange={handleChange} required />

          <button className="btn-primary" type="submit" disabled={loading}
            style={{ marginTop: '0.5rem' }}>
            {loading ? '⏳ Logging in...' : 'Login →'}
          </button>
        </form>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          margin: '1.25rem 0', color: '#ccc', fontSize: '0.85rem'
        }}>
          <div style={{ flex: 1, height: '1px', background: '#eee' }} />
          new here?
          <div style={{ flex: 1, height: '1px', background: '#eee' }} />
        </div>

        <Link to="/register" style={{
          display: 'block', textAlign: 'center', padding: '0.75rem',
          border: '2px solid #1B3A2D', borderRadius: '10px',
          color: '#1B3A2D', fontWeight: 700, textDecoration: 'none',
          fontSize: '0.95rem', transition: 'all 0.2s'
        }}>Create an account</Link>

        <Link to="/" style={{
          display: 'block', textAlign: 'center', padding: '0.75rem',
          border: '2px solid #ccc', borderRadius: '10px',
          color: '#1B3A2D', fontWeight: 700, textDecoration: 'none',
          fontSize: '0.95rem', marginTop: '0.8rem', transition: 'all 0.2s'
        }}>← Back to Home</Link>

        {/* Impact note */}
        <div style={{
          marginTop: '1.5rem', padding: '0.75rem 1rem',
          background: 'linear-gradient(135deg, #f0fff4, #e8f5ed)',
          borderRadius: '10px', textAlign: 'center', fontSize: '0.82rem', color: '#2d5a3d'
        }}>
          🌍 Every meal donated saves <strong>2.5kg of CO₂</strong>
        </div>
      </div>
    </div>
  );
};

export default Login;