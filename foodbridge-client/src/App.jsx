import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import RestaurantDashboard from './pages/RestaurantDashboard';
import ShelterDashboard from './pages/ShelterDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import ImpactDashboard from './pages/ImpactDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
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
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;