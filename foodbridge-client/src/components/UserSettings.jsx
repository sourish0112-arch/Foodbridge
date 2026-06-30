import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const UserSettings = () => {
  const { user, updateUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phoneNumber: '', websiteLink: '', address: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        websiteLink: user.websiteLink || '',
        address: user.location?.address || '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [user, open]);

  if (!user) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (message) setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    if ((user.role === 'restaurant' || user.role === 'shelter') && !form.email.trim()) {
      setMessage('Email is required for restaurants and shelters.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const payload = {
        name: form.name,
        phoneNumber: form.phoneNumber,
        location: { address: form.address },
      };

      if ((user.role === 'restaurant' || user.role === 'shelter') && form.websiteLink) {
        payload.websiteLink = form.websiteLink;
      }

      if (user.role === 'restaurant' || user.role === 'shelter') {
        payload.email = form.email;
      }

      if (form.password) payload.password = form.password;

      const { data } = await API.patch('/auth/me', payload);
      updateUser(data.user);
      setOpen(false);
      setMessage('Profile updated');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: 'rgba(255,255,255,0.14)',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.25)',
          padding: '0.5rem 0.95rem',
          borderRadius: '999px',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '0.9rem'
        }}
      >
        ⚙️ Settings
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem'
        }}>
          <div style={{
            background: 'white', width: '100%', maxWidth: '500px', borderRadius: '20px',
            padding: '1.5rem', boxShadow: '0 25px 60px rgba(0,0,0,0.28)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#1B3A2D' }}>Profile Settings</h3>
                <p style={{ margin: '0.3rem 0 0', color: '#777', fontSize: '0.9rem' }}>Update your personal details</p>
              </div>
              <button onClick={() => setOpen(false)} style={{ border: 'none', background: 'transparent', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            {message && (
              <div style={{
                marginBottom: '1rem', padding: '0.7rem 0.9rem', borderRadius: '10px',
                background: message.includes('updated') ? '#eefbf2' : '#fff2f0',
                color: message.includes('updated') ? '#1e7f45' : '#c0392b',
                fontSize: '0.9rem', border: `1px solid ${message.includes('updated') ? '#bce9cb' : '#f4c5bb'}`
              }}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <label>Name</label>
              <input name="name" value={form.name} onChange={handleChange} required />

              {(user.role === 'restaurant' || user.role === 'shelter') && (
                <>
                  <label>Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required />
                </>
              )}

              <label>Phone Number</label>
              <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="e.g. +91 9876543210" />

              {(user.role === 'restaurant' || user.role === 'shelter') && (
                <>
                  <label>Website / Social Link</label>
                  <input name="websiteLink" value={form.websiteLink} onChange={handleChange} placeholder="https://instagram.com/yourorg" />
                </>
              )}

              <label>Address</label>
              <input name="address" value={form.address} onChange={handleChange} placeholder="Your location" />

              <label>New Password (optional)</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Leave blank to keep current password" />

              <label>Confirm Password</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter new password" />

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setOpen(false)} style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: 'none', background: '#1B3A2D', color: 'white', cursor: 'pointer', fontWeight: 700 }}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UserSettings;
