import { useState, useEffect } from 'react';
import API, { socket } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import UserSettings from '../components/UserSettings';

const ShelterDashboard = () => {
  const { user } = useAuth();
  const [available, setAvailable] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(null);
  const [delivering, setDelivering] = useState(null);
  const [notification, setNotification] = useState(null);
  const [incomingDelivery, setIncomingDelivery] = useState(null);

  useEffect(() => {
    fetchAll();
    socket.emit('join', user.id);

    socket.on('delivery_dropped', (data) => {
      setIncomingDelivery(data);
      fetchAll();
    });

    return () => socket.off('delivery_dropped');
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [a, c] = await Promise.all([API.get('/listings'), API.get('/listings/myclaims')]);
      setAvailable(a.data); setMyClaims(c.data);

      const dropped = c.data.find(l => l.status === 'dropped');
      if (dropped && !incomingDelivery) {
        setIncomingDelivery({
          listingId: dropped._id,
          title: dropped.title,
          quantity: dropped.quantity,
          unit: dropped.unit,
          volunteerName: dropped.pickedBy?.name
        });
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const claimListing = async (id) => {
    setClaiming(id);
    try {
      await API.patch(`/listings/${id}/claim`);
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
    setClaiming(null);
  };

  const confirmDelivery = async (id) => {
    setDelivering(id);
    try {
      const { data } = await API.patch(`/listings/${id}/deliver`);
      setIncomingDelivery(null);
      fetchAll();
      setNotification({
        type: 'success',
        message: `🎉 Confirmed!\n🍱 ${data.impact.mealsServed} meals served · 🌿 ${data.impact.co2Saved}kg CO₂ saved · 💰 Volunteer earned ₹${data.impact.volunteerEarned}`
      });
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
    setDelivering(null);
  };

  const rejectDelivery = async (id) => {
    try {
      await API.patch(`/listings/${id}/reject`);
      setIncomingDelivery(null);
      fetchAll();
    } catch (err) { alert('Failed to reject'); }
  };

  const statusColor = {
    claimed: '#e67e22', picked: '#2980b9',
    dropped: '#8e44ad', delivered: '#27ae60'
  };

  const delivered = myClaims.filter(l => l.status === 'delivered').length;

  return (
    <div className="dash-shelter">
      <DashboardNav />

      {/* Real-time popup */}
      {incomingDelivery && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(6px)', animation: 'fadeIn 0.3s ease'
        }}>
          <style>{`
            @keyframes fadeIn { from{opacity:0;} to{opacity:1;} }
            @keyframes popIn  { from{opacity:0;transform:scale(0.85);} to{opacity:1;transform:scale(1);} }
          `}</style>
          <div style={{
            background: 'white', borderRadius: '24px',
            padding: '2.5rem', maxWidth: '420px', width: '90%',
            textAlign: 'center', boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
            animation: 'popIn 0.35s ease'
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🚴</div>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.4rem', color: '#1B3A2D', marginBottom: '0.5rem' }}>
              Food has arrived!
            </h2>
            <p style={{ color: '#555', marginBottom: '0.25rem', fontSize: '1rem' }}>
              <strong>{incomingDelivery.volunteerName}</strong> has dropped off:
            </p>
            <div style={{
              background: '#f0fff4', border: '1px solid #27ae60',
              borderRadius: '12px', padding: '1rem', margin: '1rem 0'
            }}>
              <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1B3A2D' }}>{incomingDelivery.title}</p>
              <p style={{ color: '#555' }}>📦 {incomingDelivery.quantity} {incomingDelivery.unit}</p>
            </div>
            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Did you receive this food?
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => rejectDelivery(incomingDelivery.listingId)}
                style={{
                  flex: 1, padding: '0.85rem', borderRadius: '12px',
                  border: '2px solid #e74c3c', background: 'white',
                  color: '#e74c3c', fontWeight: 700, fontSize: '1rem', cursor: 'pointer'
                }}>❌ No</button>
              <button onClick={() => confirmDelivery(incomingDelivery.listingId)}
                disabled={delivering === incomingDelivery.listingId}
                style={{
                  flex: 1, padding: '0.85rem', borderRadius: '12px',
                  border: 'none', background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
                  color: 'white', fontWeight: 700, fontSize: '1rem', cursor: 'pointer'
                }}>
                {delivering === incomingDelivery.listingId ? '⏳...' : '✅ Yes, Received!'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {notification && (
        <div style={{
          position: 'fixed', top: '80px', right: '1.5rem', zIndex: 999,
          background: '#1B3A2D', color: 'white',
          padding: '1rem 1.5rem', borderRadius: '14px',
          maxWidth: '380px', boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          animation: 'slideIn 0.4s ease', fontSize: '0.9rem', fontWeight: 600,
          whiteSpace: 'pre-line'
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

      <div className="dash-header dash-header-shelter">
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <p style={{ opacity: 0.7, fontSize: '0.85rem', marginBottom: '0.25rem' }}>SHELTER DASHBOARD</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
              Welcome, {user.name} 🏠
            </h1>
            <UserSettings />
          </div>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{available.length}</div>
              <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>Available Now</div>
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{myClaims.length}</div>
              <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>My Claims</div>
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{delivered}</div>
              <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>Received</div>
            </div>
          </div>
        </div>
      </div>

      <div className="page">
        {myClaims.length > 0 && (
          <>
            <h2 style={{ fontFamily: 'Sora, sans-serif', marginBottom: '1rem', color: '#1a4d3a' }}>
              📦 My Active Claims
            </h2>
            {myClaims.map(l => (
              <div className="card" key={l._id}
                style={{ borderLeft: `4px solid ${statusColor[l.status] || '#ccc'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontFamily: 'Sora, sans-serif' }}>{l.title}</h3>
                    <p style={{ color: '#666', fontSize: '0.88rem' }}>{l.description}</p>
                    <p>📦 {l.quantity} {l.unit} &nbsp; 🍽️ From: <strong>{l.restaurantId?.name}</strong></p>
                    {l.pickedBy && <p>🚴 Volunteer: <strong>{l.pickedBy?.name}</strong></p>}
                    {l.expiresAt && (
                      <p style={{ color: '#e67e22', fontSize: '0.85rem' }}>
                        ⏱️ Expires: {new Date(l.expiresAt).toLocaleString()}
                      </p>
                    )}

                    {l.status === 'claimed' && (
                      <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#fff8e1', borderRadius: '10px' }}>
                        <p style={{ color: '#e67e22', fontWeight: 600, fontSize: '0.9rem' }}>
                          ⏳ Waiting for a volunteer to accept pickup...
                        </p>
                      </div>
                    )}

                    {l.status === 'picked' && (
                      <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#e8f0fe', borderRadius: '10px' }}>
                        <p style={{ color: '#2980b9', fontWeight: 600, fontSize: '0.9rem' }}>
                          🚴 Volunteer is on the way to you!
                        </p>
                      </div>
                    )}

                    {/* SIMPLE BUTTON — shows when dropped */}
                    {l.status === 'dropped' && (
                      <div style={{
                        marginTop: '1rem', padding: '1rem',
                        background: '#f3e8ff', borderRadius: '12px',
                        border: '1px solid #8e44ad'
                      }}>
                        <p style={{ fontWeight: 700, color: '#8e44ad', marginBottom: '0.4rem' }}>
                          📦 Food dropped at your door!
                        </p>
                        <p style={{ fontSize: '0.85rem', color: '#555', marginBottom: '0.75rem' }}>
                          Did you receive it?
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button onClick={() => rejectDelivery(l._id)}
                            style={{
                              flex: 1, padding: '0.6rem', borderRadius: '8px',
                              border: '2px solid #e74c3c', background: 'white',
                              color: '#e74c3c', fontWeight: 700, cursor: 'pointer'
                            }}>❌ No</button>
                          <button onClick={() => confirmDelivery(l._id)}
                            disabled={delivering === l._id}
                            style={{
                              flex: 1, padding: '0.6rem', borderRadius: '8px',
                              border: 'none', background: '#27ae60',
                              color: 'white', fontWeight: 700, cursor: 'pointer'
                            }}>
                            {delivering === l._id ? '⏳...' : '✅ Yes, Received!'}
                          </button>
                        </div>
                      </div>
                    )}

                    {l.status === 'delivered' && (
                      <p style={{ color: '#27ae60', fontWeight: 700, marginTop: '0.5rem' }}>
                        🎉 Successfully received!
                      </p>
                    )}
                  </div>

                  <span className="status-badge"
                    style={{ background: statusColor[l.status] || '#ccc', marginLeft: '1rem' }}>
                    {l.status}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}

        <h2 style={{ fontFamily: 'Sora, sans-serif', margin: '2rem 0 1rem', color: '#1a4d3a' }}>
          🍱 Available Food Near You
        </h2>
        {loading && <p style={{ color: '#666' }}>Loading...</p>}
        {!loading && available.length === 0 && (
          <div className="card" style={{ textAlign: 'center', color: '#888', padding: '2.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔍</div>
            No food available right now. Check back soon!
          </div>
        )}
        {available.map(l => (
          <div className="card" key={l._id} style={{ borderLeft: '4px solid #27ae60' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontFamily: 'Sora, sans-serif' }}>{l.title}</h3>
                <p style={{ color: '#666', fontSize: '0.88rem' }}>{l.description}</p>
                <p>📦 {l.quantity} {l.unit} &nbsp;<span className="tag">{l.category}</span></p>
                <p style={{ fontSize: '0.88rem', color: '#555' }}>🍽️ {l.restaurantId?.name}</p>
                {l.restaurantId?.location?.address && (
                  <p style={{ fontSize: '0.85rem', color: '#777' }}>📍 {l.restaurantId.location.address}</p>
                )}
                {l.expiresAt && (
                  <p style={{ color: '#e67e22', fontSize: '0.85rem' }}>
                    ⏱️ Safe until: {new Date(l.expiresAt).toLocaleString()}
                  </p>
                )}
                {l.storageAdvice && (
                  <p style={{ color: '#27ae60', fontSize: '0.85rem' }}>💡 {l.storageAdvice}</p>
                )}
              </div>
              <button className="btn-success"
                onClick={() => claimListing(l._id)}
                disabled={claiming === l._id}
                style={{ marginLeft: '1rem', whiteSpace: 'nowrap' }}>
                {claiming === l._id ? 'Claiming...' : '✋ Claim'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShelterDashboard;