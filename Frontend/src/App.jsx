import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ErrorBoundary from './components/ErrorBoundary';
import NotificationContainer from './components/NotificationContainer';
import { TooltipProvider } from '@/components/ui/tooltip';
import './App.css';

// Public Pages
import Home from './components/pages/Home';
import Login from './components/pages/Login';
import Register from './components/pages/Register';

// User Pages
import UserDashboard from './components/pages/UserDashboard';

// Admin Pages
import AdminDashboard from './components/pages/AdminDashboard';
import AdminLogin from './components/pages/AdminLogin';
import SetupSuperAdmin from './components/pages/SetupSuperAdmin';

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <TooltipProvider>
          <Router>
            <AuthProvider>
              <NotificationContainer />
              <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/setup" element={<SetupSuperAdmin />} />
              
              {/* User Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              
              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AuthProvider>
        </Router>
        </TooltipProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;