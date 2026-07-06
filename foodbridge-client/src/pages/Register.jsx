import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const roles = [
  { value: 'restaurant', emoji: '🍽️', label: 'Restaurant / Food Donor', desc: 'Post surplus food' },
  { value: 'shelter',    emoji: '🏠', label: 'Shelter / NGO',           desc: 'Claim food for your community' },
  { value: 'volunteer',  emoji: '🚴', label: 'Volunteer / Rider',       desc: 'Pick up & deliver food, earn money' },
];

const floaters = [
  { emoji: '🌱', top: '10%', left: '4%',  delay: '0s' },
  { emoji: '🍜', top: '20%', right: '6%', delay: '2s' },
  { emoji: '🤲', top: '60%', left: '2%',  delay: '1s' },
  { emoji: '🥙', top: '75%', right: '4%', delay: '3s' },
  { emoji: '💚', top: '45%', left: '7%',  delay: '1.5s' },
];

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phoneNumber: '', websiteLink: '', password: '', role: 'restaurant', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await API.post('/auth/register', {
        name: form.name, email: form.email, phoneNumber: form.phoneNumber, websiteLink: form.websiteLink, password: form.password,
        role: form.role, location: { address: form.address }
      });
      login(data.user, data.token);
      if (data.user.role === 'restaurant') navigate('/restaurant');
      else if (data.user.role === 'shelter') navigate('/shelter');
      else navigate('/volunteer');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-bg">
      {floaters.map((f, i) => (
        <div key={i} className="floating-emoji" style={{
          top: f.top, left: f.left, right: f.right,
          animationDelay: f.delay, fontSize: '2.5rem'
        }}>{f.emoji}</div>
      ))}

      <div className="auth-card" style={{ maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem' }}>🌱</div>
          <h1 style={{
            fontFamily: 'Sora, sans-serif', fontSize: '1.7rem',
            fontWeight: 800, color: '#1B3A2D', letterSpacing: '-0.03em'
          }}>Join FoodBridge</h1>
          <p style={{ color: '#888', fontSize: '0.88rem' }}>Choose your role to get started</p>
        </div>

        {/* Role selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
          {roles.map(r => (
            <div key={r.value} onClick={() => setForm({ ...form, role: r.value })}
              style={{
                padding: '0.85rem 1rem', borderRadius: '12px', cursor: 'pointer',
                border: `2px solid ${form.role === r.value ? '#1B3A2D' : '#eee'}`,
                background: form.role === r.value ? '#f0fff4' : 'white',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                transition: 'all 0.2s'
              }}>
              <span style={{ fontSize: '1.5rem' }}>{r.emoji}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1B3A2D' }}>{r.label}</div>
                <div style={{ fontSize: '0.78rem', color: '#888' }}>{r.desc}</div>
              </div>
              {form.role === r.value && (
                <span style={{ marginLeft: 'auto', color: '#27ae60', fontSize: '1.1rem' }}>✓</span>
              )}
            </div>
          ))}
        </div>

        {error && (
          <div style={{
            background: '#fff0ee', color: '#c0392b', padding: '0.75rem',
            borderRadius: '10px', marginBottom: '1rem', fontSize: '0.88rem',
            borderLeft: '3px solid #E05C3A'
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <label>Name / Organization</label>
          <input name="name" placeholder="e.g. Sharma's Kitchen" value={form.name} onChange={handleChange} required />

          <label>Email</label>
          <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />

          <label>Phone Number</label>
          <input name="phoneNumber" placeholder="e.g. +91 9876543210" value={form.phoneNumber} onChange={handleChange} />

          {(form.role === 'restaurant' || form.role === 'shelter') && (
            <>
              <label>Website / Social Link</label>
              <input name="websiteLink" placeholder="https://instagram.com/yourorg" value={form.websiteLink} onChange={handleChange} />
            </>
          )}

          <label>Password</label>
          <input type="password" name="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />

          <label>Address</label>
          <input name="address" placeholder="e.g. Koregaon Park, Pune" value={form.address} onChange={handleChange} />

          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? '⏳ Creating account...' : 'Get Started →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem', color: '#888', fontSize: '0.88rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#1B3A2D', fontWeight: 700 }}>Login</Link>
        </p>

        <Link to="/" style={{
          display: 'block', textAlign: 'center', padding: '0.75rem',
          border: '2px solid #ccc', borderRadius: '10px',
          color: '#1B3A2D', fontWeight: 700, textDecoration: 'none',
          fontSize: '0.95rem', marginTop: '0.75rem', transition: 'all 0.2s'
        }}>← Back to Home</Link>
      </div>
    </div>
  );
};

export default Register;