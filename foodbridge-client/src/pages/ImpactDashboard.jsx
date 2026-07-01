import { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import { useNavigate } from "react-router-dom";
import DashboardLayout from '../components/DashboardLayout';

// Animated counter hook
function useCountUp(target, duration = 2000) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return val;
}

const floaters = [
  { emoji: '🌍', top: '5%',  left: '3%',  delay: '0s',   size: '3rem',  dur: '9s'  },
  { emoji: '🍱', top: '12%', right: '4%', delay: '1.5s', size: '2.5rem',dur: '7s'  },
  { emoji: '🌱', top: '30%', left: '1%',  delay: '3s',   size: '2rem',  dur: '11s' },
  { emoji: '🤝', top: '50%', right: '2%', delay: '0.5s', size: '2.8rem',dur: '8s'  },
  { emoji: '♻️', top: '65%', left: '4%',  delay: '2s',   size: '2.2rem',dur: '10s' },
  { emoji: '🍛', top: '75%', right: '6%', delay: '4s',   size: '2rem',  dur: '6s'  },
  { emoji: '💚', top: '88%', left: '8%',  delay: '1s',   size: '1.8rem',dur: '12s' },
  { emoji: '🥗', top: '20%', left: '45%', delay: '5s',   size: '1.6rem',dur: '8s'  },
];

const StatCard = ({ icon, value, label, color, prefix = '', suffix = '' }) => {
  const counted = useCountUp(parseFloat(value) || 0);
  return (
    <div style={{
      background: 'rgba(255,255,255,0.07)',
      border: `1px solid rgba(255,255,255,0.12)`,
      borderTop: `4px solid ${color}`,
      borderRadius: '20px',
      padding: '1.75rem 1.25rem',
      textAlign: 'center',
      backdropFilter: 'blur(16px)',
      transition: 'transform 0.3s, box-shadow 0.3s',
      cursor: 'default',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-6px)';
      e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.3), 0 0 20px ${color}33`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{
        fontSize: '2rem', fontWeight: 800,
        fontFamily: 'Sora, sans-serif', color,
        letterSpacing: '-0.02em'
      }}>
        {prefix}{counted}{suffix}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
        {label}
      </div>
    </div>
  );
};

const ImpactDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    API.get('/impact/stats')
      .then(({ data }) => { setStats(data); setTimeout(() => setVisible(true), 100); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0f2218 0%, #1B3A2D 40%, #0d1f15 80%, #061209 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>

      {/* Animated background orbs */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse at 20% 30%, rgba(39,174,96,0.12) 0%, transparent 55%),
          radial-gradient(ellipse at 80% 70%, rgba(232,168,56,0.1) 0%, transparent 55%),
          radial-gradient(ellipse at 50% 10%, rgba(224,92,58,0.07) 0%, transparent 40%)
        `,
        animation: 'orbPulse 8s ease-in-out infinite alternate'
      }} />

      <style>{`
        @keyframes orbPulse {
          from { opacity: 0.6; transform: scale(1); }
          to   { opacity: 1;   transform: scale(1.05); }
        }
        @keyframes floatEmoji {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          33%      { transform: translateY(-22px) rotate(6deg); }
          66%      { transform: translateY(10px) rotate(-4deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(232,168,56,0.4); }
          70%  { transform: scale(1);    box-shadow: 0 0 0 12px rgba(232,168,56,0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(232,168,56,0); }
        }
      `}</style>

      {/* Floating emojis */}
      {floaters.map((f, i) => (
        <div key={i} style={{
          position: 'absolute', top: f.top, left: f.left, right: f.right,
          fontSize: f.size, opacity: 0.1, pointerEvents: 'none',
          animation: `floatEmoji ${f.dur} ease-in-out infinite`,
          animationDelay: f.delay,
        }}>{f.emoji}</div>
      ))}

      {/* Hero */}
      {/* Hero Section */}

      <div
        style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              maxWidth: "860px",
              margin: "0 auto",
              flexWrap: "wrap",
              gap: "1rem"
            }}
>


        <h1
          style={{
            fontFamily: "Sora, sans-serif",
            fontSize: "clamp(1.8rem,5vw,2.8rem)",
            fontWeight: 800,
            background:
              "linear-gradient(135deg,#ffffff,#E8A838,#27ae60)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "shimmer 4s infinite",
            margin: 0
          }}
        >
          🌍 City Impact Dashboard
        </h1>



        <button
          onClick={() => navigate("/")}
          style={{
            padding: "12px 25px",
            borderRadius: "30px",
            border: "1px solid rgba(255,255,255,0.3)",
            background: "rgba(255,255,255,0.12)",
            color: "white",
            fontSize: "1rem",
            cursor: "pointer",
            backdropFilter: "blur(10px)",
            transition: "0.3s"
          }}

          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.08)";
          }}

          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}

        >

          🏠 Home

        </button>


      </div>



