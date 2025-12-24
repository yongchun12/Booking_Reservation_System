import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/user/Dashboard';
import Calendar from './pages/user/Calendar';
import Resources from './pages/user/Resources';
import MyBookings from './pages/user/MyBookings';
import NewBooking from './pages/user/NewBooking';
import Settings from './pages/user/Settings';
import AdminDashboard from './pages/admin/AdminDashboard';
import ResourceManagement from './pages/admin/ResourceManagement';
import UserManagement from './pages/admin/UserManagement';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route index element={<Navigate to="/auth/login" replace />} />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="resources" element={<Resources />} />
          <Route path="my-bookings" element={<MyBookings />} />
          <Route path="new-booking" element={<NewBooking />} />
          <Route path="settings" element={<Settings />} />

          {/* Admin Routes */}
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/resources" element={<ResourceManagement />} />
          <Route path="admin/users" element={<UserManagement />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
