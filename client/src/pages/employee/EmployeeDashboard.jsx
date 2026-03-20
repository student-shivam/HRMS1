import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const EmployeeDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [attendanceMsg, setAttendanceMsg] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/employee');
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to fetch employee stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleMarkAttendance = async () => {
    setMarking(true);
    setAttendanceMsg({ type: '', text: '' });
    try {
      await api.post('/attendance', { status: 'Present' });
      setAttendanceMsg({ type: 'success', text: 'Attendance marked for today!' });
      // Re-fetch stats to trigger real-time UI dashboard update mapping the incremented counter
      fetchStats();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to mark attendance';
      setAttendanceMsg({ type: 'warning', text: message });
    } finally {
      setMarking(false);
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="animate-fade-in dashboard-page">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>My Dashboard</h1>
          <p>Your HRMS Summary</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className="btn btn-secondary shadow-hover"
              onClick={() => navigate('/employee/leaves')}
            >
              Apply Leave
            </button>
            
            {!stats?.attendance?.isAttendanceMarkedToday ? (
              <button 
                className="btn btn-primary shadow-hover" 
                onClick={handleMarkAttendance}
                disabled={marking || attendanceMsg.type === 'success'}
                style={{ fontWeight: 'bold' }}
              >
                {marking ? 'Marking...' : 'Check In Today'}
              </button>
            ) : (
              <span style={{ 
                color: 'var(--success)', 
                fontWeight: 'bold', 
                alignSelf: 'center', 
                backgroundColor: 'rgba(255,255,255,0.05)', 
                padding: '0.75rem 1.5rem', 
                borderRadius: '4px',
                border: '1px solid var(--success)'
              }}>
                🎉 Checked-In Today
              </span>
            )}
          </div>
          {attendanceMsg.text && !stats?.attendance?.isAttendanceMarkedToday && (
            <span style={{ 
              marginTop: '0.5rem', 
              fontSize: '0.85rem', 
              color: attendanceMsg.type === 'success' ? 'var(--success)' : 'var(--warning)',
              fontWeight: '500'
            }}>
              {attendanceMsg.text}
            </span>
          )}
        </div>
      </header>

      <div className="stats-grid" style={{ marginTop: '2rem' }}>
        <div className="glass-panel stat-card">
          <h3>Days Present</h3>
          <p className="stat-value success">{stats?.attendance?.daysPresent || 0}</p>
        </div>
        <div className="glass-panel stat-card">
          <h3>Days Absent</h3>
          <p className="stat-value warning">{stats?.attendance?.daysAbsent || 0}</p>
        </div>
        <div className="glass-panel stat-card">
          <h3>Pending Tasks</h3>
          <p className="stat-value primary">{stats?.tasks?.pendingTasks || 0}</p>
        </div>
        <div className="glass-panel stat-card">
          <h3>Approved Leaves</h3>
          <p className="stat-value">{stats?.leaves?.approvedLeaves || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