<p
  style={{
    color: "rgba(255,255,255,0.5)",
    fontSize: "1rem",
    maxWidth: "420px",
    margin: "15px auto",
    textAlign:"center"
  }}
>

  Every donation tracked. Every meal counted. Every life touched.

</p>

      {/* Content */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 1rem 4rem', position: 'relative', zIndex: 1 }}>

        {loading && (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: '3rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
            Loading impact data...
          </div>
        )}

        {stats && visible && (
          <>
            {/* STAT GRID */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))',
              gap: '1rem', marginBottom: '2rem',
              animation: 'fadeSlideUp 0.6s ease 0.2s both'
            }}>
              <StatCard icon="🍱" value={stats.totalMeals}           label="Meals Served"        color="#E8A838" />
              <StatCard icon="⚖️" value={stats.totalKg?.toFixed(1)}  label="Food Rescued (kg)"  color="#27ae60" suffix=" kg" />
              <StatCard icon="🌿" value={stats.totalCO2?.toFixed(1)} label="CO₂ Saved (kg)"     color="#5dade2" suffix=" kg" />
              <StatCard icon="📦" value={stats.totalListings}         label="Total Donations"    color="#E05C3A" />
              <StatCard icon="💰" value={stats.totalEarned?.toFixed(0) || 0} label="Paid to Volunteers" color="#E8A838" prefix="₹" />
            </div>

            {/* EQUIVALENT BANNER */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(232,168,56,0.15), rgba(39,174,96,0.1))',
              border: '1px solid rgba(232,168,56,0.25)',
              borderRadius: '20px', padding: '1.5rem 2rem',
              marginBottom: '2rem', textAlign: 'center',
              animation: 'fadeSlideUp 0.6s ease 0.4s both'
            }}>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', marginBottom: '0.5rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                That's equivalent to
              </p>
              <p style={{ color: 'white', fontSize: '1.05rem', fontWeight: 600 }}>
                🌳 {Math.floor((stats.totalCO2 || 0) / 21)} trees planted &nbsp;·&nbsp;
                🚗 {Math.floor((stats.totalCO2 || 0) / 0.21)} km of car emissions avoided &nbsp;·&nbsp;
                💧 {Math.floor((stats.totalKg || 0) * 1000)} litres of water saved
              </p>
            </div>

            {/* LEADERBOARD */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px', padding: '2rem',
              backdropFilter: 'blur(20px)',
              animation: 'fadeSlideUp 0.6s ease 0.6s both'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.75rem' }}>🏆</span>
                <h2 style={{ fontFamily: 'Sora, sans-serif', color: 'white', fontSize: '1.3rem', fontWeight: 700 }}>
                  Restaurant Leaderboard
                </h2>
              </div>

              {stats.leaderboard?.length === 0 && (
                <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '2rem' }}>
                  No data yet. Start donating food!
                </p>
              )}

              {stats.leaderboard?.map((r, i) => (
                <div key={r._id}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '1rem 1.25rem', marginBottom: '0.5rem',
                    borderRadius: '14px',
                    background: i === 0
                      ? 'linear-gradient(135deg, rgba(232,168,56,0.2), rgba(232,168,56,0.05))'
                      : 'rgba(255,255,255,0.04)',
                    border: i === 0 ? '1px solid rgba(232,168,56,0.3)' : '1px solid rgba(255,255,255,0.06)',
                    transition: 'transform 0.2s, background 0.2s',
                    cursor: 'default',
                    animation: `fadeSlideUp 0.5s ease ${0.7 + i * 0.1}s both`
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateX(6px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '1.5rem', minWidth: '2rem', textAlign: 'center' }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </span>
                    <div>
                      <div style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>{r.name}</div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>
                        {r.karmaScore * 0.1} kg food donated
                      </div>
                    </div>
                  </div>
                  <div style={{
                    background: i === 0 ? 'rgba(232,168,56,0.3)' : 'rgba(255,255,255,0.08)',
                    color: i === 0 ? '#E8A838' : 'rgba(255,255,255,0.7)',
                    padding: '0.3rem 1rem', borderRadius: '20px',
                    fontWeight: 700, fontSize: '0.88rem',
                    border: i === 0 ? '1px solid rgba(232,168,56,0.5)' : '1px solid rgba(255,255,255,0.1)'
                  }}>
                    {r.karmaScore} pts
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      </div>
    </DashboardLayout>
  );
};

export default ImpactDashboard;