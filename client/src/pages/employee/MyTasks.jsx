import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useSocket } from '../../context/SocketContext';
import './Employee.css';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notifications } = useSocket() || {};

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data.data);
    } catch (err) {
      console.error('Failed to load tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Real-time update via Socket.io when receiving new assignments
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      if (notifications[0].type === 'task') {
        fetchTasks();
      }
    }
  }, [notifications]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.put(`/tasks/${id}/status`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Completed') return 'badge-success';
    if (status === 'In Progress') return 'badge-primary';
    return 'badge-warning';
  };

  return (
    <div className="animate-fade-in employee-page">
      <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="dashboard-title">My Tasks</h1>
          <p className="dashboard-subtitle">Track and update your assigned deliverables.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <div className="spinner"></div>
        ) : tasks.length === 0 ? (
          <div className="glass-panel p-6 text-muted text-center" style={{ gridColumn: '1 / -1' }}>You have no assigned tasks.</div>
        ) : (
          tasks.map(task => (
            <div key={task._id} className="glass-panel p-6" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: `4px solid ${task.status === 'Completed' ? 'var(--success)' : task.status === 'In Progress' ? 'var(--primary)' : 'var(--warning)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'white', margin: 0 }}>{task.title}</h3>
                <span className={`badge ${getStatusBadge(task.status)}`}>{task.status}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', flexGrow: 1, margin: 0 }}>
                {task.description}
              </p>
              
              <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Assigned: {new Date(task.createdAt).toLocaleDateString()}
                </span>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {task.status === 'Pending' && (
                    <button className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleStatusUpdate(task._id, 'In Progress')}>
                      Start Work
                    </button>
                  )}
                  {task.status === 'In Progress' && (
                    <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: 'var(--success)', color: 'white', border: 'none' }} onClick={() => handleStatusUpdate(task._id, 'Completed')}>
                      Mark Done
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyTasks;
