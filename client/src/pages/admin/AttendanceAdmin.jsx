import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import '../admin/Admin.css';

const AttendanceAdmin = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(() => {
    // Default to today (YYYY-MM-DD format)
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.get('/attendance');
      setLogs(res.data.data);
    } catch (err) {
      console.error('Failed to fetch attendance logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // Filter logs logically purely on the frontend based on the selected date
  // (In a real massive app, we'd pass ?date=YYYY-MM-DD to API)
  const filteredLogs = logs.filter(log => {
    if (!dateFilter) return true;
    const logDate = new Date(log.date).toISOString().split('T')[0];
    return logDate === dateFilter;
  });

  return (
    <div className="animate-fade-in admin-page">
      <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="dashboard-title">Company Attendance Logs</h1>
          <p className="dashboard-subtitle">Monitor and verify daily employee operations</p>
        </div>
      </div>

      <div className="glass-panel p-6">
        <div className="table-controls" style={{ justifyContent: 'flex-start' }}>
          <div className="filter-box" style={{ width: '100%', maxWidth: '300px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Filter by Date
            </label>
            <input 
              type="date" 
              value={dateFilter} 
              onChange={e => setDateFilter(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-highlight)', color: 'var(--text-main)', borderRadius: 'var(--radius-sm)' }}
            />
          </div>
          <button className="btn btn-secondary mt-5" onClick={() => setDateFilter('')}>
            Clear Filter
          </button>
        </div>

        <div className="table-wrapper mt-4">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Time Logged</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-6"><div className="spinner"></div></td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-6 text-muted">No attendance activity found for this criteria.</td></tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log._id}>
                    <td>
                      <div className="td-user">
                        <div className="avatar-placeholder-sm">{log.userId?.name?.charAt(0) || 'U'}</div>
                        <div className="flex flex-col">
                          <span className="font-medium text-main">{log.userId?.name || 'Unknown User'}</span>
                          <span className="text-muted" style={{fontSize: '0.8rem'}}>{log.userId?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="text-main">
                      {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="text-muted">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </td>
                    <td>
                      <span className="badge badge-success">{log.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceAdmin;
