import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminStoresPage from './pages/AdminStoresPage';
import UserStoresPage from './pages/UserStoresPage';
import OwnerDashboard from './pages/OwnerDashboard';
import ChangePasswordPage from './pages/ChangePasswordPage';

const RequireAuth = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'store_owner') return <Navigate to="/owner/dashboard" replace />;
    return <Navigate to="/stores" replace />;
  }
  return <>{children}</>;
};

const PublicOnly = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'store_owner') return <Navigate to="/owner/dashboard" replace />;
    return <Navigate to="/stores" replace />;
  }
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      
      <Route path="/login"    element={<PublicOnly><LoginPage /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />

      <Route path="/admin/dashboard" element={<RequireAuth roles={['admin']}><AdminDashboard /></RequireAuth>} />
      <Route path="/admin/users"     element={<RequireAuth roles={['admin']}><AdminUsersPage /></RequireAuth>} />
      <Route path="/admin/stores"    element={<RequireAuth roles={['admin']}><AdminStoresPage /></RequireAuth>} />

      <Route path="/stores" element={<RequireAuth roles={['normal_user']}><UserStoresPage /></RequireAuth>} />

      <Route path="/owner/dashboard" element={<RequireAuth roles={['store_owner']}><OwnerDashboard /></RequireAuth>} />

      <Route path="/change-password" element={<RequireAuth><ChangePasswordPage /></RequireAuth>} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}