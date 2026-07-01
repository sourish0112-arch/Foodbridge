import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from "./pages/Home";
import Login from './pages/Login';
import Register from './pages/Register';
import RestaurantDashboard from './pages/RestaurantDashboard';
import ShelterDashboard from './pages/ShelterDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import ImpactDashboard from './pages/ImpactDashboard';

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/impact" element={<ImpactDashboard />} />

          <Route path="/restaurant" element={
            <ProtectedRoute roles={['restaurant']}>
              <RestaurantDashboard />
            </ProtectedRoute>
          } />

          <Route path="/shelter" element={
            <ProtectedRoute roles={['shelter']}>
              <ShelterDashboard />
            </ProtectedRoute>
          } />

          <Route path="/volunteer" element={
            <ProtectedRoute roles={['volunteer']}>
              <VolunteerDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;