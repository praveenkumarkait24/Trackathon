import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import DashboardLayout from './layouts/DashboardLayout.js';

// Pages
import LandingPage from './pages/LandingPage.js';
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import ForgotPassword from './pages/ForgotPassword.js';
import ResetPassword from './pages/ResetPassword.js';
import Dashboard from './pages/Dashboard.js';
import Hackathons from './pages/Hackathons.js';
import AddHackathon from './pages/AddHackathon.js';
import HackathonDetails from './pages/HackathonDetails.js';
import EditHackathon from './pages/EditHackathon.js';
import Calendar from './pages/Calendar.js';
import Achievements from './pages/Achievements.js';
import Settings from './pages/Settings.js';
import Profile from './pages/Profile.js';
import JoinTeam from './pages/JoinTeam.js';

// Protected Route Wrapper (for logged-in students only)
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigoAccent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 text-xs">Verifying authorization token...</p>
      </div>
    );
  }

  if (!user) {
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirectTo=${redirectUrl}`} replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

// Open Route Wrapper (prevents logged-in students from viewing Auth pages)
const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigoAccent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    const params = new URLSearchParams(window.location.search);
    const redirectTo = params.get('redirectTo') || '/';
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

// Main Routing Decider for Root `/` Path
const RootRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigoAccent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If student is logged in, show Dashboard. Otherwise show Landing Page.
  return user ? (
    <DashboardLayout>
      <Dashboard />
    </DashboardLayout>
  ) : (
    <LandingPage />
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root Decider */}
          <Route path="/" element={<RootRoute />} />

          {/* Guest / Public Auth Routes */}
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
          <Route path="/reset-password" element={<GuestRoute><ResetPassword /></GuestRoute>} />

          {/* Private / Authenticated Routes */}
          <Route path="/hackathons" element={<ProtectedRoute><Hackathons /></ProtectedRoute>} />
          <Route path="/hackathons/add" element={<ProtectedRoute><AddHackathon /></ProtectedRoute>} />
          <Route path="/hackathons/:id" element={<ProtectedRoute><HackathonDetails /></ProtectedRoute>} />
          <Route path="/hackathons/:id/join" element={<ProtectedRoute><JoinTeam /></ProtectedRoute>} />
          <Route path="/hackathons/:id/edit" element={<ProtectedRoute><EditHackathon /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
          <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
export default App;
