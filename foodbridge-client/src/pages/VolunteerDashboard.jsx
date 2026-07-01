import { useState, useEffect } from 'react';
import API, { socket } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import UserSettings from '../components/UserSettings';
import DashboardLayout from "../components/DashboardLayout";
const OTPDisplay = ({ otp }) => (
  <div style={{
    marginTop: '1.25rem', padding: '1.5rem',
    background: 'linear-gradient(135deg, #1B3A2D, #2d5a3d)',
    borderRadius: '16px', textAlign: 'center'
  }}>
    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', marginBottom: '0.5rem', letterSpacing: '0.08em' }}>
      SHOW THIS OTP TO RESTAURANT STAFF
    </p>
    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '0.75rem' }}>
      {otp?.split('').map((digit, i) => (
        <div key={i} style={{
          width: '46px', height: '56px',
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.8rem', fontWeight: 800, color: '#E8A838',
          fontFamily: 'Sora, sans-serif'
        }}>{digit}</div>
      ))}
    </div>
    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
      🔐 Pickup OTP — valid for this order only
    </p>
  </div>
);

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [available, setAvailable] = useState([]);
  const [myPickups, setMyPickups] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);
  const [dropping, setDropping] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchAll();
    socket.emit('join', user.id);

    socket.on('delivery_confirmed', (data) => {
      setNotification({ type: 'success', message: `✅ Shelter confirmed delivery of "${data.title}"! You earned ₹${data.earned}` });
      fetchAll();
    });

    socket.on('delivery_rejected', (data) => {
      setNotification({ type: 'error', message: `❌ Shelter said they didn't receive "${data.title}". Please check and retry.` });
      fetchAll();
    });

    socket.on('otp_verified', (data) => {
      setNotification({ type: 'success', message: `🔐 Pickup OTP verified for "${data.title}"! Head to the shelter now.` });
      fetchAll();
    });

    return () => {
      socket.off('delivery_confirmed');
      socket.off('delivery_rejected');
      socket.off('otp_verified');
    };
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [c, p, e] = await Promise.all([
        API.get('/listings/claimed'),
        API.get('/listings/mypickups'),
        API.get('/impact/myearnings')
      ]);
      setAvailable(c.data); setMyPickups(p.data); setEarnings(e.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const acceptPickup = async (id) => {
    setActing(id);
    try { await API.patch(`/listings/${id}/pickup`); fetchAll(); }
    catch (err) { alert(err.response?.data?.message || 'Failed'); }
    setActing(null);
  };

  const markDropped = async (id) => {
    setDropping(id);
    try {
      await API.patch(`/listings/${id}/dropped`);
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
    setDropping(null);
  };

  const active = myPickups.filter(l => l.status === 'picked');
  const dropped = myPickups.filter(l => l.status === 'dropped');
  const completed = myPickups.filter(l => l.status === 'delivered');

  return (
    <DashboardLayout>
      <div className="dash-volunteer">

      {notification && (
        <div style={{
          position: 'fixed', top: '80px', right: '1.5rem', zIndex: 999,
          background: notification.type === 'success' ? '#1B3A2D' : '#c0392b',
          color: 'white', padding: '1rem 1.5rem', borderRadius: '14px',
          maxWidth: '360px', boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          animation: 'slideIn 0.4s ease', fontSize: '0.95rem', fontWeight: 600
        }}>
          <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(60px);}to{opacity:1;transform:translateX(0);}}`}</style>
          {notification.message}
          <button onClick={() => setNotification(null)} style={{
            marginLeft: '1rem', background: 'rgba(255,255,255,0.2)',
            border: 'none', color: 'white', borderRadius: '6px',
            padding: '0.2rem 0.6rem', cursor: 'pointer'
          }}>✕</button>
        </div>
      )}

      <div className="dash-header dash-header-volunteer">
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <p style={{ opacity: 0.7, fontSize: '0.85rem', marginBottom: '0.25rem' }}>VOLUNTEER DASHBOARD</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
              Welcome, {user.name} 🚴
            </h1>
            <UserSettings />
          </div>
          {earnings && (
            <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>₹{earnings.totalEarned?.toFixed(0) || 0}</div>
                <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>Total Earned</div>
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{earnings.totalDeliveries || 0}</div>
                <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>Deliveries</div>
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{earnings.karmaScore || 0} ⭐</div>
                <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>Karma</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="page">
        {earnings && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { icon: '💰', val: `₹${earnings.totalEarned?.toFixed(2) || '0.00'}`, label: 'Total Earned',    color: '#E8A838' },
              { icon: '📦', val: earnings.totalDeliveries || 0,                     label: 'Deliveries Done', color: '#27ae60' },
              { icon: '⚖️', val: `${earnings.totalKg?.toFixed(1) || 0} kg`,         label: 'Food Delivered',  color: '#2980b9' },
              { icon: '⭐', val: earnings.karmaScore || 0,                           label: 'Karma Score',     color: '#E05C3A' },
            ].map((s, i) => (
              <div key={i} className="card" style={{ textAlign: 'center', borderTop: `4px solid ${s.color}`, padding: '1.25rem' }}>
                <div style={{ fontSize: '1.8rem' }}>{s.icon}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color, fontFamily: 'Sora, sans-serif' }}>{s.val}</div>
                <div style={{ color: '#888', fontSize: '0.82rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {loading && <p>Loading...</p>}

        {active.length > 0 && (
          <>
            <h2 style={{ fontFamily: 'Sora, sans-serif', marginBottom: '1rem', color: '#1a2a5e' }}>🚴 On The Way</h2>
            {active.map(l => (
              <div className="card" key={l._id} style={{ borderLeft: '4px solid #2980b9' }}>
                <h3 style={{ fontFamily: 'Sora, sans-serif' }}>{l.title}</h3>
                <p style={{ color: '#666', fontSize: '0.88rem' }}>{l.description}</p>
                <p>📦 {l.quantity} {l.unit}</p>
                <p>🍽️ Pick up from: <strong>{l.restaurantId?.name}</strong></p>
                <p>📍 {l.restaurantId?.location?.address}</p>
                <p>🏠 Deliver to: <strong>{l.claimedBy?.name}</strong></p>
                <p style={{ color: '#E8A838', fontWeight: 700 }}>💰 You will earn: ₹{(l.quantity * 10).toFixed(2)}</p>

                {!l.otpVerified ? (
                  <OTPDisplay otp={l.pickupOTP} />
                ) : (
                  <>
                    <p style={{ color: '#27ae60', fontWeight: 700, marginTop: '1rem' }}>
                      ✅ Pickup verified by restaurant!
                    </p>
                    <button
                      onClick={() => markDropped(l._id)}
                      disabled={dropping === l._id}
                      style={{
                        marginTop: '1rem', width: '100%',
                        padding: '0.85rem', borderRadius: '12px', border: 'none',
                        background: 'linear-gradient(135deg, #8e44ad, #9b59b6)',
                        color: 'white', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(142,68,173,0.35)'
                      }}>
                      {dropping === l._id ? '⏳ Marking...' : '📦 Mark as Dropped at Shelter'}
                    </button>
                  </>
                )}
              </div>
            ))}
          </>
        )}

        {dropped.length > 0 && (
          <>
            <h2 style={{ fontFamily: 'Sora, sans-serif', margin: '2rem 0 1rem', color: '#8e44ad' }}>
              ⏳ Waiting for Shelter Confirmation
            </h2>
            {dropped.map(l => (
              <div className="card" key={l._id} style={{ borderLeft: '4px solid #8e44ad' }}>
                <h3 style={{ fontFamily: 'Sora, sans-serif' }}>{l.title}</h3>
                <p>📦 {l.quantity} {l.unit}</p>
                <p>🏠 Dropped at: <strong>{l.claimedBy?.name}</strong></p>
                <p style={{ color: '#E8A838', fontWeight: 700 }}>💰 Pending: ₹{(l.quantity * 10).toFixed(2)}</p>
                <div style={{
                  marginTop: '0.75rem', padding: '0.75rem',
                  background: '#f3e8ff', borderRadius: '10px',
                  display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}>
                  <span style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: '#8e44ad', display: 'inline-block',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }} />
                  <style>{`@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.3;}}`}</style>
                  <p style={{ color: '#8e44ad', fontWeight: 600, fontSize: '0.9rem' }}>
                    Waiting for shelter to confirm receipt...
                  </p>
                </div>
              </div>
            ))}
          </>
        )}

        {completed.length > 0 && (
          <>
            <h2 style={{ fontFamily: 'Sora, sans-serif', margin: '2rem 0 1rem', color: '#27ae60' }}>🎉 Completed</h2>
            {completed.map(l => (
              <div className="card" key={l._id} style={{ borderLeft: '4px solid #27ae60', opacity: 0.88 }}>
                <h3 style={{ fontFamily: 'Sora, sans-serif' }}>{l.title}</h3>
                <p>📦 {l.quantity} {l.unit} &nbsp; 🍽️ {l.restaurantId?.name} → 🏠 {l.claimedBy?.name}</p>
                <p style={{ color: '#E8A838', fontWeight: 700 }}>💰 Earned: ₹{(l.quantity * 10).toFixed(2)}</p>
                <p style={{ color: '#27ae60', fontWeight: 700 }}>✅ Delivery confirmed</p>
              </div>
            ))}
          </>
        )}

        <h2 style={{ fontFamily: 'Sora, sans-serif', margin: '2rem 0 1rem', color: '#1a2a5e' }}>📋 Available Pickups</h2>
        {!loading && available.length === 0 && (
          <div className="card" style={{ textAlign: 'center', color: '#888', padding: '2.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🚴</div>
            No pickups available right now. Check back soon!
          </div>
        )}
        {available.map(l => (
          <div className="card" key={l._id} style={{ borderLeft: '4px solid #2980b9' }}>
            <h3 style={{ fontFamily: 'Sora, sans-serif' }}>{l.title}</h3>
            <p style={{ color: '#666', fontSize: '0.88rem' }}>{l.description}</p>
            <p>📦 {l.quantity} {l.unit} &nbsp; 🍽️ <strong>{l.restaurantId?.name}</strong></p>
            {l.restaurantId?.location?.address && <p style={{ fontSize: '0.85rem', color: '#777' }}>📍 {l.restaurantId.location.address}</p>}
            <p>🏠 To: <strong>{l.claimedBy?.name}</strong></p>
            {l.expiresAt && <p style={{ color: '#e67e22', fontSize: '0.85rem' }}>⏱️ Expires: {new Date(l.expiresAt).toLocaleString()}</p>}
            <p style={{ color: '#E8A838', fontWeight: 700, marginTop: '0.25rem' }}>💰 You will earn: ₹{(l.quantity * 10).toFixed(2)}</p>
            <button className="btn-success" onClick={() => acceptPickup(l._id)}
              disabled={acting === l._id} style={{ marginTop: '1rem' }}>
              {acting === l._id ? 'Accepting...' : '🚴 Accept Pickup'}
            </button>
          </div>
        ))}
      </div>
    </div>
    </DashboardLayout>
  );
};

export default VolunteerDashboard;