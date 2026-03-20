import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './Admin.css';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({ title: '', description: '', assignedTo: '' });
  const [formStatus, setFormStatus] = useState({ type: '', text: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, usersRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/auth/users')
      ]);
      setTasks(tasksRes.data.data);
      setUsers(usersRes.data.data);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignTask = async (e) => {
    e.preventDefault();
    setFormStatus({ type: 'loading', text: 'Assigning task...' });
    try {
      await api.post('/tasks', formData);
      setFormStatus({ type: 'success', text: 'Task successfully assigned!' });
      fetchData();
      setTimeout(() => setShowModal(false), 1500);
    } catch (err) {
      setFormStatus({ type: 'error', text: err.response?.data?.message || 'Assignment failed' });
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Completed') return 'badge-success';
    if (status === 'In Progress') return 'badge-primary';
    return 'badge-warning';
  };

  return (
    <div className="animate-fade-in tasks-page">
      <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="dashboard-title">Task Management</h1>
          <p className="dashboard-subtitle">Assign deliverables and track productivity across the company.</p>
        </div>
        <div>
          <button className="btn btn-primary shadow-hover" onClick={() => {
            setFormData({ title: '', description: '', assignedTo: '' });
            setFormStatus({ type: '', text: '' });
            setShowModal(true);
          }}>
            + Assign Task
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <div className="spinner"></div>
        ) : tasks.length === 0 ? (
          <div className="glass-panel p-6 text-muted text-center" style={{ gridColumn: '1 / -1' }}>No tasks have been assigned yet.</div>
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
                <div className="td-user">
                    <div className="avatar-placeholder-sm" style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}>
                      {task.assignedTo?.name?.charAt(0) || '?'}
                    </div>
                    <span style={{ fontSize: '0.85rem' }}>{task.assignedTo?.name || 'Unassigned'}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(task.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container glass-panel animate-fade-in">
            <div className="modal-header">
              <h3>Create & Assign Task</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAssignTask} className="modal-body">
              <div className="form-group">
                <label>Task Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Develop new API endpoint" />
              </div>
              <div className="form-group">
                <label>Description (Details/Links)</label>
                <textarea required rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Include scope and requirements..."></textarea>
              </div>
              <div className="form-group">
                <label>Assign To Employee</label>
                <select required value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})}>
                  <option value="">Select Employee</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>

              {formStatus.text && (
                <div className={`status-msg ${formStatus.type}`}>
                  {formStatus.text}
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary shadow-hover" disabled={formStatus.type === 'loading'}>
                  Assign Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Tasks;
