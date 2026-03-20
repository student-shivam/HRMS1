import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useSocket } from '../../context/SocketContext';
import './Admin.css';

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { notifications } = useSocket() || {};

  const fetchLeaves = async () => {
    try {
      const res = await api.get('/leaves');
      setLeaves(res.data.data);
    } catch (err) {
      console.error('Failed to fetch leaves', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Real-time update: whenever a new notification comes in, refetch leaves
  // This is a simple strategy to catch "new leave applied" events
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      const latestNotif = notifications[0];
      if (latestNotif.type === 'leave') {
        fetchLeaves();
      }
    }
  }, [notifications]);

  const handleUpdateStatus = async (id, status) => {
    setActionLoading(true);
    try {
      await api.put(`/leaves/${id}/status`, { status });
      setSelectedLeave(null);
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${status.toLowerCase()} leave`);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredLeaves = statusFilter 
    ? leaves.filter(leave => leave.status === statusFilter)
    : leaves;

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Approved': return 'badge-success';
      case 'Rejected': return 'badge-danger';
      default: return 'badge-warning';
    }
  };

  return (
    <div className="animate-fade-in leaves-page">
      <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="dashboard-title">Leave Requests</h1>
          <p className="dashboard-subtitle">Manage employee time off</p>
        </div>
      </div>

      <div className="glass-panel p-6">
        <div className="table-controls" style={{ justifyContent: 'flex-end' }}>
          <div className="filter-box">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Applied On</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-6"><div className="spinner"></div></td></tr>
              ) : filteredLeaves.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-6 text-muted">No leave requests found.</td></tr>
              ) : (
                filteredLeaves.map(leave => (
                  <tr key={leave._id}>
                    <td>
                      <div className="td-user">
                        <div className="avatar-placeholder-sm">{leave.userId?.name?.charAt(0) || 'U'}</div>
                        <div className="flex flex-col">
                          <span className="font-medium text-main">{leave.userId?.name || 'Unknown User'}</span>
                          <span className="text-muted" style={{fontSize: '0.8rem'}}>{leave.userId?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="text-main">
                      {new Date(leave.fromDate).toLocaleDateString()} <br /> 
                      <span className="text-muted" style={{fontSize: '0.8rem'}}>to</span> <br /> 
                      {new Date(leave.toDate).toLocaleDateString()}
                    </td>
                    <td>
                      <span className="text-muted" style={{ display: 'inline-block', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {leave.reason}
                      </span>
                    </td>
                    <td className="text-muted">{new Date(leave.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(leave.status)}`}>{leave.status}</span>
                    </td>
                    <td className="text-right">
                      <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem'}} onClick={() => setSelectedLeave(leave)}>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLeave && (
        <div className="modal-overlay">
          <div className="modal-container glass-panel animate-fade-in">
            <div className="modal-header">
              <h3>Leave Request Details</h3>
              <button className="close-btn" onClick={() => setSelectedLeave(null)}>&times;</button>
            </div>
            <div className="modal-body" style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.8' }}>
              <div className="flex justify-between items-center mb-4">
                <div className="td-user">
                  <div className="avatar-placeholder-sm">{selectedLeave.userId?.name?.charAt(0) || 'U'}</div>
                  <span className="font-medium" style={{ fontSize: '1.1rem'}}>{selectedLeave.userId?.name}</span>
                </div>
                <span className={`badge ${getStatusBadgeClass(selectedLeave.status)}`}>{selectedLeave.status}</span>
              </div>
              
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <p><strong>From:</strong> {new Date(selectedLeave.fromDate).toDateString()}</p>
                <p><strong>To:</strong> {new Date(selectedLeave.toDate).toDateString()}</p>
                <p><strong>Applied On:</strong> {new Date(selectedLeave.createdAt).toLocaleString()}</p>
              </div>

              <div>
                <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Reason:</strong>
                <p style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                  {selectedLeave.reason}
                </p>
              </div>

              {selectedLeave.status === 'Pending' && (
                <div className="modal-footer mt-4" style={{ paddingTop: '1.5rem', marginTop: '1rem' }}>
                  <button 
                    className="btn btn-danger" 
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(selectedLeave._id, 'Rejected')}
                  >
                    Reject
                  </button>
                  <button 
                    className="btn btn-primary" 
                    style={{ background: 'var(--success)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(selectedLeave._id, 'Approved')}
                  >
                    Approve Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves;
