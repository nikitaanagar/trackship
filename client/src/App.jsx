import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Guards
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';

// Layouts
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';

// Pages - Auth
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import OTPVerify from './pages/auth/OTPVerify';
import ForgotPassword from './pages/auth/ForgotPassword';
import AuthSuccess from './pages/auth/AuthSuccess';
import LandingPage from './pages/LandingPage';

// Pages - Customer
import CustomerDashboard from './pages/customer/CustomerDashboard';
import BookParcel from './pages/customer/BookParcel';
import TrackParcel from './pages/customer/TrackParcel';
import MyBookings from './pages/customer/MyBookings';

// Pages - Agent
import AgentDashboard from './pages/agent/AgentDashboard';
import ScanPickup from './pages/agent/ScanPickup';
import ManageDeliveries from './pages/agent/ManageDeliveries';

// Pages - Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import AllBookings from './pages/admin/AllBookings';
import Reports from './pages/admin/Reports';

// Dashboard Layout wrapper
const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col md:pl-60">
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 p-4 md:p-6 max-w-6xl w-full mx-auto pb-16 fade-in-entry">
        <Outlet />
      </main>
    </div>
  );
};

// 404 Component
const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-brand-bg text-brand-navy p-4 gap-4 text-center">
    <h1 className="text-6xl font-extrabold text-brand-blue font-mono">404</h1>
    <h2 className="text-xl font-bold">Page Not Found</h2>
    <p className="text-xs text-brand-muted max-w-xs">
      The dashboard or checkpoint path you are looking for does not exist.
    </p>
    <a
      href="/login"
      className="px-4 py-2 bg-brand-blue hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
    >
      Go Home
    </a>
  </div>
);

export const App = () => {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'text-xs font-semibold text-brand-navy border border-brand-border rounded-lg bg-white shadow-md'
            }}
          />
          <Routes>
            {/* Public SaaS Homepage */}
            <Route path="/" element={<LandingPage />} />

            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-otp" element={<OTPVerify />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth-success" element={<AuthSuccess />} />
            
            {/* Public Tracking page accessible to anyone */}
            <Route path="/track" element={<TrackParcel />} />

            {/* Protected Role-Based Dashboard Routes */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>

              {/* Customer Routes */}
              <Route path="/customer">
                <Route path="dashboard" element={<RoleRoute allowedRoles={['customer']}><CustomerDashboard /></RoleRoute>} />
                <Route path="book" element={<RoleRoute allowedRoles={['customer']}><BookParcel /></RoleRoute>} />
                <Route path="track" element={<RoleRoute allowedRoles={['customer']}><TrackParcel /></RoleRoute>} />
                <Route path="bookings" element={<RoleRoute allowedRoles={['customer']}><MyBookings /></RoleRoute>} />
              </Route>

              {/* Agent Routes */}
              <Route path="/agent">
                <Route path="dashboard" element={<RoleRoute allowedRoles={['agent']}><AgentDashboard /></RoleRoute>} />
                <Route path="scan" element={<RoleRoute allowedRoles={['agent']}><ScanPickup /></RoleRoute>} />
                <Route path="deliveries" element={<RoleRoute allowedRoles={['agent']}><ManageDeliveries /></RoleRoute>} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin">
                <Route path="dashboard" element={<RoleRoute allowedRoles={['admin']}><AdminDashboard /></RoleRoute>} />
                <Route path="users" element={<RoleRoute allowedRoles={['admin']}><ManageUsers /></RoleRoute>} />
                <Route path="bookings" element={<RoleRoute allowedRoles={['admin']}><AllBookings /></RoleRoute>} />
                <Route path="reports" element={<RoleRoute allowedRoles={['admin']}><Reports /></RoleRoute>} />
              </Route>
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
