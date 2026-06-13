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
  const [accent, setAccent] = useState(localStorage.getItem('volosphere_accent') || 'indigo');
  const [mode, setMode] = useState(localStorage.getItem('volosphere_mode') || 'dark');
  const [showSplash, setShowSplash] = useState(true);
  const [fadeSplash, setFadeSplash] = useState(false);
  const [minTimerDone, setMinTimerDone] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading VoloSphere...');

  const loadingMessages = [
    "Telling the server to wake up from its free-tier nap...",
    "Faking progress bar so we look professional...",
    "Convincing MongoDB Atlas that we're decent developers...",
    "Searching StackOverflow for 'why is my code not working'...",
    "Watering the server hamsters...",
    "Mining Bitcoin... just kidding, loading volunteer data...",
    "Locating the missing semicolon in the backend...",
    "Please act surprised when it actually works...",
    "Adding some animations to distract you from network latency...",
    "Wrangling the CSS variables to behave..."
  ];

  useEffect(() => {
    const randomMsg = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
    setLoadingMessage(randomMsg);
  }, []);

  // Splash minimum presentation duration timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimerDone(true);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  // Trigger splash fade out once both min timer and restore session calls are complete
  useEffect(() => {
    if (minTimerDone && !appLoading) {
      setFadeSplash(true);
      const removeTimer = setTimeout(() => {
        setShowSplash(false);
      }, 600); // 600ms matching CSS transition
      return () => clearTimeout(removeTimer);
    }
  }, [minTimerDone, appLoading]);

  // Sync accent and mode to body attributes
  useEffect(() => {
    document.body.setAttribute('data-accent', accent);
    document.body.setAttribute('data-mode', mode);
    localStorage.setItem('volosphere_accent', accent);
    localStorage.setItem('volosphere_mode', mode);
  }, [accent, mode]);

  const handleSelectAccent = (selectedAccent) => {
    setAccent(selectedAccent);
  };

  const handleToggleMode = () => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  };

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

  // Routing render mapping
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {showSplash && (
        <div className={`splash-screen ${fadeSplash ? 'fade-out' : ''}`}>
          <div className="splash-content">
            <div className="splash-logo-wrapper">
              <div className="splash-logo flex-center">NP</div>
              <div className="splash-logo-glow"></div>
            </div>
            <h1 className="splash-title brand-title">VoloSphere</h1>
            <p className="splash-subtitle">NayePankh Foundation Portal</p>
            <div className="splash-loading-bar">
              <div className="splash-loading-progress"></div>
            </div>
          </div>
        </div>
      )}

      {!appLoading && (
        <>
          {currentPage === 'landing' && (
            <LandingPage 
              onNavigate={setCurrentPage} 
              user={user} 
              onLogout={handleLogout} 
              accent={accent}
              mode={mode}
              onSelectAccent={handleSelectAccent}
              onToggleMode={handleToggleMode}
            />
          )}
          
          {currentPage === 'auth' && (
            <Auth 
              onNavigate={setCurrentPage} 
              onLoginSuccess={handleLoginSuccess} 
              accent={accent}
              mode={mode}
              onSelectAccent={handleSelectAccent}
              onToggleMode={handleToggleMode}
            />
          )}

          {currentPage === 'volunteer-dashboard' && (
            user && user.role === 'volunteer' ? (
              <VolunteerDashboard 
                onNavigate={setCurrentPage} 
                user={user} 
                onLogout={handleLogout} 
                accent={accent}
                mode={mode}
                onSelectAccent={handleSelectAccent}
                onToggleMode={handleToggleMode}
              />
            ) : (
              <LandingPage 
                onNavigate={setCurrentPage} 
                user={user} 
                onLogout={handleLogout} 
                accent={accent}
                mode={mode}
                onSelectAccent={handleSelectAccent}
                onToggleMode={handleToggleMode} 
              />
            )
          )}

          {currentPage === 'admin-dashboard' && (
            user && user.role === 'admin' ? (
              <AdminDashboard 
                onNavigate={setCurrentPage} 
                user={user} 
                onLogout={handleLogout} 
                accent={accent}
                mode={mode}
                onSelectAccent={handleSelectAccent}
                onToggleMode={handleToggleMode}
              />
            ) : (
              <LandingPage 
                onNavigate={setCurrentPage} 
                user={user} 
                onLogout={handleLogout} 
                accent={accent}
                mode={mode}
                onSelectAccent={handleSelectAccent}
                onToggleMode={handleToggleMode} 
              />
            )
          )}
        </>
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
