import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === 'restaurant') return '/restaurant';
    if (user.role === 'shelter') return '/shelter';
    if (user.role === 'volunteer') return '/volunteer';
  };

  return (
    <nav style={{
      background: '#1B3A2D',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      {/* Logo — clicking takes logged in users to their dashboard */}
      <Link
        to={user ? getDashboardLink() : '/'}
        style={{ color: '#E8A838', fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none' }}
      >
        🍱 FoodBridge
      </Link>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link to="/impact" style={{ color: 'white', textDecoration: 'none' }}>
          🌍 Impact
        </Link>

        {user ? (
          <>
            {/* Dashboard button */}
            <Link
              to={getDashboardLink()}
              style={{
                color: '#1B3A2D',
                background: '#E8A838',
                padding: '0.4rem 1rem',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '0.9rem'
              }}
            >
              📊 My Dashboard
            </Link>

            <span style={{ color: '#aaa', fontSize: '0.9rem' }}>
              {user.name}
            </span>

            <button onClick={handleLogout} style={{
              background: '#E05C3A',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer'
            }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>
              Login
            </Link>
            <Link to="/register" style={{
              background: '#E8A838',
              color: '#1B3A2D',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;