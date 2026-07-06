import { useState, useEffect } from 'react';
import API, { socket } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import UserSettings from '../components/UserSettings';
import DashboardLayout from "../components/DashboardLayout";

const statusColor = {
  available: '#27ae60', claimed: '#e67e22',
  picked: '#2980b9', dropped: '#8e44ad', delivered: '#27ae60'
};

const RestaurantDashboard = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [otpInputs, setOtpInputs] = useState({});
  const [verifying, setVerifying] = useState(null);
  const [otpErrors, setOtpErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', quantity: '', unit: 'kg', category: 'cooked', cookedHoursSince: '0'
  });

  useEffect(() => {
    fetchMyListings();
    socket.emit('join', user.id);

    socket.on('otp_verified', (data) => {
      setNotification({ type: 'success', message: `✅ OTP verified for "${data.title}"! Volunteer is on their way.` });
      fetchMyListings();
    });

    return () => socket.off('otp_verified');
  }, []);

  const fetchMyListings = async () => {
    try {
      const { data } = await API.get('/listings/mylistings');
      setListings(data);
    } catch (err) { console.error(err); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const cookedHours = Number(form.cookedHoursSince || 0);
  const isCooked = form.category === 'cooked';
  const remainingHours = Math.max(0, 16 - cookedHours);
  const isStale = isCooked && cookedHours >= 16;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isStale) {
      alert('This cooked food is stale and cannot be listed. Please select fewer hours since cooking.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        quantity: form.quantity,
        unit: form.unit,
        category: form.category,
        imageUrl: form.imageUrl
      };
      if (form.category === 'cooked') payload.cookedHoursSince = cookedHours;
      await API.post('/listings', payload);
      setForm({ title: '', description: '', quantity: '', unit: 'kg', category: 'cooked', cookedHoursSince: '0' });
      fetchMyListings();
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
    setLoading(false);
  };

  const handleOTPChange = (id, value) => {
    // Only allow numbers, max 6 digits
    const clean = value.replace(/\D/g, '').slice(0, 6);
    setOtpInputs({ ...otpInputs, [id]: clean });
    setOtpErrors({ ...otpErrors, [id]: '' });
  };

  const verifyOTP = async (id) => {
    const otp = otpInputs[id];
    if (!otp || otp.length !== 6) {
      setOtpErrors({ ...otpErrors, [id]: 'Enter the 6-digit OTP' });
      return;
    }
    setVerifying(id);
    try {
      await API.patch(`/listings/${id}/verifyotp`, { otp });
      setOtpInputs({ ...otpInputs, [id]: '' });
      setOtpErrors({ ...otpErrors, [id]: '' });
      fetchMyListings();
      setNotification({ type: 'success', message: '✅ OTP verified! Volunteer pickup confirmed.' });
    } catch (err) {
      setOtpErrors({ ...otpErrors, [id]: err.response?.data?.message || 'Wrong OTP' });
    }
    setVerifying(null);
  };

  const delivered = listings.filter(l => l.status === 'delivered').length;
  const active = listings.filter(l => l.status !== 'delivered').length;

  return (
    <DashboardLayout>
      <div className="dash-restaurant">

      {/* Notification toast */}
      {notification && (
        <div style={{
          position: 'fixed', top: '80px', right: '1.5rem', zIndex: 999,
          background: '#1B3A2D', color: 'white',
          padding: '1rem 1.5rem', borderRadius: '14px',
          maxWidth: '350px', boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          fontSize: '0.95rem', fontWeight: 600,
          animation: 'slideIn 0.4s ease'
        }}>
          <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(60px); } to { opacity:1; transform:translateX(0); } }`}</style>
          {notification.message}
          <button onClick={() => setNotification(null)} style={{
            marginLeft: '1rem', background: 'rgba(255,255,255,0.2)',
            border: 'none', color: 'white', borderRadius: '6px',
            padding: '0.2rem 0.6rem', cursor: 'pointer'
          }}>✕</button>
        </div>
      )}

      {/* Header */}
      <div className="dash-header dash-header-restaurant">
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <p style={{ opacity: 0.7, fontSize: '0.85rem', marginBottom: '0.25rem' }}>RESTAURANT DASHBOARD</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
              Welcome, {user.name} 🍽️
            </h1>
            <UserSettings />
          </div>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{listings.length}</div>
              <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>Total Posts</div>
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{delivered}</div>
              <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>Delivered</div>
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{active}</div>
              <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>Active</div>
            </div>
          </div>
        </div>
      </div>

      <div className="page">

        {/* POST FORM */}
        <div className="card" style={{ border: '2px dashed #1B3A2D', background: '#f8fff9' }}>
          <h2 style={{ fontFamily: 'Sora, sans-serif', marginBottom: '1.25rem', color: '#1B3A2D' }}>
            ➕ Post Surplus Food
          </h2>
          <form onSubmit={handleSubmit}>
            <label>Food Name</label>
            <input name="title" placeholder="e.g. Dal Rice, Paneer Curry"
              value={form.title} onChange={handleChange} required />

            <label>Description (optional)</label>
            <input name="description" placeholder="e.g. Freshly cooked, no onion/garlic"
              value={form.description} onChange={handleChange} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label>Quantity</label>
                <input name="quantity" type="number" placeholder="e.g. 5"
                  value={form.quantity} onChange={handleChange} required />
              </div>
              <div>
                <label>Unit</label>
                <select name="unit" value={form.unit} onChange={handleChange}>
                  <option value="kg">kg</option>
                  <option value="litres">litres</option>
                  <option value="portions">portions</option>
                  <option value="boxes">boxes</option>
                </select>
              </div>
            </div>

            <label>Category</label>
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="cooked">🍛 Cooked Food</option>
              <option value="raw">🥦 Raw Ingredients</option>
              <option value="packaged">📦 Packaged Food</option>
              <option value="baked">🍞 Baked Goods</option>
            </select>

            {isCooked && (
              <div style={{ marginTop: '1rem' }}>
                <label>Hours since cooked</label>
                <select name="cookedHoursSince" value={form.cookedHoursSince} onChange={handleChange}>
                  {Array.from({ length: 17 }, (_, i) => i).map((hour) => (
                    <option key={hour} value={hour}>{hour} hour{hour === 1 ? '' : 's'}</option>
                  ))}
                </select>
                <p style={{ marginTop: '0.75rem', color: isStale ? '#c0392b' : '#1B3A2D', fontWeight: 600 }}>
                  {isStale
                    ? '⚠️ This cooked food is stale and cannot be listed.'
                    : `⏱️ This cooked food will last for about ${remainingHours} more hour${remainingHours === 1 ? '' : 's'}.`}
                </p>
              </div>
            )}

            <button className="btn-primary" type="submit" disabled={loading || isStale}>
              {loading ? '⏳ Posting...' : '🚀 Post Food Listing'}
            </button>
          </form>
        </div>

        {/* LISTINGS */}
        <h2 style={{ fontFamily: 'Sora, sans-serif', margin: '2rem 0 1rem', color: '#1B3A2D' }}>
          📋 My Listings
        </h2>

        {listings.length === 0 && (
          <div className="card" style={{ textAlign: 'center', color: '#888', padding: '2.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🍽️</div>
            No listings yet. Post your first one above!
          </div>
        )}

        {listings.map(l => (
          <div className="card" key={l._id} style={{ borderLeft: `4px solid ${statusColor[l.status]}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontFamily: 'Sora, sans-serif', marginBottom: '0.3rem' }}>{l.title}</h3>
                {l.description && <p style={{ color: '#666', fontSize: '0.9rem' }}>{l.description}</p>}
                <p style={{ margin: '0.4rem 0' }}>📦 {l.quantity} {l.unit} &nbsp;<span className="tag">{l.category}</span></p>
                {l.expiresAt && <p style={{ color: '#e67e22', fontSize: '0.85rem' }}>⏱️ Safe until: {new Date(l.expiresAt).toLocaleString()}</p>}
                {l.storageAdvice && <p style={{ color: '#555', fontSize: '0.85rem' }}>💡 {l.storageAdvice}</p>}

                {/* OTP INPUT — shows when volunteer has accepted but not yet verified */}
                {l.status === 'picked' && !l.otpVerified && (
                  <div style={{
                    marginTop: '1rem', padding: '1.25rem',
                    background: '#fff8e1', borderRadius: '14px',
                    border: '1px solid #E8A838'
                  }}>
                    <p style={{ fontWeight: 700, marginBottom: '0.3rem', color: '#1B3A2D' }}>
                      🔐 Volunteer is here!
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
                      Ask the volunteer for their 6-digit OTP and enter it below to confirm pickup.
                    </p>

                    {/* OTP boxes */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', justifyContent: 'center' }}>
                      {[0,1,2,3,4,5].map(i => (
                        <div key={i} style={{
                          width: '44px', height: '52px',
                          border: `2px solid ${otpInputs[l._id]?.length > i ? '#1B3A2D' : '#ddd'}`,
                          borderRadius: '10px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.4rem', fontWeight: 800, color: '#1B3A2D',
                          background: otpInputs[l._id]?.length > i ? '#f0fff4' : 'white',
                          transition: 'all 0.15s'
                        }}>
                          {otpInputs[l._id]?.[i] || ''}
                        </div>
                      ))}
                    </div>

                    <input
                      type="number"
                      placeholder="Enter 6-digit OTP"
                      value={otpInputs[l._id] || ''}
                      onChange={e => handleOTPChange(l._id, e.target.value)}
                      style={{
                        textAlign: 'center', fontSize: '1.2rem',
                        letterSpacing: '0.3em', fontWeight: 700,
                        borderColor: otpErrors[l._id] ? '#e74c3c' : '#ddd'
                      }}
                    />

                    {otpErrors[l._id] && (
                      <p style={{ color: '#e74c3c', fontSize: '0.85rem', textAlign: 'center', marginTop: '-0.5rem' }}>
                        ⚠️ {otpErrors[l._id]}
                      </p>
                    )}

                    <button
                      onClick={() => verifyOTP(l._id)}
                      disabled={verifying === l._id}
                      style={{
                        width: '100%', padding: '0.8rem', borderRadius: '10px',
                        border: 'none', marginTop: '0.75rem',
                        background: 'linear-gradient(135deg, #1B3A2D, #2d5a3d)',
                        color: 'white', fontWeight: 700, fontSize: '1rem', cursor: 'pointer'
                      }}>
                      {verifying === l._id ? '⏳ Verifying...' : '✅ Verify OTP & Confirm Pickup'}
                    </button>
                  </div>
                )}

                {l.otpVerified && l.status === 'picked' && (
                  <p style={{ color: '#27ae60', marginTop: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                    ✅ OTP verified — volunteer picked up at {new Date(l.qrScannedAt).toLocaleTimeString()}
                  </p>
                )}

                {l.status === 'dropped' && (
                  <p style={{ color: '#8e44ad', marginTop: '0.5rem', fontWeight: 700 }}>
                    📦 Dropped at shelter — waiting for confirmation
                  </p>
                )}

                {l.status === 'delivered' && (
                  <p style={{ color: '#27ae60', marginTop: '0.5rem', fontWeight: 700 }}>
                    🎉 Successfully delivered!
                  </p>
                )}
              </div>

              <span className="status-badge"
                style={{ background: statusColor[l.status], marginLeft: '1rem' }}>
                {l.status}
              </span>
            </div>
          </div>
        ))}
      </div>
      </div>
    </DashboardLayout>
  );
};

export default RestaurantDashboard;