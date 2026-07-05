import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './components/Login';
import Dashboard from './pages/operations/dashboard/Dashboard';
import SecurityRoles from './pages/system/administartion/systemRoles/SecurityRoles';
import Orders from './pages/operations/orders/Orders';
import CreateOrder from './pages/operations/orders/CreateOrder';
import Trips from './pages/operations/trips/Trips';
import Customers from './pages/masters/Customers';
import Drivers from './pages/masters/Drivers';
import Vehicles from './pages/masters/Vehicles';
import Inventory from './pages/masters/Inventory';
import MixDesigns from './pages/masters/MixDesigns';
import Dispatch from './pages/operations/dispatch/Dispatch';
import Quality from './pages/quality/Quality';
import Workflows from './pages/system/administartion/workflows/Workflows';

// Placeholder page for routes not yet built
const ComingSoon = ({ title }: { title: string }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    color: 'var(--gray-400)',
  }}>
    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
    <h2 style={{ color: 'var(--gray-700)', marginBottom: '8px' }}>{title}</h2>
    <p>This section is under development.</p>
  </div>
);

// Redirect to login if not authenticated
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '16px',
        color: 'var(--gray-500)',
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Redirect to dashboard if already logged in
const LoginPage = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  return <Login />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/new" element={<CreateOrder />} />
            <Route path="orders/:id/edit" element={<CreateOrder />} />
            <Route path="customers" element={<Customers />} />
            <Route path="drivers" element={<Drivers />} />
            <Route path="vehicles" element={<Vehicles />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="mix-designs" element={<MixDesigns />} />
            <Route path="trips" element={<Trips />} />
            <Route path="dispatch" element={<Dispatch />} />
            <Route path="quality" element={<Quality />} />
            {/* Administration sub-routes */}
            <Route path="administration" element={<Navigate to="security-roles" replace />} />
            <Route path="administration/security-roles" element={<SecurityRoles />} />
            <Route path="administration/workflows" element={<Workflows />} />
            <Route path="administration/users" element={<ComingSoon title="Users" />} />
            <Route path="administration/settings" element={<ComingSoon title="System Settings" />} />
            <Route path="reports" element={<ComingSoon title="Reports" />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;