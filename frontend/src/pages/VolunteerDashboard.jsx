import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  User, 
  Award, 
  Clock, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  Info, 
  LogOut, 
  Edit,
  Save,
  Check,
  ClipboardList,
  Sun,
  Moon
} from 'lucide-react';

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

export default function VolunteerDashboard({ onNavigate, user, onLogout, accent, mode, onSelectAccent, onToggleMode }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [volunteer, setVolunteer] = useState(null);
  const [applications, setApplications] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Editing profile fields
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [availability, setAvailability] = useState('Weekends');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);

  // Fetch initial profile and apps
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const volData = await api.volunteer.getProfile();
      setVolunteer(volData);
      
      // Initialize edit fields
      setPhone(volData.phone || '');
      setBio(volData.bio || '');
      setAvailability(volData.availability || 'Weekends');
      setSelectedSkills(volData.skills || []);
      setSelectedInterests(volData.interests || []);

      const appsData = await api.volunteer.getApplications();
      setApplications(appsData);

      const drivesData = await api.opportunities.list();
      setDrives(drivesData.filter(d => d.status === 'Active'));
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Profile save handler
  const handleSaveProfile = async () => {
    setError('');
    setSuccessMsg('');
    try {
      const updated = await api.volunteer.updateProfile({
        phone,
        bio,
        availability,
        skills: selectedSkills,
        interests: selectedInterests
      });
      setVolunteer(updated);
      setIsEditing(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    }
  };

  // Toggle skills
  const handleToggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  // Toggle interests
  const handleToggleInterest = (interest) => {
    setSelectedInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  // Apply to drive handler
  const handleApply = async (oppId) => {
    setError('');
    setSuccessMsg('');
    try {
      await api.volunteer.apply(oppId);
      setSuccessMsg('Successfully applied for the volunteer drive!');
      setTimeout(() => setSuccessMsg(''), 4000);
      
      // Refresh applications lists
      const appsData = await api.volunteer.getApplications();
      setApplications(appsData);
    } catch (err) {
      setError(err.message || 'Failed to submit application.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={styles.spinner}></div>
        <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Asking the database nicely for your dashboard...</p>
      </div>
    );
  }

  const pendingApps = applications.filter(a => a.status === 'Pending').length;
  const activeJobs = applications.filter(a => a.status === 'Approved').length;
  const hoursVolunteered = volunteer ? volunteer.hoursVolunteered : 0;

  return (
    <div style={styles.dashboardWrapper} className="animate-fade">
      {/* Dashboard Top bar */}
      <header style={styles.topbar} className="glass-card">
        <div style={styles.topbarContainer}>
          <div style={styles.logoGroup} onClick={() => onNavigate('landing')}>
            <div style={styles.logoIcon} className="flex-center">NP</div>
            <div>
              <span className="brand-title" style={{ fontSize: '1.15rem' }}>VoloSphere</span>
              <div style={styles.logoSubtitle}>Volunteer Hub</div>
            </div>
          </div>

          <div style={styles.userInfo}>
            {/* Light/Dark Mode toggle */}
            <button
              onClick={onToggleMode}
              className="btn btn-secondary"
              style={{ 
                padding: '0.4rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                borderRadius: '50%', 
                width: '36px', 
                height: '36px',
                cursor: 'pointer',
                boxShadow: 'none',
                marginRight: '0.4rem'
              }}
              title="Toggle Light/Dark Mode"
              id="volunteer-mode-btn"
            >
              {mode === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            {/* Color Accent dots */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginRight: '0.5rem' }}>
              {['indigo', 'emerald', 'sunset'].map(a => {
                const dotColors = {
                  indigo: '#6366f1',
                  emerald: '#10b981',
                  sunset: '#f97316'
                };
                const active = accent === a;
                return (
                  <button
                    key={a}
                    onClick={() => onSelectAccent(a)}
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: active ? '2px solid var(--text-primary)' : '2px solid transparent',
                      background: dotColors[a],
                      cursor: 'pointer',
                      padding: 0,
                      boxShadow: active ? `0 0 8px ${dotColors[a]}` : 'none',
                      transition: 'all 0.2s',
                      transform: active ? 'scale(1.15)' : 'scale(1)'
                    }}
                    title={`${a.charAt(0).toUpperCase() + a.slice(1)} Accent`}
                  />
                );
              })}
            </div>

            <div style={styles.userAvatar}>
              <User size={18} color="#fff" />
            </div>
            <div>
              <div style={styles.userName}>{user.name}</div>
              <div style={styles.userRole}>Volunteer</div>
            </div>
            <button 
              onClick={onLogout} 
              style={styles.logoutBtn}
              className="btn btn-secondary"
              id="dash-logout-btn"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="container" style={styles.mainGrid}>
        
        {/* Sidebar Nav */}
        <aside style={styles.sidebar} className="glass-card">
          <div style={styles.sidebarHeader}>
            <h3>Portal Menu</h3>
          </div>
          <div style={styles.navMenu}>
            <button 
              onClick={() => setActiveTab('profile')}
              style={{...styles.navItem, ...(activeTab === 'profile' ? styles.activeNavItem : {})}}
              id="btn-tab-profile"
            >
              <User size={18} /> Profile & Settings
            </button>
            <button 
              onClick={() => setActiveTab('opportunities')}
              style={{...styles.navItem, ...(activeTab === 'opportunities' ? styles.activeNavItem : {})}}
              id="btn-tab-opportunities"
            >
              <ClipboardList size={18} /> Open Drives
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              style={{...styles.navItem, ...(activeTab === 'history' ? styles.activeNavItem : {})}}
              id="btn-tab-history"
            >
              <Clock size={18} /> Applications ({applications.length})
            </button>
            <button 
              onClick={() => setActiveTab('certificate')}
              style={{...styles.navItem, ...(activeTab === 'certificate' ? styles.activeNavItem : {})}}
              id="btn-tab-certificate"
            >
              <Award size={18} /> Certificate
            </button>
          </div>
        </aside>

        {/* Dynamic Panel */}
        <main style={styles.contentPanel}>
          {/* Banner messages */}
          {error && (
            <div style={styles.errorAlert} className="animate-fade">
              <Info size={18} />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div style={styles.successAlert} className="animate-fade">
              <CheckCircle size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Verification Warning for volunteer */}
          {volunteer && volunteer.status === 'Pending' && (
            <div style={styles.warningAlert} className="glass-card animate-fade">
              <Info size={20} color="var(--accent)" />
              <div>
                <h5 style={{ color: 'var(--accent)', fontWeight: '600' }}>Registration Pending Approval</h5>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Your profile is being reviewed by the NayePankh administrator team. Once approved, you will be able to register and participate in active social drives!
                </p>
              </div>
            </div>
          )}

          {volunteer && volunteer.status === 'Rejected' && (
            <div style={{ ...styles.warningAlert, borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.08)' }} className="glass-card animate-fade">
              <Info size={20} color="var(--danger)" />
              <div>
                <h5 style={{ color: 'var(--danger)', fontWeight: '600' }}>Registration Status: Rejected</h5>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Your volunteer profile registration has not been approved at this time. Contact the administration at support@nayepankh.org for details.
                </p>
              </div>
            </div>
          )}

          {/* TAB CONTENT: PROFILE */}
          {activeTab === 'profile' && volunteer && (
            <section className="glass-card animate-fade" style={styles.cardPadding}>
              <div style={styles.panelTitleBar}>
                <div>
                  <h2 style={styles.panelHeading}>My Profile</h2>
                  <p style={styles.panelSubheading}>Keep your details up to date so we can match you to drives</p>
                </div>
                <div style={styles.statusSection}>
                  <span style={styles.statusLabelText}>Status:</span>
                  <span className={`pill ${volunteer.status === 'Approved' ? 'pill-approved' : volunteer.status === 'Pending' ? 'pill-pending' : 'pill-rejected'}`}>
                    {volunteer.status}
                  </span>
                </div>
              </div>

              <div style={styles.profileSummaryRow}>
                <div style={styles.summaryKPI} className="glass-card">
                  <Clock size={28} color="var(--primary)" />
                  <div>
                    <div style={styles.kpiValue}>{hoursVolunteered} hrs</div>
                    <div style={styles.kpiLabel}>Total Volunteered</div>
                  </div>
                </div>
                <div style={styles.summaryKPI} className="glass-card">
                  <CheckCircle size={28} color="var(--success)" />
                  <div>
                    <div style={styles.kpiValue}>
                      {applications.filter(a => a.status === 'Completed').length}
                    </div>
                    <div style={styles.kpiLabel}>Drives Completed</div>
                  </div>
                </div>
              </div>

              <hr style={{ borderColor: 'var(--border-color)', margin: '2rem 0' }} />

              <div style={styles.fieldsGrid}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" value={volunteer.name} disabled style={styles.disabledInput} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="text" className="form-input" value={user.email} disabled style={styles.disabledInput} />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    disabled={!isEditing}
                    id="profile-phone-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Weekly Availability</label>
                  <select 
                    className="form-select" 
                    value={availability} 
                    onChange={(e) => setAvailability(e.target.value)} 
                    disabled={!isEditing}
                    id="profile-availability-select"
                  >
                    <option value="Weekends">Weekends Only</option>
                    <option value="Weekdays">Weekdays Only</option>
                    <option value="Both">Both (Weekdays & Weekends)</option>
                    <option value="Flexible">Flexible / On-call</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">About / Bio</label>
                <textarea 
                  className="form-input" 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  disabled={!isEditing} 
                  rows="3"
                  id="profile-bio-textarea"
                />
              </div>

              {/* Tag Selection for edit mode */}
              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label className="form-label">Skills</label>
                {isEditing ? (
                  <div style={styles.tagSelectorWrapper}>
                    {AVAILABLE_SKILLS.map(skill => {
                      const isSelected = selectedSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => handleToggleSkill(skill)}
                          style={{
                            ...styles.editTag,
                            background: isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.02)',
                            borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                            color: isSelected ? '#fff' : 'var(--text-secondary)'
                          }}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div style={styles.tagsDisplay}>
                    {volunteer.skills && volunteer.skills.length > 0 ? (
                      volunteer.skills.map(s => <span key={s} style={styles.badgePill}>{s}</span>)
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No skills listed yet</span>
                    )}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label className="form-label">Interest Areas</label>
                {isEditing ? (
                  <div style={styles.tagSelectorWrapper}>
                    {INTERESTS.map(interest => {
                      const isSelected = selectedInterests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => handleToggleInterest(interest)}
                          style={{
                            ...styles.editTag,
                            background: isSelected ? 'var(--secondary)' : 'rgba(255, 255, 255, 0.02)',
                            borderColor: isSelected ? 'var(--secondary)' : 'var(--border-color)',
                            color: isSelected ? '#fff' : 'var(--text-secondary)'
                          }}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div style={styles.tagsDisplay}>
                    {volunteer.interests && volunteer.interests.length > 0 ? (
                      volunteer.interests.map(i => <span key={i} style={{ ...styles.badgePill, background: 'rgba(168, 85, 247, 0.15)', color: 'var(--secondary)' }}>{i}</span>)
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No interest areas listed yet</span>
                    )}
                  </div>
                )}
              </div>

              <div style={styles.formActions}>
                {isEditing ? (
                  <>
                    <button 
                      onClick={handleSaveProfile} 
                      className="btn btn-primary"
                      id="profile-save-btn"
                    >
                      <Save size={16} /> Save Changes
                    </button>
                    <button 
                      onClick={() => {
                        setIsEditing(false);
                        // Reset fields
                        setPhone(volunteer.phone || '');
                        setBio(volunteer.bio || '');
                        setAvailability(volunteer.availability || 'Weekends');
                        setSelectedSkills(volunteer.skills || []);
                        setSelectedInterests(volunteer.interests || []);
                      }}
                      className="btn btn-secondary"
                      id="profile-cancel-btn"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="btn btn-secondary"
                    id="profile-edit-btn"
                  >
                    <Edit size={16} /> Edit Profile Details
                  </button>
                )}
              </div>
            </section>
          )}

          {/* TAB CONTENT: OPEN OPPORTUNITIES */}
          {activeTab === 'opportunities' && (
            <section className="animate-fade">
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={styles.panelHeading}>Available Campaigns</h2>
                <p style={styles.panelSubheading}>Apply for active social drives matching your interests</p>
              </div>

              {drives.length === 0 ? (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No active volunteering campaigns available currently. Check back later!
                </div>
              ) : (
                <div style={styles.opportunitiesList}>
                  {drives.map(drive => {
                    // Check if already applied
                    const app = applications.find(a => a.opportunityId === drive.id);
                    const isApproved = volunteer && volunteer.status === 'Approved';

                    return (
                      <div key={drive.id} className="glass-card" style={styles.oppCard}>
                        <div style={styles.oppCardDetails}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <span style={styles.oppCategoryBadge}>{drive.category}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Duration: {drive.duration}</span>
                          </div>
                          <h3 style={styles.oppTitle}>{drive.title}</h3>
                          <p style={styles.oppDesc}>{drive.description}</p>
                          
                          <div style={styles.oppMetaGroup}>
                            <span style={styles.oppMetaItem}>
                              <MapPin size={14} color="var(--primary)" /> {drive.location}
                            </span>
                            <span style={styles.oppMetaItem}>
                              <Calendar size={14} color="var(--secondary)" /> {drive.date}
                            </span>
                          </div>
                        </div>

                        <div style={styles.oppCardAction}>
                          {app ? (
                            <div style={styles.appliedBadge}>
                              <Check size={16} color="var(--success)" />
                              <span>Applied ({app.status})</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleApply(drive.id)}
                              disabled={!isApproved}
                              className="btn btn-primary"
                              style={{ width: '100%' }}
                              id={`dashboard-apply-${drive.id}`}
                            >
                              Apply Now
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* TAB CONTENT: APPLICATION HISTORY */}
          {activeTab === 'history' && (
            <section className="glass-card animate-fade" style={styles.cardPadding}>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={styles.panelHeading}>My Applications</h2>
                <p style={styles.panelSubheading}>Track your campaign registration approvals and hours logged</p>
              </div>

              {applications.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  You have not applied for any drives yet. Go to "Open Drives" to apply!
                </div>
              ) : (
                <div className="custom-table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Volunteer Drive</th>
                        <th>Location & Date</th>
                        <th>Status</th>
                        <th>Hours Logged</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map(app => (
                        <tr key={app.id}>
                          <td>
                            <div style={{ fontWeight: '600' }}>{app.opportunity ? app.opportunity.title : 'Deleted Opportunity'}</div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Applied on {new Date(app.appliedAt).toLocaleDateString()}</span>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.85rem' }}>{app.opportunity ? app.opportunity.location : 'N/A'}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{app.opportunity ? app.opportunity.date : 'N/A'}</div>
                          </td>
                          <td>
                            <span className={`pill ${
                              app.status === 'Completed' ? 'pill-completed' :
                              app.status === 'Approved' ? 'pill-approved' :
                              app.status === 'Pending' ? 'pill-pending' : 'pill-rejected'
                            }`}>
                              {app.status}
                            </span>
                          </td>
                          <td style={{ fontWeight: '600', fontFamily: 'var(--font-heading)' }}>
                            {app.hoursLogged > 0 ? `${app.hoursLogged} hrs` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* TAB CONTENT: CERTIFICATE */}
          {activeTab === 'certificate' && (
            <section className="animate-fade">
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={styles.panelHeading}>Participation Certificate</h2>
                <p style={styles.panelSubheading}>Earn hours to download your verified social work completion award</p>
              </div>

              {hoursVolunteered === 0 ? (
                <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                  <Award size={64} color="var(--text-muted)" style={{ opacity: 0.4 }} />
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Certificate Locked</h3>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto', fontSize: '0.9rem' }}>
                      To generate your certificate, you must have at least 1 completed volunteer drive with logged hours. Build hours by attending approved drives!
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                  
                  {/* Outer Print Wrapper */}
                  <div id="print-certificate-container" style={styles.certificateOuter} className="glass-card">
                    <div style={styles.certificateInner}>
                      
                      {/* Logo and Foundation details */}
                      <div style={styles.certHeader}>
                        <div style={styles.certBadge}>NP</div>
                        <h1 style={styles.certOrg}>NayePankh Foundation</h1>
                        <span style={styles.certSub}>Regd. Non-Governmental Organization (NGO) India</span>
                      </div>

                      <div style={styles.certDecorationLine}></div>

                      {/* Content */}
                      <div style={styles.certBody}>
                        <h2 style={styles.certTitle}>Certificate of Appreciation</h2>
                        <p style={styles.certSubText}>THIS CERTIFICATE IS PROUDLY PRESENTED TO</p>
                        <h3 style={styles.certName}>{volunteer.name}</h3>
                        <p style={styles.certMessage}>
                          in grateful recognition of outstanding dedication and valuable contribution as a volunteer. 
                          The candidate has successfully logged <strong style={{color: 'var(--primary)'}}>{hoursVolunteered} hours</strong> of community service towards 
                          various digital management, environment welfare, and education support programs organized by NayePankh Foundation.
                        </p>
                      </div>

                      {/* Signatures */}
                      <div style={styles.certFooter}>
                        <div style={styles.signatureBlock}>
                          <div style={styles.sigLine}>Aditi Sharma</div>
                          <span style={styles.sigTitle}>Founder & President</span>
                        </div>
                        <div style={styles.certDateBlock}>
                          <div style={styles.dateVal}>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                          <span style={styles.sigTitle}>Date of Issuance</span>
                        </div>
                        <div style={styles.signatureBlock}>
                          <div style={styles.sigLine}>VoloSphere Portal</div>
                          <span style={styles.sigTitle}>Verification System</span>
                        </div>
                      </div>

                    </div>
                  </div>

                  <button 
                    onClick={handlePrint} 
                    className="btn btn-primary"
                    style={{ padding: '0.85rem 2rem' }}
                    id="print-certificate-btn"
                  >
                    <Award size={18} /> Print / Download Certificate (PDF)
                  </button>
                </div>
              )}
            </section>
          )}

        </main>
      </div>
    </div>
  );
}

const styles = {
  dashboardWrapper: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: '4rem',
  },
  topbar: {
    margin: '1.5rem 2rem 0 2rem',
    borderRadius: '16px',
    padding: '0.75rem 2rem',
  },
  topbarContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
  },
  logoIcon: {
    width: '38px',
    height: '38px',
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    color: '#fff',
    fontWeight: '700',
    borderRadius: '8px',
    fontSize: '1rem',
  },
  logoSubtitle: {
    fontSize: '0.65rem',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginTop: '-2px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  userRole: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  logoutBtn: {
    padding: '0.4rem 0.85rem',
    fontSize: '0.8rem',
    marginLeft: '1rem',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: '2rem',
    marginTop: '2rem',
    alignItems: 'start',
  },
  sidebar: {
    padding: '1.5rem',
    borderRadius: '16px',
  },
  sidebarHeader: {
    marginBottom: '1.5rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.75rem',
  },
  navMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    width: '100%',
    padding: '0.8rem 1rem',
    borderRadius: '8px',
    background: 'none',
    border: 'none',
    textAlign: 'left',
    fontSize: '0.9rem',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    transition: 'all var(--transition-fast)',
  },
  activeNavItem: {
    background: 'rgba(99, 102, 241, 0.12)',
    color: 'var(--primary)',
    fontWeight: '600',
    borderLeft: '3px solid var(--primary)',
    paddingLeft: 'calc(1rem - 3px)',
  },
  contentPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    color: 'var(--danger)',
    padding: '1rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
  },
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    color: 'var(--success)',
    padding: '1rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
  },
  warningAlert: {
    display: 'flex',
    gap: '1rem',
    padding: '1.25rem',
    borderRadius: '12px',
    borderLeft: '4px solid var(--accent)',
  },
  cardPadding: {
    padding: '2.5rem',
  },
  panelTitleBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  panelHeading: {
    fontSize: '1.75rem',
    fontWeight: '700',
  },
  panelSubheading: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    marginTop: '0.2rem',
  },
  statusSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  statusLabelText: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  profileSummaryRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  summaryKPI: {
    padding: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    borderRadius: '12px',
  },
  kpiValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    fontFamily: 'var(--font-heading)',
  },
  kpiLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  fieldsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.25rem',
  },
  disabledInput: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  tagSelectorWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  editTag: {
    border: '1px solid',
    borderRadius: '8px',
    padding: '0.35rem 0.75rem',
    fontSize: '0.8rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  tagsDisplay: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  badgePill: {
    background: 'rgba(99, 102, 241, 0.15)',
    color: 'var(--primary)',
    padding: '0.3rem 0.85rem',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: '550',
    border: '1px solid rgba(255, 255, 255, 0.04)',
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem',
  },
  opportunitiesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  oppCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.75rem',
    gap: '2rem',
  },
  oppCardDetails: {
    flexGrow: 1,
  },
  oppCategoryBadge: {
    background: 'rgba(99, 102, 241, 0.1)',
    color: 'var(--primary)',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  oppTitle: {
    fontSize: '1.25rem',
    margin: '0.25rem 0 0.5rem 0',
  },
  oppDesc: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    marginBottom: '1rem',
  },
  oppMetaGroup: {
    display: 'flex',
    gap: '1.5rem',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
  },
  oppMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  oppCardAction: {
    minWidth: '150px',
  },
  appliedBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    color: 'var(--success)',
    fontWeight: '600',
    fontSize: '0.9rem',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    padding: '0.6rem',
    borderRadius: '8px',
    background: 'rgba(16, 185, 129, 0.05)',
  },
  certificateOuter: {
    width: '100%',
    maxWidth: '800px',
    padding: '3rem',
    borderRadius: '16px',
    background: 'rgba(15, 23, 42, 0.9)',
    border: '4px double rgba(255, 255, 255, 0.15)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
  },
  certificateInner: {
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '2.5rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
  },
  certHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  certBadge: {
    width: '56px',
    height: '56px',
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    color: '#fff',
    fontWeight: '800',
    borderRadius: '12px',
    fontSize: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
    boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
  },
  certOrg: {
    fontSize: '2rem',
    fontWeight: '700',
    letterSpacing: '-0.02em',
    color: '#fff',
  },
  certSub: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginTop: '0.25rem',
  },
  certDecorationLine: {
    width: '80%',
    height: '2px',
    background: 'linear-gradient(90deg, transparent, var(--primary), var(--secondary), transparent)',
    margin: '1.5rem 0',
  },
  certBody: {
    margin: '1rem 0 2.5rem 0',
  },
  certTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '2.25rem',
    fontWeight: '800',
    color: 'var(--accent)',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
    marginBottom: '1.5rem',
  },
  certSubText: {
    fontSize: '0.8rem',
    letterSpacing: '0.15em',
    color: 'var(--text-muted)',
    marginBottom: '0.5rem',
  },
  certName: {
    fontFamily: 'var(--font-heading)',
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '1.5rem',
    textDecoration: 'underline',
    textDecorationColor: 'rgba(255,255,255,0.1)',
  },
  certMessage: {
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
    maxWidth: '580px',
    margin: '0 auto',
    lineHeight: '1.7',
  },
  certFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: '2rem',
    alignItems: 'flex-end',
  },
  signatureBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '180px',
  },
  certDateBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  sigLine: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    paddingBottom: '0.5rem',
    width: '100%',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#fff',
    fontStyle: 'italic',
  },
  dateVal: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#fff',
    paddingBottom: '0.5rem',
  },
  sigTitle: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    marginTop: '0.5rem',
    letterSpacing: '0.05em',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid rgba(255, 255, 255, 0.05)',
    borderTopColor: 'var(--primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  }
};
