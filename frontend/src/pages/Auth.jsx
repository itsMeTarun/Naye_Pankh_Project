import React, { useState } from 'react';
import { api } from '../services/api';
import { LogIn, UserPlus, ArrowLeft, Check, AlertTriangle } from 'lucide-react';

const AVAILABLE_SKILLS = [
  'Teaching',
  'Public Speaking',
  'Social Media',
  'Event Management',
  'Content Writing',
  'Graphic Design',
  'Logistics & Coordination',
  'First Aid / Medical Assistance'
];

const INTERESTS = [
  'Education',
  'Food Relief',
  'Environment',
  'Healthcare',
  'Disaster Relief',
  'Women Empowerment'
];

export default function Auth({ onNavigate, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [availability, setAvailability] = useState('Weekends');
  const [bio, setBio] = useState('');
  
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);

  // Toggle skills selection
  const handleToggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  // Toggle interests selection
  const handleToggleInterest = (interest) => {
    setSelectedInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        if (!email || !password) {
          throw new Error('Please enter both email and password.');
        }
        const response = await api.auth.login(email, password);
        onLoginSuccess(response.token, response.user, response.volunteer);
      } else {
        if (!name || !email || !password) {
          throw new Error('Name, Email, and Password are required fields.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        const registrationPayload = {
          name,
          email,
          password,
          phone,
          skills: selectedSkills,
          availability,
          interests: selectedInterests,
          bio
        };

        const response = await api.auth.register(registrationPayload);
        onLoginSuccess(response.token, response.user, response.volunteer);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container} className="animate-fade">
      <div style={styles.backButtonContainer}>
        <button 
          onClick={() => onNavigate('landing')} 
          style={styles.backBtn}
          className="btn btn-secondary"
          id="auth-back-btn"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>
      </div>

      <div style={styles.card} className="glass-card">
        {/* Brand details */}
        <div style={styles.brandContainer}>
          <div style={styles.logoBadge}>NP</div>
          <h2 style={styles.brandTitle}>VoloSphere</h2>
          <p style={styles.brandDesc}>
            {isLogin 
              ? 'Welcome back to NayePankh Volunteer Portal' 
              : 'Join as a volunteer and make a real difference'}
          </p>
        </div>

        {/* Form Tabs */}
        <div style={styles.tabContainer}>
          <button 
            onClick={() => { setIsLogin(true); setError(''); }}
            style={{ 
              ...styles.tab, 
              borderBottomColor: isLogin ? 'var(--primary)' : 'transparent',
              color: isLogin ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
            id="tab-login"
          >
            <LogIn size={16} /> Login
          </button>
          <button 
            onClick={() => { setIsLogin(false); setError(''); }}
            style={{ 
              ...styles.tab, 
              borderBottomColor: !isLogin ? 'var(--primary)' : 'transparent',
              color: !isLogin ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
            id="tab-register"
          >
            <UserPlus size={16} /> Register
          </button>
        </div>

        {/* Errors */}
        {error && (
          <div style={styles.errorAlert} className="animate-fade">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <div className="form-group animate-fade">
              <label className="form-label">Full Name *</label>
              <input 
                type="text" 
                className="form-input" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter your full name"
                required
                id="input-name"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input 
              type="email" 
              className="form-input" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="admin@nayepankh.org"
              required
              id="input-email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input 
              type="password" 
              className="form-input" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="admin123"
              required
              id="input-password"
            />
          </div>

          {!isLogin && (
            <div className="animate-fade">
              <div className="form-group">
                <label className="form-label">Contact Number</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="e.g. +91 98765 43210"
                  id="input-phone"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Availability *</label>
                <select 
                  className="form-select" 
                  value={availability} 
                  onChange={(e) => setAvailability(e.target.value)}
                  id="input-availability"
                >
                  <option value="Weekends">Weekends Only</option>
                  <option value="Weekdays">Weekdays Only</option>
                  <option value="Both">Both (Weekdays & Weekends)</option>
                  <option value="Flexible">Flexible / On-call</option>
                </select>
              </div>

              {/* Skills Tags Selector */}
              <div className="form-group">
                <label className="form-label">Skills (Select relevant)</label>
                <div style={styles.tagGrid}>
                  {AVAILABLE_SKILLS.map(skill => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        type="button"
                        key={skill}
                        onClick={() => handleToggleSkill(skill)}
                        style={{
                          ...styles.tagBtn,
                          background: isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.03)',
                          borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                          color: isSelected ? '#fff' : 'var(--text-secondary)'
                        }}
                        id={`skill-tag-${skill.replace(/\s+/g, '-')}`}
                      >
                        {isSelected && <Check size={12} />}
                        <span>{skill}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interest Areas Selector */}
              <div className="form-group">
                <label className="form-label">Interest Areas</label>
                <div style={styles.tagGrid}>
                  {INTERESTS.map(interest => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                      <button
                        type="button"
                        key={interest}
                        onClick={() => handleToggleInterest(interest)}
                        style={{
                          ...styles.tagBtn,
                          background: isSelected ? 'var(--secondary)' : 'rgba(255, 255, 255, 0.03)',
                          borderColor: isSelected ? 'var(--secondary)' : 'var(--border-color)',
                          color: isSelected ? '#fff' : 'var(--text-secondary)'
                        }}
                        id={`interest-tag-${interest.replace(/\s+/g, '-')}`}
                      >
                        {isSelected && <Check size={12} />}
                        <span>{interest}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Short Bio (Tell us about yourself)</label>
                <textarea 
                  className="form-input" 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  placeholder="Share details about your volunteer goals or why you want to support NayePankh..."
                  rows="3"
                  style={{ resize: 'vertical' }}
                  id="input-bio"
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={styles.submitBtn} 
            disabled={loading}
            id="auth-submit-btn"
          >
            {loading ? (
              <div style={styles.spinner}></div>
            ) : isLogin ? (
              'Access Account'
            ) : (
              'Create Volunteer Account'
            )}
          </button>
        </form>

        <div style={styles.footerNote}>
          {isLogin ? (
            <p>
              New to VoloSphere?{' '}
              <span 
                onClick={() => { setIsLogin(false); setError(''); }} 
                style={styles.footerLink}
              >
                Create an account
              </span>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <span 
                onClick={() => { setIsLogin(true); setError(''); }} 
                style={styles.footerLink}
              >
                Sign in here
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 1.5rem',
  },
  backButtonContainer: {
    maxWidth: '550px',
    width: '100%',
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'flex-start',
  },
  backBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.85rem',
  },
  card: {
    maxWidth: '550px',
    width: '100%',
    padding: '2.5rem',
    borderRadius: '20px',
  },
  brandContainer: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  logoBadge: {
    width: '46px',
    height: '46px',
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    color: '#fff',
    fontWeight: '800',
    borderRadius: '12px',
    fontSize: '1.25rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.75rem',
  },
  brandTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
  },
  brandDesc: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    marginTop: '0.25rem',
  },
  tabContainer: {
    display: 'flex',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '2rem',
  },
  tab: {
    flex: 1,
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '0.75rem',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '550',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all var(--transition-fast)',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    color: 'var(--danger)',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  tagGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  tagBtn: {
    border: '1px solid',
    borderRadius: '8px',
    padding: '0.35rem 0.7rem',
    fontSize: '0.8rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    transition: 'all 0.15s ease-in-out',
  },
  submitBtn: {
    marginTop: '1.5rem',
    width: '100%',
    padding: '0.85rem',
    fontSize: '1rem',
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  footerNote: {
    textAlign: 'center',
    marginTop: '1.5rem',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
  footerLink: {
    color: 'var(--primary)',
    fontWeight: '550',
    cursor: 'pointer',
    textDecoration: 'underline',
  }
};
