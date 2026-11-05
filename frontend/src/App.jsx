import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import MainLayout from './components/MainLayout';

// Pages
import StudentDashboard from './pages/StudentDashboard';
import Feed from './pages/Feed';
import SubmitComplaint from './pages/SubmitComplaint';
import StaffQueue from './pages/StaffQueue';
import Dashboard from './pages/Dashboard';
import PriorityManagement from './pages/PriorityManagement';
import AdminUsers from './pages/AdminUsers';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Route wrappers
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const StaffRoute = ({ children }) => {
  const { isAuthenticated, isStaff, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated && isStaff ? children : <Navigate to="/dashboard" replace />;
};

// Route Shell Layout wrapper (excludes auth pages from the sidebar/header)
function AppShellRoutes() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }

  return (
    <MainLayout>
      <Routes>
        {/* Core Routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-complaints"
          element={
            <ProtectedRoute>
              <Feed filterMyReports={true} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/submit"
          element={
            <ProtectedRoute>
              <SubmitComplaint />
            </ProtectedRoute>
          }
        />

        {/* Staff & Operations Routes */}
        <Route
          path="/staff/queue"
          element={
            <StaffRoute>
              <StaffQueue />
            </StaffRoute>
          }
        />
        <Route
          path="/my-assigned"
          element={
            <StaffRoute>
              <Feed filterAssignedToMe={true} />
            </StaffRoute>
          }
        />
        <Route
          path="/priority"
          element={
            <ProtectedRoute>
              <PriorityManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <StaffRoute>
              <Dashboard />
            </StaffRoute>
          }
        />

        {/* Administration Routes */}
        <Route
          path="/admin/users"
          element={
            <StaffRoute>
              <AdminUsers />
            </StaffRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MainLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppShellRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
