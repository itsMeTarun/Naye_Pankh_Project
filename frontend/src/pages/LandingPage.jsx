import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  Users, 
  Clock, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Award, 
  Briefcase,
  Heart,
  TrendingUp,
  LogIn,
  Layers
} from 'lucide-react';

export default function LandingPage({ onNavigate, user, onLogout }) {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOpps = async () => {
      try {
        const data = await api.opportunities.list();
        // filter active ones
        setOpportunities(data.filter(o => o.status === 'Active'));
      } catch (err) {
        console.error(err);
        setError('Failed to load active volunteering drives.');
      } finally {
        setLoading(false);
      }
    };
    fetchOpps();
  }, []);

  return (
    <div style={styles.wrapper} className="animate-fade">
      {/* Navigation Header */}
      <header style={styles.header} className="glass-card">
        <div style={styles.headerContainer}>
          <div style={styles.logoGroup} onClick={() => onNavigate('landing')}>
            <div style={styles.logoIcon} className="flex-center">NP</div>
            <div>
              <span className="brand-title" style={styles.brandTitleText}>VoloSphere</span>
              <div style={styles.logoSubtitle}>NayePankh Foundation</div>
            </div>
          </div>
          <nav style={styles.nav}>
            <a href="#about" style={styles.navLink}>About</a>
            <a href="#drives" style={styles.navLink}>Active Drives</a>
            
            {user ? (
              <div style={styles.userActions}>
                <button 
                  onClick={() => onNavigate(user.role === 'admin' ? 'admin-dashboard' : 'volunteer-dashboard')}
                  className="btn btn-primary"
                  style={styles.navBtn}
                  id="nav-dashboard-btn"
                >
                  Dashboard
                </button>
                <button 
                  onClick={onLogout}
                  className="btn btn-secondary"
                  style={{ ...styles.navBtn, padding: '0.5rem 1rem' }}
                  id="nav-logout-btn"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => onNavigate('auth')}
                className="btn btn-primary"
                style={styles.navBtn}
                id="nav-login-btn"
              >
                <LogIn size={16} /> Login / Register
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroOverlay}></div>
        <div className="container" style={styles.heroContainer}>
          <div style={styles.heroContent}>
            <div style={styles.badge}>
              <Heart size={14} color="var(--primary)" fill="var(--primary)" /> 
              <span>Be the Change with NayePankh</span>
            </div>
            <h1 style={styles.heroTitle}>
              Spread Your Wings,<br />
              <span style={styles.highlightText}>Empower Underprivileged Lives</span>
            </h1>
            <p style={styles.heroSubtitle}>
              Join a dedicated network of volunteers helping NayePankh Foundation digitize social impact, organize distribution campaigns, and teach the leaders of tomorrow.
            </p>
            <div style={styles.ctaGroup}>
              <button 
                onClick={() => onNavigate(user ? (user.role === 'admin' ? 'admin-dashboard' : 'volunteer-dashboard') : 'auth')}
                className="btn btn-primary btn-lg"
                style={styles.ctaBtn}
                id="hero-cta-btn"
              >
                Get Started Today <ArrowRight size={18} />
              </button>
              <a href="#drives" className="btn btn-secondary btn-lg" style={styles.ctaSecondary}>
                View Active Drives
              </a>
            </div>
          </div>

          {/* Core Stats Card */}
          <div style={styles.heroVisual} className="glass-card">
            <h3 style={styles.visualTitle}>Impact at a Glance</h3>
            <div style={styles.statGrid}>
              <div style={styles.statBox}>
                <Users size={24} color="var(--primary)" />
                <div style={styles.statNum}>1,200+</div>
                <div style={styles.statLabel}>Volunteers</div>
              </div>
              <div style={styles.statBox}>
                <Clock size={24} color="var(--secondary)" />
                <div style={styles.statNum}>18,500+</div>
                <div style={styles.statLabel}>Hours Tracked</div>
              </div>
              <div style={styles.statBox}>
                <TrendingUp size={24} color="var(--success)" />
                <div style={styles.statNum}>120+</div>
                <div style={styles.statLabel}>Cities Covered</div>
              </div>
              <div style={styles.statBox}>
                <Award size={24} color="var(--accent)" />
                <div style={styles.statNum}>100%</div>
                <div style={styles.statLabel}>Verified Impact</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" style={styles.aboutSection}>
        <div className="container">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Who We Are</h2>
            <div style={styles.sectionDivider}></div>
            <p style={styles.sectionSubtitle}>
              NayePankh Foundation is one of the leading non-profit organizations in India, striving to improve the quality of life for underprivileged communities.
            </p>
          </div>

          <div style={styles.aboutGrid}>
            <div style={styles.aboutCard} className="glass-card">
              <div style={styles.aboutIconContainer} className="flex-center">
                <Layers size={22} color="var(--primary)" />
              </div>
              <h4>Digitized Management</h4>
              <p>No more manual entries. Check volunteer rosters, submit hours, and download certified appreciation reports effortlessly.</p>
            </div>
            <div style={styles.aboutCard} className="glass-card">
              <div style={styles.aboutIconContainer} className="flex-center">
                <Heart size={22} color="var(--secondary)" fill="var(--secondary)" />
              </div>
              <h4>Direct Support</h4>
              <p>Your effort supports educational projects, medical camps, and food security drives directly where the need is greatest.</p>
            </div>
            <div style={styles.aboutCard} className="glass-card">
              <div style={styles.aboutIconContainer} className="flex-center">
                <Award size={22} color="var(--accent)" />
              </div>
              <h4>Certified Recognition</h4>
              <p>Earn verified volunteer hours logs and downloadable certificates signed by NayePankh coordinators for your profile.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Opportunities Section */}
      <section id="drives" style={styles.drivesSection}>
        <div className="container">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Active Volunteering Drives</h2>
            <div style={styles.sectionDivider}></div>
            <p style={styles.sectionSubtitle}>
              Choose a cause that speaks to you. Select a drive and sign up to dedicate your skills and time.
            </p>
          </div>

          {loading ? (
            <div className="flex-center" style={{ minHeight: '200px', flexDirection: 'column', gap: '1rem' }}>
              <div style={styles.spinner}></div>
              <p style={{ color: 'var(--text-secondary)' }}>Loading volunteer campaigns...</p>
            </div>
          ) : error ? (
            <div style={styles.errorContainer} className="glass-card">
              <p>{error}</p>
            </div>
          ) : opportunities.length === 0 ? (
            <div style={styles.emptyContainer} className="glass-card">
              <p>There are no active volunteering opportunities at the moment. Please check back later!</p>
            </div>
          ) : (
            <div style={styles.drivesGrid}>
              {opportunities.map(opp => (
                <div key={opp.id} style={styles.driveCard} className="glass-card animate-fade">
                  <div style={styles.driveHeader}>
                    <span style={styles.driveCategory}>{opp.category}</span>
                    <span style={styles.driveSlots}>{opp.requiredVolunteers} spots available</span>
                  </div>
                  <h3 style={styles.driveTitle}>{opp.title}</h3>
                  <p style={styles.driveDesc}>{opp.description}</p>
                  
                  <div style={styles.driveMetaGrid}>
                    <div style={styles.driveMetaItem}>
                      <MapPin size={16} color="var(--primary)" />
                      <span>{opp.location}</span>
                    </div>
                    <div style={styles.driveMetaItem}>
                      <Calendar size={16} color="var(--secondary)" />
                      <span>{opp.date}</span>
                    </div>
                    <div style={styles.driveMetaItem}>
                      <Clock size={16} color="var(--accent)" />
                      <span>{opp.duration}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (!user) {
                        onNavigate('auth');
                      } else if (user.role === 'admin') {
                        onNavigate('admin-dashboard');
                      } else {
                        onNavigate('volunteer-dashboard');
                      }
                    }}
                    className="btn btn-primary"
                    style={styles.driveBtn}
                    id={`apply-btn-${opp.id}`}
                  >
                    {user ? 'View in Dashboard' : 'Apply to Volunteer'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div className="container" style={styles.footerContainer}>
          <div>
            <div style={styles.footerLogo}>VoloSphere</div>
            <p style={styles.footerText}>NayePankh Foundation Official Portal. Spread wings to community dreams.</p>
          </div>
          <div style={styles.footerCopyright}>
            &copy; {new Date().getFullYear()} NayePankh Foundation. All Rights Reserved. Registered NGO.
          </div>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    position: 'sticky',
    top: '1rem',
    margin: '1rem 2rem 0 2rem',
    borderRadius: '16px',
    zIndex: 100,
    padding: '0.8rem 2rem',
  },
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    color: '#fff',
    fontWeight: '700',
    borderRadius: '10px',
    fontSize: '1.1rem',
  },
  brandTitleText: {
    fontSize: '1.25rem',
    letterSpacing: '-0.03em',
  },
  logoSubtitle: {
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginTop: '-2px',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  navLink: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'color 0.2s',
    cursor: 'pointer',
  },
  userActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  navBtn: {
    padding: '0.5rem 1.25rem',
    fontSize: '0.85rem',
  },
  heroSection: {
    position: 'relative',
    padding: '8rem 0 6rem 0',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroContainer: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '4rem',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
  },
  heroContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    padding: '0.4rem 0.9rem',
    borderRadius: '9999px',
    fontSize: '0.8rem',
    color: 'var(--text-primary)',
    fontWeight: '550',
    marginBottom: '1.5rem',
  },
  heroTitle: {
    fontSize: '3.2rem',
    lineHeight: '1.15',
    fontWeight: '800',
    marginBottom: '1.5rem',
  },
  highlightText: {
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    color: 'var(--text-secondary)',
    marginBottom: '2.5rem',
    maxWidth: '560px',
  },
  ctaGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    width: '100%',
  },
  ctaBtn: {
    padding: '0.9rem 2rem',
  },
  ctaSecondary: {
    padding: '0.9rem 2rem',
  },
  heroVisual: {
    padding: '2.5rem',
    borderRadius: '24px',
    textAlign: 'center',
  },
  visualTitle: {
    fontSize: '1.25rem',
    marginBottom: '1.75rem',
    color: 'var(--text-primary)',
    fontWeight: '600',
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  statBox: {
    background: 'rgba(10, 14, 26, 0.4)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.4rem',
  },
  statNum: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-heading)',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  aboutSection: {
    padding: '6rem 0',
    borderTop: '1px solid var(--border-color)',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '4rem',
    maxWidth: '650px',
    margin: '0 auto 4rem auto',
  },
  sectionTitle: {
    fontSize: '2.25rem',
    marginBottom: '0.75rem',
    fontWeight: '700',
  },
  sectionDivider: {
    width: '60px',
    height: '4px',
    background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
    margin: '0 auto 1.5rem auto',
    borderRadius: '2px',
  },
  sectionSubtitle: {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
  },
  aboutGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '2rem',
  },
  aboutCard: {
    padding: '2.5rem 2rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  aboutIconContainer: {
    width: '56px',
    height: '56px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '14px',
    border: '1px solid var(--border-color)',
    marginBottom: '0.5rem',
  },
  drivesSection: {
    padding: '6rem 0 8rem 0',
    borderTop: '1px solid var(--border-color)',
  },
  drivesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: '2rem',
  },
  driveCard: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
  },
  driveHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  driveCategory: {
    background: 'rgba(99, 102, 241, 0.12)',
    color: 'var(--primary)',
    padding: '0.25rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  driveSlots: {
    fontSize: '0.8rem',
    color: 'var(--accent)',
    fontWeight: '550',
  },
  driveTitle: {
    fontSize: '1.35rem',
    marginBottom: '1rem',
    lineHeight: '1.3',
  },
  driveDesc: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    marginBottom: '1.5rem',
    flexGrow: 1,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  driveMetaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '0.6rem',
    padding: '1rem 0',
    borderTop: '1px solid var(--border-color)',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '1.5rem',
  },
  driveMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  driveBtn: {
    width: '100%',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(255, 255, 255, 0.05)',
    borderTopColor: 'var(--primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorContainer: {
    padding: '2rem',
    textAlign: 'center',
    color: 'var(--danger)',
  },
  emptyContainer: {
    padding: '3rem',
    textAlign: 'center',
    color: 'var(--text-secondary)',
  },
  footer: {
    background: '#04070f',
    padding: '3rem 0',
    marginTop: 'auto',
    borderTop: '1px solid var(--border-color)',
  },
  footerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '2rem',
  },
  footerLogo: {
    fontSize: '1.5rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #fff, var(--primary))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '0.5rem',
  },
  footerText: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    maxWidth: '400px',
  },
  footerCopyright: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  }
};
