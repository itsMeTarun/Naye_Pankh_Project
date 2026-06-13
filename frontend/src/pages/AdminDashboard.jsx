import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  Users, 
  Clock, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Award,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Download,
  Info,
  Layers,
  Search,
  Check,
  Sun,
  Moon
} from 'lucide-react';

const CATEGORIES = [
  'Education',
  'Food Relief',
  'Environment',
  'Healthcare',
  'Disaster Relief',
  'Women Empowerment'
];

export default function AdminDashboard({ onNavigate, user, onLogout, accent, mode, onSelectAccent, onToggleMode }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search/Filters
  const [volSearch, setVolSearch] = useState('');
  const [volFilter, setVolFilter] = useState('All');

  // Form states for creating/editing drive
  const [isEditingOpp, setIsEditingOpp] = useState(false);
  const [editingOppId, setEditingOppId] = useState(null);
  const [oppTitle, setOppTitle] = useState('');
  const [oppDesc, setOppDesc] = useState('');
  const [oppDate, setOppDate] = useState('');
  const [oppLocation, setOppLocation] = useState('');
  const [oppDuration, setOppDuration] = useState('3 hours');
  const [oppRequired, setOppRequired] = useState(15);
  const [oppCategory, setOppCategory] = useState('Education');
  const [oppStatus, setOppStatus] = useState('Active');

  // Hours logging overlay
  const [loggingHoursAppId, setLoggingHoursAppId] = useState(null);
  const [loggedHoursVal, setLoggedHoursVal] = useState(0);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const statsData = await api.admin.getStats();
      setStats(statsData);

      const volsData = await api.admin.listVolunteers();
      setVolunteers(volsData);

      const appsData = await api.admin.listApplications();
      setApplications(appsData);

      const oppsData = await api.opportunities.list();
      setOpportunities(oppsData);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch administration logs.');
    } finally {
      setLoading(false);
    }
  };

  // Status approvals (volunteers)
  const handleVolunteerStatus = async (id, status) => {
    setError('');
    setSuccessMsg('');
    try {
      await api.admin.updateVolunteerStatus(id, status);
      setSuccessMsg(`Volunteer status updated to ${status}`);
      setTimeout(() => setSuccessMsg(''), 4000);
      
      // Refresh
      const volsData = await api.admin.listVolunteers();
      setVolunteers(volsData);
      
      const statsData = await api.admin.getStats();
      setStats(statsData);
    } catch (err) {
      setError(err.message || 'Failed to update volunteer status.');
    }
  };

  // Opportunity CRUD
  const handleSaveOpportunity = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      const oppPayload = {
        title: oppTitle,
        description: oppDesc,
        date: oppDate,
        location: oppLocation,
        duration: oppDuration,
        requiredVolunteers: oppRequired,
        category: oppCategory,
        status: oppStatus
      };

      if (isEditingOpp) {
        await api.admin.updateOpportunity(editingOppId, oppPayload);
        setSuccessMsg('Volunteer drive updated successfully!');
      } else {
        await api.admin.createOpportunity(oppPayload);
        setSuccessMsg('New volunteer drive launched successfully!');
      }

      resetOppForm();
      setTimeout(() => setSuccessMsg(''), 4000);

      // Refresh
      const oppsData = await api.opportunities.list();
      setOpportunities(oppsData);
      
      const statsData = await api.admin.getStats();
      setStats(statsData);
    } catch (err) {
      setError(err.message || 'Failed to save volunteer drive.');
    }
  };

  const handleEditOppClick = (opp) => {
    setIsEditingOpp(true);
    setEditingOppId(opp.id);
    setOppTitle(opp.title);
    setOppDesc(opp.description || '');
    setOppDate(opp.date);
    setOppLocation(opp.location);
    setOppDuration(opp.duration || '3 hours');
    setOppRequired(opp.requiredVolunteers || 15);
    setOppCategory(opp.category);
    setOppStatus(opp.status || 'Active');
    
    // Switch to drives form view
    setActiveTab('drives');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteOpp = async (id) => {
    if (!window.confirm('Are you sure you want to delete this drive? All applications linked will be removed.')) return;
    setError('');
    setSuccessMsg('');
    try {
      await api.admin.deleteOpportunity(id);
      setSuccessMsg('Drive deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);

      // Refresh
      const oppsData = await api.opportunities.list();
      setOpportunities(oppsData);
      
      const appsData = await api.admin.listApplications();
      setApplications(appsData);

      const statsData = await api.admin.getStats();
      setStats(statsData);
    } catch (err) {
      setError(err.message || 'Failed to delete drive.');
    }
  };

  const resetOppForm = () => {
    setIsEditingOpp(false);
    setEditingOppId(null);
    setOppTitle('');
    setOppDesc('');
    setOppDate('');
    setOppLocation('');
    setOppDuration('3 hours');
    setOppRequired(15);
    setOppCategory('Education');
    setOppStatus('Active');
  };

  // Application reviewer actions
  const handleAppStatus = async (id, status) => {
    setError('');
    setSuccessMsg('');
    try {
      await api.admin.updateApplication(id, status);
      setSuccessMsg(`Application status updated to ${status}`);
      setTimeout(() => setSuccessMsg(''), 4000);

      // Refresh
      const appsData = await api.admin.listApplications();
      setApplications(appsData);

      const volsData = await api.admin.listVolunteers();
      setVolunteers(volsData);

      const statsData = await api.admin.getStats();
      setStats(statsData);
    } catch (err) {
      setError(err.message || 'Failed to review application.');
    }
  };

  // Complete application and log hours
  const handleLogHoursSubmit = async () => {
    setError('');
    setSuccessMsg('');
    try {
      await api.admin.updateApplication(loggingHoursAppId, 'Completed', loggedHoursVal);
      setSuccessMsg('Hours logged and application marked Completed!');
      setLoggingHoursAppId(null);
      setLoggedHoursVal(0);
      setTimeout(() => setSuccessMsg(''), 4000);

      // Refresh
      const appsData = await api.admin.listApplications();
      setApplications(appsData);

      const volsData = await api.admin.listVolunteers();
      setVolunteers(volsData);

      const statsData = await api.admin.getStats();
      setStats(statsData);
    } catch (err) {
      setError(err.message || 'Failed to log hours.');
    }
  };

  // CSV Exporter
  const handleExportCSV = () => {
    try {
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += 'Volunteer Name,Email,Phone,Skills,Availability,Status,Hours Logged\r\n';

      volunteers.forEach(v => {
        const skillsStr = (v.skills || []).join(' | ');
        const row = `"${v.name}","${v.email}","${v.phone || ''}","${skillsStr}","${v.availability || ''}","${v.status || ''}",${v.hoursVolunteered || 0}`;
        csvContent += row + '\r\n';
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `volunteers_report_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccessMsg('CSV Report exported successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError('Failed to export CSV report.');
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={styles.spinner}></div>
        <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Fetching top-secret admin files... please look busy</p>
      </div>
    );
  }

  // Filtered volunteers
  const filteredVols = volunteers.filter(vol => {
    const matchesSearch = vol.name.toLowerCase().includes(volSearch.toLowerCase()) || 
                          vol.email.toLowerCase().includes(volSearch.toLowerCase());
    const matchesFilter = volFilter === 'All' || vol.status === volFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={styles.dashboardWrapper} className="animate-fade">
      
      {/* Top Navigation */}
      <header style={styles.topbar} className="glass-card">
        <div style={styles.topbarContainer}>
          <div style={styles.logoGroup} onClick={() => onNavigate('landing')}>
            <div style={styles.logoIcon} className="flex-center">NP</div>
            <div>
              <span className="brand-title" style={{ fontSize: '1.15rem' }}>VoloSphere</span>
              <div style={styles.logoSubtitle}>Admin Console</div>
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
              id="admin-mode-btn"
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

            <div style={{ ...styles.userAvatar, background: 'var(--secondary)' }}>
              <Users size={18} color="#fff" />
            </div>
            <div>
              <div style={styles.userName}>{user.name}</div>
              <div style={styles.userRole}>Super Administrator</div>
            </div>
            <button 
              onClick={onLogout} 
              style={styles.logoutBtn}
              className="btn btn-secondary"
              id="admin-logout-btn"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Grid Layout */}
      <div className="container" style={styles.mainGrid}>
        
        {/* Sidebar Navigation */}
        <aside style={styles.sidebar} className="glass-card">
          <div style={styles.sidebarHeader}>
            <h3>Console Menu</h3>
          </div>
          <div style={styles.navMenu}>
            <button 
              onClick={() => setActiveTab('overview')}
              style={{...styles.navItem, ...(activeTab === 'overview' ? styles.activeNavItem : {})}}
              id="admin-tab-overview"
            >
              <Layers size={18} /> Overview & Stats
            </button>
            <button 
              onClick={() => setActiveTab('volunteers')}
              style={{...styles.navItem, ...(activeTab === 'volunteers' ? styles.activeNavItem : {})}}
              id="admin-tab-volunteers"
            >
              <Users size={18} /> Volunteers ({volunteers.length})
            </button>
            <button 
              onClick={() => setActiveTab('drives')}
              style={{...styles.navItem, ...(activeTab === 'drives' ? styles.activeNavItem : {})}}
              id="admin-tab-drives"
            >
              <Calendar size={18} /> Launch & Manage Drives
            </button>
            <button 
              onClick={() => setActiveTab('applications')}
              style={{...styles.navItem, ...(activeTab === 'applications' ? styles.activeNavItem : {})}}
              id="admin-tab-applications"
            >
              <CheckCircle size={18} /> Applications Review ({applications.filter(a => a.status === 'Pending').length} pending)
            </button>
            <button 
              onClick={() => setActiveTab('reports')}
              style={{...styles.navItem, ...(activeTab === 'reports' ? styles.activeNavItem : {})}}
              id="admin-tab-reports"
            >
              <Download size={18} /> Exports & Reports
            </button>
          </div>
        </aside>

        {/* Console view Panel */}
        <main style={styles.contentPanel}>
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

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && stats && (
            <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* KPI Cards Row */}
              <div style={styles.kpiGrid}>
                <div style={styles.kpiCard} className="glass-card">
                  <div style={{ ...styles.kpiIconWrapper, background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
                    <Users size={24} />
                  </div>
                  <div>
                    <div style={styles.kpiTitle}>Total Volunteers</div>
                    <div style={styles.kpiVal}>{stats.summary.totalVolunteers}</div>
                  </div>
                </div>

                <div style={styles.kpiCard} className="glass-card">
                  <div style={{ ...styles.kpiIconWrapper, background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent)' }}>
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <div style={styles.kpiTitle}>Pending Approvals</div>
                    <div style={styles.kpiVal}>{stats.summary.pendingVolunteers}</div>
                  </div>
                </div>

                <div style={styles.kpiCard} className="glass-card">
                  <div style={{ ...styles.kpiIconWrapper, background: 'rgba(168, 85, 247, 0.15)', color: 'var(--secondary)' }}>
                    <Calendar size={24} />
                  </div>
                  <div>
                    <div style={styles.kpiTitle}>Active Drives</div>
                    <div style={styles.kpiVal}>{stats.summary.activeDrives}</div>
                  </div>
                </div>

                <div style={styles.kpiCard} className="glass-card">
                  <div style={{ ...styles.kpiIconWrapper, background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
                    <Clock size={24} />
                  </div>
                  <div>
                    <div style={styles.kpiTitle}>Volunteered Hours</div>
                    <div style={styles.kpiVal}>{stats.summary.totalHours} hrs</div>
                  </div>
                </div>
              </div>

              {/* Custom SVG Charts */}
              <div style={styles.chartsGrid}>
                
                {/* 1. Volunteer Registrations by Month */}
                <div style={styles.chartCard} className="glass-card">
                  <h4 style={styles.chartTitle}>Volunteer Signups (Monthly)</h4>
                  <div style={styles.chartContainer}>
                    <svg viewBox="0 0 350 200" style={styles.svgChart}>
                      {/* Grid Lines */}
                      <line x1="40" y1="20" x2="330" y2="20" stroke="rgba(255,255,255,0.05)" />
                      <line x1="40" y1="70" x2="330" y2="70" stroke="rgba(255,255,255,0.05)" />
                      <line x1="40" y1="120" x2="330" y2="120" stroke="rgba(255,255,255,0.05)" />
                      <line x1="40" y1="170" x2="330" y2="170" stroke="rgba(255,255,255,0.1)" />

                      {/* X and Y Axis Values */}
                      <text x="15" y="25" fill="var(--text-muted)" fontSize="10">3</text>
                      <text x="15" y="75" fill="var(--text-muted)" fontSize="10">2</text>
                      <text x="15" y="125" fill="var(--text-muted)" fontSize="10">1</text>
                      <text x="15" y="175" fill="var(--text-muted)" fontSize="10">0</text>

                      {/* Bars */}
                      {stats.charts.registrations.slice(4, 7).map((month, idx) => {
                        const maxVal = 3;
                        const height = (month.count / maxVal) * 150;
                        const y = 170 - height;
                        const x = 70 + idx * 90;
                        return (
                          <g key={idx}>
                            {/* Bar gradient */}
                            <defs>
                              <linearGradient id={`grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--primary)" />
                                <stop offset="100%" stopColor="var(--secondary)" />
                              </linearGradient>
                            </defs>
                            <rect 
                              x={x} 
                              y={y} 
                              width="40" 
                              height={height} 
                              fill={`url(#grad-${idx})`} 
                              rx="6" 
                              style={{ transition: 'all 0.5s ease-out' }}
                            />
                            {/* Value label */}
                            <text x={x + 20} y={y - 8} fill="#fff" fontSize="11" fontWeight="600" textAnchor="middle">
                              {month.count}
                            </text>
                            {/* Month label */}
                            <text x={x + 20} y="190" fill="var(--text-secondary)" fontSize="11" textAnchor="middle">
                              {month.name}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* 2. Opportunities Categories distribution */}
                <div style={styles.chartCard} className="glass-card">
                  <h4 style={styles.chartTitle}>Drives by Category</h4>
                  <div style={styles.chartContainer}>
                    {stats.charts.categories.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', marginTop: '4rem' }}>No campaign categories data available</p>
                    ) : (
                      <div style={styles.barChartCategoryContainer}>
                        {stats.charts.categories.map((cat, idx) => {
                          const maxVal = Math.max(...stats.charts.categories.map(c => c.value), 1);
                          const percentage = (cat.value / maxVal) * 100;
                          return (
                            <div key={idx} style={styles.categoryProgressRow}>
                              <div style={styles.categoryLabel}>{cat.name} ({cat.value})</div>
                              <div style={styles.progressBarBg}>
                                <div style={{ 
                                  ...styles.progressBarFill, 
                                  width: `${percentage}%`,
                                  background: idx % 2 === 0 ? 'linear-gradient(90deg, var(--primary), var(--secondary))' : 'linear-gradient(90deg, var(--accent), #d97706)'
                                }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB: VOLUNTEERS MANAGEMENT */}
          {activeTab === 'volunteers' && (
            <div className="glass-card animate-fade" style={styles.cardPadding}>
              <div style={styles.panelTitleBar}>
                <div>
                  <h2 style={styles.panelHeading}>Volunteer Roster</h2>
                  <p style={styles.panelSubheading}>Verify volunteer signups, view information, and log lifetime records</p>
                </div>
              </div>

              {/* Filters / Search Bar */}
              <div style={styles.filterBar}>
                <div style={styles.searchBox}>
                  <Search size={18} color="var(--text-muted)" />
                  <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    value={volSearch}
                    onChange={(e) => setVolSearch(e.target.value)}
                    id="search-volunteers-input"
                  />
                </div>
                <div style={styles.filterSelectWrapper}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status:</span>
                  <select 
                    value={volFilter} 
                    onChange={(e) => setVolFilter(e.target.value)}
                    className="form-select"
                    style={{ width: '150px', padding: '0.5rem' }}
                    id="filter-volunteers-status"
                  >
                    <option value="All">All Profiles</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {filteredVols.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No volunteers matching the query.
                </div>
              ) : (
                <div className="custom-table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Volunteer Info</th>
                        <th>Skills</th>
                        <th>Availability</th>
                        <th>Status</th>
                        <th>Logged Hours</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVols.map(vol => (
                        <tr key={vol.id}>
                          <td>
                            <div style={{ fontWeight: '600' }}>{vol.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{vol.email}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{vol.phone || 'No phone'}</div>
                          </td>
                          <td>
                            <div style={styles.tableTags}>
                              {(vol.skills || []).map(s => <span key={s} style={styles.miniTag}>{s}</span>)}
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.85rem' }}>{vol.availability}</span>
                          </td>
                          <td>
                            <span className={`pill ${vol.status === 'Approved' ? 'pill-approved' : vol.status === 'Pending' ? 'pill-pending' : 'pill-rejected'}`}>
                              {vol.status}
                            </span>
                          </td>
                          <td style={{ fontWeight: '600', fontFamily: 'var(--font-heading)' }}>
                            {vol.hoursVolunteered || 0} hrs
                          </td>
                          <td>
                            <div style={styles.tableActions}>
                              {vol.status === 'Pending' && (
                                <>
                                  <button 
                                    onClick={() => handleVolunteerStatus(vol.id, 'Approved')} 
                                    className="btn btn-primary"
                                    style={styles.actionIconBtn}
                                    title="Approve Profile"
                                    id={`btn-approve-vol-${vol.id}`}
                                  >
                                    <Check size={14} /> Approve
                                  </button>
                                  <button 
                                    onClick={() => handleVolunteerStatus(vol.id, 'Rejected')} 
                                    className="btn btn-danger"
                                    style={styles.actionIconBtn}
                                    title="Reject Profile"
                                    id={`btn-reject-vol-${vol.id}`}
                                  >
                                    <XCircle size={14} /> Reject
                                  </button>
                                </>
                              )}
                              {vol.status === 'Approved' && (
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified Volunteer</span>
                              )}
                              {vol.status === 'Rejected' && (
                                <button 
                                  onClick={() => handleVolunteerStatus(vol.id, 'Approved')} 
                                  className="btn btn-secondary"
                                  style={styles.actionIconBtn}
                                  id={`btn-reapprove-vol-${vol.id}`}
                                >
                                  Reinstate
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: OPPORTUNITIES CREATOR & EDITOR */}
          {activeTab === 'drives' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Form to Launch/Edit Drive */}
              <div className="glass-card" style={styles.cardPadding}>
                <h2 style={styles.panelHeading}>{isEditingOpp ? 'Edit Volunteer Drive' : 'Launch New Campaign Drive'}</h2>
                <p style={styles.panelSubheading}>Provide drive details to enlist public and verified volunteer helpers</p>
                
                <form onSubmit={handleSaveOpportunity} style={{ marginTop: '2rem' }}>
                  <div style={styles.fieldsGrid}>
                    <div className="form-group">
                      <label className="form-label">Campaign Title *</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={oppTitle} 
                        onChange={(e) => setOppTitle(e.target.value)} 
                        placeholder="e.g. Noida Education Center Project"
                        required
                        id="opp-title-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Category *</label>
                      <select 
                        className="form-select" 
                        value={oppCategory} 
                        onChange={(e) => setOppCategory(e.target.value)}
                        id="opp-category-select"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Detailed Campaign Description</label>
                    <textarea 
                      className="form-input" 
                      value={oppDesc} 
                      onChange={(e) => setOppDesc(e.target.value)} 
                      placeholder="Detail the target goals, task details, and prerequisite skills needed for this drive..."
                      rows="4"
                      id="opp-description-textarea"
                    />
                  </div>

                  <div style={styles.fieldsGrid3}>
                    <div className="form-group">
                      <label className="form-label">Drive Date *</label>
                      <input 
                        type="date" 
                        className="form-input" 
                        value={oppDate} 
                        onChange={(e) => setOppDate(e.target.value)} 
                        required
                        id="opp-date-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Location Address *</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={oppLocation} 
                        onChange={(e) => setOppLocation(e.target.value)} 
                        placeholder="e.g. Connaught Place Hub"
                        required
                        id="opp-location-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Est. Duration (e.g. 4 hours)</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={oppDuration} 
                        onChange={(e) => setOppDuration(e.target.value)}
                        id="opp-duration-input"
                      />
                    </div>
                  </div>

                  <div style={styles.fieldsGrid}>
                    <div className="form-group">
                      <label className="form-label">Required Volunteer Slots</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={oppRequired} 
                        onChange={(e) => setOppRequired(e.target.value)}
                        min="1"
                        id="opp-required-slots-input"
                      />
                    </div>
                    {isEditingOpp && (
                      <div className="form-group">
                        <label className="form-label">Campaign Status</label>
                        <select 
                          className="form-select" 
                          value={oppStatus} 
                          onChange={(e) => setOppStatus(e.target.value)}
                          id="opp-status-select"
                        >
                          <option value="Active">Active</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div style={styles.formActions}>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      id="opp-submit-btn"
                    >
                      {isEditingOpp ? 'Update Campaign Details' : 'Launch Campaign Drive'}
                    </button>
                    {isEditingOpp && (
                      <button 
                        type="button" 
                        onClick={resetOppForm} 
                        className="btn btn-secondary"
                        id="opp-cancel-btn"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Opportunities List */}
              <div className="glass-card" style={styles.cardPadding}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Current Drives Roster</h3>
                {opportunities.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No drives currently created.</p>
                ) : (
                  <div className="custom-table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Campaign Details</th>
                          <th>Location & Date</th>
                          <th>Category</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {opportunities.map(opp => (
                          <tr key={opp.id}>
                            <td>
                              <div style={{ fontWeight: '600' }}>{opp.title}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: '300px' }}>{opp.description}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Required: {opp.requiredVolunteers} spots</div>
                            </td>
                            <td>
                              <div style={{ fontSize: '0.85rem' }}>{opp.location}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{opp.date}</div>
                            </td>
                            <td>
                              <span style={styles.oppCategoryBadge}>{opp.category}</span>
                            </td>
                            <td>
                              <span className={`pill ${opp.status === 'Active' ? 'pill-approved' : opp.status === 'Completed' ? 'pill-completed' : 'pill-rejected'}`}>
                                {opp.status}
                              </span>
                            </td>
                            <td>
                              <div style={styles.tableActions}>
                                <button 
                                  onClick={() => handleEditOppClick(opp)} 
                                  className="btn btn-secondary"
                                  style={styles.actionIconBtn}
                                  title="Edit Drive"
                                  id={`btn-edit-opp-${opp.id}`}
                                >
                                  <Edit size={14} /> Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteOpp(opp.id)} 
                                  className="btn btn-danger"
                                  style={styles.actionIconBtn}
                                  title="Delete Drive"
                                  id={`btn-delete-opp-${opp.id}`}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB: APPLICATIONS REVIEW */}
          {activeTab === 'applications' && (
            <div className="glass-card animate-fade" style={styles.cardPadding}>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={styles.panelHeading}>Applications Ledger</h2>
                <p style={styles.panelSubheading}>Review registrations for volunteer drives, approve attendance, and log completed hours</p>
              </div>

              {applications.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No applications recorded in the database.
                </div>
              ) : (
                <div className="custom-table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Volunteer</th>
                        <th>Target Campaign</th>
                        <th>Applied On</th>
                        <th>Status</th>
                        <th>Logged Hours</th>
                        <th>Action Review</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map(app => (
                        <tr key={app.id}>
                          <td>
                            <div style={{ fontWeight: '600' }}>{app.volunteer ? app.volunteer.name : 'N/A'}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{app.volunteer ? app.volunteer.email : 'N/A'}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: '600' }}>{app.opportunity ? app.opportunity.title : 'Deleted Opp'}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              {app.opportunity ? app.opportunity.location : ''} | {app.opportunity ? app.opportunity.date : ''}
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.85rem' }}>{new Date(app.appliedAt).toLocaleDateString()}</span>
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
                          <td>
                            <div style={styles.tableActions}>
                              {app.status === 'Pending' && (
                                <>
                                  <button 
                                    onClick={() => handleAppStatus(app.id, 'Approved')} 
                                    className="btn btn-primary"
                                    style={styles.actionIconBtn}
                                    id={`btn-approve-app-${app.id}`}
                                  >
                                    Approve
                                  </button>
                                  <button 
                                    onClick={() => handleAppStatus(app.id, 'Rejected')} 
                                    className="btn btn-danger"
                                    style={styles.actionIconBtn}
                                    id={`btn-reject-app-${app.id}`}
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {app.status === 'Approved' && (
                                <button 
                                  onClick={() => {
                                    setLoggingHoursAppId(app.id);
                                    setLoggedHoursVal(4); // Default suggested hours
                                  }}
                                  className="btn btn-accent"
                                  style={styles.actionIconBtn}
                                  id={`btn-complete-app-${app.id}`}
                                >
                                  Complete & Log Hours
                                </button>
                              )}

                              {app.status === 'Completed' && (
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Work Confirmed</span>
                              )}
                              
                              {app.status === 'Rejected' && (
                                <span style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>Rejected</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Log Hours Overlay / Dialog */}
              {loggingHoursAppId && (
                <div style={styles.overlay} className="flex-center animate-fade">
                  <div style={styles.dialogCard} className="glass-card">
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Record Service Hours</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                      Mark campaign participation as complete and enter the final verified hours to credit to the volunteer's record.
                    </p>
                    <div className="form-group">
                      <label className="form-label">Completed Service Hours</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={loggedHoursVal} 
                        onChange={(e) => setLoggedHoursVal(Number(e.target.value))}
                        min="0"
                        id="dialog-log-hours-input"
                      />
                    </div>
                    <div style={{ ...styles.formActions, justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                      <button 
                        onClick={() => { setLoggingHoursAppId(null); setLoggedHoursVal(0); }} 
                        className="btn btn-secondary"
                        id="dialog-hours-cancel"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleLogHoursSubmit} 
                        className="btn btn-primary"
                        id="dialog-hours-submit"
                      >
                        Confirm Completion
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: REPORTS & EXPORTS */}
          {activeTab === 'reports' && (
            <div className="glass-card animate-fade" style={styles.cardPadding}>
              <div style={{ marginBottom: '2.5rem' }}>
                <h2 style={styles.panelHeading}>Exports & Summary Logs</h2>
                <p style={styles.panelSubheading}>Generate CSV files and printable roster summaries of verified volunteer details</p>
              </div>

              <div style={styles.reportsGrid}>
                <div style={styles.reportCard} className="glass-card">
                  <div style={styles.reportHeaderIcon} className="flex-center">
                    <Download size={24} color="var(--primary)" />
                  </div>
                  <h3>Full Roster CSV Export</h3>
                  <p>Download the entire database list of volunteers containing names, emails, phones, listed skills, verification status, and lifetime volunteer hours.</p>
                  <button 
                    onClick={handleExportCSV} 
                    className="btn btn-primary" 
                    style={{ marginTop: '1.5rem', width: '100%' }}
                    id="btn-export-csv"
                  >
                    Export CSV Directory
                  </button>
                </div>

                <div style={styles.reportCard} className="glass-card">
                  <div style={styles.reportHeaderIcon} className="flex-center">
                    <Award size={24} color="var(--secondary)" />
                  </div>
                  <h3>Verification Statistics</h3>
                  <p>Display summaries of active campaigns and verification queues. Prints direct summaries of internal operational counts.</p>
                  <button 
                    onClick={() => window.print()} 
                    className="btn btn-secondary" 
                    style={{ marginTop: '1.5rem', width: '100%' }}
                    id="btn-print-stats"
                  >
                    Print Summary Stats
                  </button>
                </div>
              </div>
            </div>
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
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.25rem',
  },
  kpiCard: {
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  kpiIconWrapper: {
    width: '46px',
    height: '46px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiTitle: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  kpiVal: {
    fontSize: '1.5rem',
    fontWeight: '700',
    fontFamily: 'var(--font-heading)',
    color: '#fff',
    marginTop: '0.2rem',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  chartCard: {
    padding: '1.75rem',
  },
  chartTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
  },
  chartContainer: {
    minHeight: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgChart: {
    width: '100%',
    height: '100%',
    maxHeight: '200px',
  },
  barChartCategoryContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    width: '100%',
  },
  categoryProgressRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  categoryLabel: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  progressBarBg: {
    width: '100%',
    height: '8px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.6s cubic-bezier(0.1, 1, 0.1, 1)',
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(10, 14, 26, 0.4)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0.2rem 0.75rem',
    flexGrow: 1,
    maxWidth: '400px',
  },
  filterSelectWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  tableTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.3rem',
    maxWidth: '220px',
  },
  miniTag: {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    borderRadius: '4px',
    padding: '0.1rem 0.4rem',
    fontSize: '0.75rem',
  },
  tableActions: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  actionIconBtn: {
    padding: '0.4rem 0.75rem',
    fontSize: '0.8rem',
    gap: '0.3rem',
  },
  fieldsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.25rem',
  },
  fieldsGrid3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.5fr 1fr',
    gap: '1.25rem',
  },
  oppCategoryBadge: {
    background: 'rgba(99, 102, 241, 0.1)',
    color: 'var(--primary)',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(5, 8, 16, 0.85)',
    backdropFilter: 'blur(8px)',
    zIndex: 999,
    padding: '1.5rem',
  },
  dialogCard: {
    width: '100%',
    maxWidth: '450px',
    padding: '2rem',
    borderRadius: '16px',
  },
  reportsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
  },
  reportCard: {
    padding: '2.5rem 2rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  reportHeaderIcon: {
    width: '52px',
    height: '52px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    marginBottom: '0.5rem',
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
