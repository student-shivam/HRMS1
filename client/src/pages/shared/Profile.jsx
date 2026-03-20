import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateProfile, logout } from '../../store/slices/authSlice';
import '../admin/Admin.css';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [file, setFile] = useState(null);
  
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: ''
      });
      if (user.avatar) {
        setAvatarPreview(`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5001'}${user.avatar}`);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!loading && statusMsg.type === 'loading') {
      if (error) {
        setStatusMsg({ type: 'error', text: error });
      } else {
        setStatusMsg({ type: 'success', text: 'Profile updated successfully!' });
      }
    }
  }, [loading, error, statusMsg.type]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  const onFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setAvatarPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setStatusMsg({ type: 'loading', text: 'Updating profile...' });
    
    // We must use FormData because of potential file upload
    const profileData = new FormData();
    profileData.append('name', formData.name);
    profileData.append('email', formData.email);
    if (formData.password) {
      profileData.append('password', formData.password);
    }
    if (file) {
      profileData.append('avatar', file);
    }

    dispatch(updateProfile(profileData));
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="animate-fade-in admin-page" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <style>{`
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 26px;
        }
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(255,255,255,0.1);
          transition: .4s;
          border-radius: 34px;
          border: 1px solid var(--border-glass);
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 4px;
          bottom: 3px;
          background-color: var(--text-muted);
          transition: .4s;
          border-radius: 50%;
        }
        input:checked + .slider {
          background-color: var(--success);
          border-color: var(--success);
        }
        input:focus + .slider {
          box-shadow: 0 0 1px var(--success);
        }
        input:checked + .slider:before {
          transform: translateX(24px);
          background-color: white;
        }
      `}</style>

      <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="dashboard-title">My Profile</h1>
          <p className="dashboard-subtitle">Manage your personal information and security settings.</p>
        </div>
      </div>

      <div className="glass-panel p-6">
        <form onSubmit={onSubmit}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-glass)' }}>
            <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.1)', border: '2px solid var(--border-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {avatarPreview ? (
                 <img src={avatarPreview} alt="Profile Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                 <span style={{ fontSize: '2.5rem', color: 'var(--text-muted)' }}>{user?.name?.charAt(0) || 'U'}</span>
              )}
            </div>
            
            <div style={{ flexGrow: 1 }}>
               <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'white' }}>Profile Picture</h3>
               <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>PNG, JPG or JPEG up to 5MB.</p>
               <input type="file" onChange={onFileChange} accept="image/*" style={{ fontSize: '0.85rem' }} />
            </div>
            
            <div className={`badge ${user?.role === 'admin' ? 'badge-primary' : 'badge-success'}`}>
              {user?.role?.toUpperCase()}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={onChange} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={onChange} required />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>New Password (leave blank to keep current)</label>
            <input type="password" name="password" value={formData.password} onChange={onChange} placeholder="••••••••" style={{ maxWidth: '50%' }} />
          </div>

          {statusMsg.text && (
            <div className={`status-msg ${statusMsg.type}`} style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
              {statusMsg.text}
            </div>
          )}

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary shadow-hover" disabled={statusMsg.type === 'loading'} style={{ padding: '0.75rem 2rem' }}>
              {statusMsg.type === 'loading' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border-glass)', paddingTop: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'white' }}>Account Settings</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: '1rem 1.5rem', borderRadius: '8px', border: '1px solid var(--border-glass)', marginBottom: '2rem' }}>
              <div>
                <p style={{ fontWeight: '500', color: 'var(--text-light)', marginBottom: '0.25rem' }}>Email Notifications</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Receive email alerts when leaves or tasks are updated.</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="slider round"></span>
              </label>
            </div>
            
            <div style={{ marginTop: '0' }}>
               <button 
                type="button" 
                onClick={handleLogout} 
                className="btn btn-secondary shadow-hover" 
                style={{ 
                  padding: '0.75rem 2rem', 
                  border: '1px solid rgba(239, 68, 68, 0.4)', 
                  color: '#ef4444', 
                  background: 'rgba(239, 68, 68, 0.05)',
                  fontWeight: '600'
                }}>
                 Sign Out of Account
               </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Profile;
