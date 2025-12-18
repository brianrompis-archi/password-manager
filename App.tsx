import React, { useState } from 'react';
import { AuthSession, User } from './types';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import { mockAuthService } from './services/mockDb';

function App() {
  const [session, setSession] = useState<AuthSession | null>(null);

  const handleLoginSuccess = async (user: User) => {
    try {
      // In a real Google Apps Script app, this is where we would call google.script.run
      const accessibleHotels = await mockAuthService.getAccessibleHotels(user);
      setSession({
        user,
        accessibleHotels
      });
    } catch (e) {
      console.error("Failed to fetch permissions", e);
    }
  };

  const handleLogout = () => {
    setSession(null);
  };

  if (!session) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return <Dashboard session={session} onLogout={handleLogout} />;
}

export default App;
