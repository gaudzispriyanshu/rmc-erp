import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import './App.css';

// Main app content
const AppContent = () => {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div style={{ padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>RMC ERP System</h1>
        <div>
          <span>Welcome, {user.name} ({user.role})</span>
          <button 
            onClick={logout}
            style={{ marginLeft: '15px', padding: '5px 10px' }}
          >
            Logout
          </button>
        </div>
      </header>
      
      <main>
        <h2>Dashboard</h2>
        <p>You are successfully logged in!</p>
        {/* We'll add more components here */}
      </main>
    </div>
  );
};

// App wrapper with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;