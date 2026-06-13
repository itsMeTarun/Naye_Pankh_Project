import React, { useEffect, useState } from 'react';
import { api } from './services/api';
import LandingPage from './pages/LandingPage';
import Auth from './pages/Auth';
import VolunteerDashboard from './pages/VolunteerDashboard';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [volunteer, setVolunteer] = useState(null);
  const [appLoading, setAppLoading] = useState(true);

  // Auto-restore session from token
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('volosphere_token');
      if (!token) {
        setAppLoading(false);
        return;
      }

      try {
        const data = await api.auth.me();
        setUser(data.user);
        if (data.volunteer) {
          setVolunteer(data.volunteer);
        }
        
        // Auto navigate if user refreshed dashboard
        if (data.user.role === 'admin') {
          setCurrentPage('admin-dashboard');
        } else {
          setCurrentPage('volunteer-dashboard');
        }
      } catch (err) {
        console.error('Session restoration failed:', err);
        localStorage.removeItem('volosphere_token');
      } finally {
        setAppLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Handle successful login or signup
  const handleLoginSuccess = (token, userRecord, volunteerRecord) => {
    localStorage.setItem('volosphere_token', token);
    setUser(userRecord);
    if (volunteerRecord) {
      setVolunteer(volunteerRecord);
    }
    
    if (userRecord.role === 'admin') {
      setCurrentPage('admin-dashboard');
    } else {
      setCurrentPage('volunteer-dashboard');
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('volosphere_token');
    setUser(null);
    setVolunteer(null);
    setCurrentPage('landing');
  };

  if (appLoading) {
    return (
      <div style={styles.appSpinnerWrapper}>
        <div style={styles.spinner}></div>
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', fontStyle: 'italic' }}>Restoring VoloSphere session...</p>
      </div>
    );
  }

  // Routing render mapping
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {currentPage === 'landing' && (
        <LandingPage 
          onNavigate={setCurrentPage} 
          user={user} 
          onLogout={handleLogout} 
        />
      )}
      
      {currentPage === 'auth' && (
        <Auth 
          onNavigate={setCurrentPage} 
          onLoginSuccess={handleLoginSuccess} 
        />
      )}

      {currentPage === 'volunteer-dashboard' && (
        user && user.role === 'volunteer' ? (
          <VolunteerDashboard 
            onNavigate={setCurrentPage} 
            user={user} 
            onLogout={handleLogout} 
          />
        ) : (
          <LandingPage onNavigate={setCurrentPage} user={user} onLogout={handleLogout} />
        )
      )}

      {currentPage === 'admin-dashboard' && (
        user && user.role === 'admin' ? (
          <AdminDashboard 
            onNavigate={setCurrentPage} 
            user={user} 
            onLogout={handleLogout} 
          />
        ) : (
          <LandingPage onNavigate={setCurrentPage} user={user} onLogout={handleLogout} />
        )
      )}
    </div>
  );
}

const styles = {
  appSpinnerWrapper: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0e1a',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(255, 255, 255, 0.05)',
    borderTopColor: 'var(--primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  }
};
