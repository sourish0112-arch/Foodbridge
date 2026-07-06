import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const dashboardPath = user?.role === "restaurant"
    ? "/restaurant"
    : user?.role === "shelter"
      ? "/shelter"
      : user?.role === "volunteer"
        ? "/volunteer"
        : "/impact";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (user) {
    return (
      <div className="home">
        <div className="floating food1">🥗</div>
        <div className="floating food2">🍅</div>
        <div className="floating food3">🍲</div>
        <div className="floating food4">🍱</div>
        <div className="floating food5">🥬</div>
        <div className="floating food6">❤️</div>

        <nav>
          <div className="logo">🍱 FoodBridge</div>
          <div className="navlinks">
            <a href="#dashboard">Dashboard</a>
            <a href="#impact">Impact</a>
            <a href="#contact">Contact</a>
          </div>
          <button className="login-btn" onClick={handleLogout}>Logout</button>
        </nav>

        <section className="hero">
          <div className="left">
            <span className="badge">🌱 WELCOME BACK, {user.name?.toUpperCase()}</span>
            <h1>
              Your impact dashboard
              <br />
              <span>is ready</span>
            </h1>
            <p>
              Continue managing food listings, pickups, or shelter activity from one place.
            </p>

            <div className="buttons">
              <button className="primary" onClick={() => navigate(dashboardPath)}>
                Go to Dashboard →
              </button>
              <button className="secondary" onClick={() => navigate("/impact")}>
                View Impact 🌱
              </button>
            </div>
          </div>

          <div className="card">
            <h2>You're signed in</h2>
            <h1>Keep the good going</h1>
            <p>
              Every donation you process helps reduce waste and support the community.
            </p>
            <button className="card-btn" onClick={() => navigate(dashboardPath)}>Open Dashboard</button>
            <button className="outline" onClick={() => navigate("/impact")}>Explore Impact</button>

            <div id="contact">
              <h3>Contact Us</h3>
              <p>📧 rihosus0112@gmail.com</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="home">
      {/* Floating Food Emojis */}
      <div className="floating food1">🥗</div>
      <div className="floating food2">🍅</div>
      <div className="floating food3">🍲</div>
      <div className="floating food4">🍱</div>
      <div className="floating food5">🥬</div>
      <div className="floating food6">❤️</div>

      {/* Navbar */}
      <nav>
        <div className="logo">🍱 FoodBridge</div>

        <div className="navlinks">
          <a href="#mission">Mission</a>
          <a href="#impact">Impact</a>
          <a href="#contact">Contact</a>
        </div>

        <Link to="/login">
          <button className="login-btn">Login</button>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="left">
          <span className="badge">🌱 LESS WASTE. MORE HOPE.</span>

          <h1>
            Bridging Surplus
            <br />
            <span>Food with</span>
            <br />
            <b>People in Need</b>
          </h1>

          <p>
            FoodBridge connects restaurants, donors, NGOs, shelters and volunteers to reduce food waste and make a real impact on communities.
          </p>

          <div className="buttons">
            <Link to="/register">
              <button className="primary">Get Started →</button>
            </Link>

            <Link to="/impact">
              <button className="secondary">See Our Impact 🌱</button>
            </Link>
          </div>
        </div>

        {/* Right Card */}
        <div className="card">
          <h2>Be the reason</h2>
          <h1>No Food Goes To Waste</h1>

          <p>Together, we can build a world where no one sleeps hungry.</p>

          <Link to="/login">
            <button className="card-btn">Login →</button>
          </Link>

          <Link to="/register">
            <button className="outline">Create Account</button>
          </Link>

          <div id="contact">
            <h3>Contact Us</h3>
            <p>📧 rihosus0112@gmail.com</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="stats">
        <div>
          🌱
          <h3>2.5K+</h3>
          Meals Shared
        </div>

        <div>
          👥
          <h3>150+</h3>
          Active Donors
        </div>

        <div>
          ❤️
          <h3>80+</h3>
          Shelters Helped
        </div>

        <div>
          🌍
          <h3>5.2K Kg</h3>
          CO₂ Saved
        </div>
      </div>
    </div>
  );
}

export default Home;