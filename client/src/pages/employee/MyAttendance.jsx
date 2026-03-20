import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './Employee.css';

const MyAttendance = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const fetchHistory = async () => {
    try {
      const res = await api.get('/attendance');
      setHistory(res.data.data);
    } catch (err) {
      console.error('Failed to fetch attendance history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleMarkAttendance = async () => {
    setStatusMsg({ type: 'loading', text: 'Marking attendance...' });
    try {
      await api.post('/attendance', { status: 'Present' });
      setStatusMsg({ type: 'success', text: 'Successfully marked present for today!' });
      fetchHistory();
    } catch (err) {
      setStatusMsg({ 
        type: 'error', 
        text: err.response?.data?.message || 'Error marking attendance' 
      });
    }
  };

  return (
    <div className="animate-fade-in employee-page">
      <div className="glass-panel p-6" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', marginBottom: '0.5rem' }}>Daily Attendance</h2>
          <p className="text-muted">Clock in your attendance for today. You can only mark attendance once per day.</p>
        </div>
        <div>
          <button className="btn btn-primary shadow-hover" onClick={handleMarkAttendance} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
            Mark Present
          </button>
        </div>
      </div>

      {statusMsg.text && (
        <div className={`status-msg ${statusMsg.type}`} style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
          {statusMsg.text}
        </div>
      )}

      <div className="glass-panel p-6">
        <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>My Attendance History</h3>
        
        <div className="table-wrapper" style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
          <table className="modern-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-glass)', textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <tr>
                <th style={{ padding: '1rem 1.25rem' }}>Date</th>
                <th style={{ padding: '1rem 1.25rem' }}>Time Logged</th>
                <th style={{ padding: '1rem 1.25rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner"></div></td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No attendance records found.</td></tr>
              ) : (
                history.map(record => (
                  <tr key={record._id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-main)' }}>
                      {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)' }}>
                      {new Date(record.createdAt).toLocaleTimeString()}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ 
                        padding: '0.35em 0.75em', 
                        fontSize: '0.75rem', 
                        fontWeight: '600', 
                        borderRadius: '20px', 
                        background: 'rgba(16, 185, 129, 0.15)', 
                        color: '#34d399', 
                        border: '1px solid rgba(16, 185, 129, 0.3)' 
                      }}>
                        {record.status}
                      </span>
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

export default MyAttendance;
