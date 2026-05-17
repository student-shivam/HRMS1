import React, { useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '../../utils/api';
import '../employee/Employee.css';

const CompanyProfileSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const [companyData, setCompanyData] = useState({
    name: 'RavindraNexus Technologies',
    email: 'contact@ravindranexus.com',
    phone: '+91 98765 43210',
    website: 'www.ravindranexus.com',
    address: '123 Tech Park, Sector 62, Noida, UP, India',
    logo: '',
    stamp: '',
    seal: '',
    digitalSign: '',
    authorizedSignatoryName: 'Shivam Yadav',
    authorizedSignatoryRole: 'HR Manager',
    themeColor: '#4f46e5'
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/company-profile');
      if (res.data.success && res.data.data) {
        setCompanyData(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch company profile:', error);
      setStatusMsg({
        type: 'error',
        text: getApiErrorMessage(error, 'Failed to fetch company settings')
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setCompanyData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (field, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      setStatusMsg({ type: 'error', text: 'Please select an image file (PNG/JPG)' });
      return;
    }



    const reader = new FileReader();
    reader.onload = () => {
      setCompanyData((prev) => ({
        ...prev,
        [field]: reader.result
      }));
      setStatusMsg({ type: 'success', text: `Image selected successfully` });
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = (field) => {
    setCompanyData((prev) => ({
      ...prev,
      [field]: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setStatusMsg({ type: '', text: '' });
      const res = await api.put('/company-profile', companyData);
      if (res.data.success) {
        setCompanyData(res.data.data);
        setStatusMsg({ type: 'success', text: 'Company settings saved successfully!' });
      }
    } catch (error) {
      setStatusMsg({
        type: 'error',
        text: getApiErrorMessage(error, 'Failed to update company settings')
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="spinner" style={{ margin: 'auto' }}></div>
        <p className="text-muted mt-4">Loading company settings...</p>
      </div>
    );
  }

  return (
    <div className="admin-page animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="dashboard-title">Company Settings & Branding</h1>
          <p className="dashboard-subtitle">
            Configure dynamic branding, official logos, stamps, seals, and digital signatures for professional offer letters.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem', alignItems: 'start' }} className="company-layout-grid">
          
          {/* Left Panel: Inputs */}
          <div className="glass-panel p-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ margin: 0, borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>Company Information</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label>Company Name</label>
                <input
                  required
                  type="text"
                  name="name"
                  value={companyData.name}
                  onChange={handleTextChange}
                  placeholder="e.g. RavindraNexus Technologies"
                />
              </div>

              <div className="form-group">
                <label>Company Website</label>
                <input
                  required
                  type="text"
                  name="website"
                  value={companyData.website}
                  onChange={handleTextChange}
                  placeholder="e.g. www.ravindranexus.com"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label>Support Email Address</label>
                <input
                  required
                  type="email"
                  name="email"
                  value={companyData.email}
                  onChange={handleTextChange}
                  placeholder="e.g. support@ravindranexus.com"
                />
              </div>

              <div className="form-group">
                <label>Official Phone Number</label>
                <input
                  required
                  type="text"
                  name="phone"
                  value={companyData.phone}
                  onChange={handleTextChange}
                  placeholder="e.g. +91 98765 43210"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Official Registered Address</label>
              <textarea
                required
                rows="3"
                name="address"
                value={companyData.address}
                onChange={handleTextChange}
                placeholder="Enter complete company registered office address"
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  border: '1px solid var(--border-glass)',
                  background: 'rgba(0,0,0,0.2)',
                  color: 'white',
                  padding: '0.85rem'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label>Official Brand Theme Color</label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input
                    type="color"
                    name="themeColor"
                    value={companyData.themeColor || '#4f46e5'}
                    onChange={handleTextChange}
                    style={{
                      width: '54px',
                      height: '42px',
                      padding: '0',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: 'none'
                    }}
                  />
                  <input
                    type="text"
                    name="themeColor"
                    value={companyData.themeColor || '#4f46e5'}
                    onChange={handleTextChange}
                    placeholder="#4f46e5"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '1.25rem' }}>
                <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.4' }}>
                  This theme color will automatically style header borders, title bars, and subject tags on all system-generated PDFs.
                </p>
              </div>
            </div>

            <h3 style={{ margin: '1rem 0 0', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>Authorized Signatory (HR / Director)</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label>Signatory Name</label>
                <input
                  required
                  type="text"
                  name="authorizedSignatoryName"
                  value={companyData.authorizedSignatoryName}
                  onChange={handleTextChange}
                  placeholder="e.g. Shivam Yadav"
                />
              </div>

              <div className="form-group">
                <label>Designation / Role</label>
                <input
                  required
                  type="text"
                  name="authorizedSignatoryRole"
                  value={companyData.authorizedSignatoryRole}
                  onChange={handleTextChange}
                  placeholder="e.g. HR Manager / CEO"
                />
              </div>
            </div>

            {statusMsg.text && (
              <div className={`status-msg ${statusMsg.type}`} style={{ margin: '0.5rem 0' }}>
                {statusMsg.text}
              </div>
            )}

            <button type="submit" className="btn btn-primary shadow-hover" style={{ marginTop: '1rem', width: '200px' }} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

          {/* Right Panel: Official Assets (Logo, Stamp, Seal, Signature) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Logo Slot */}
            <div className="glass-panel p-6">
              <h4 style={{ margin: '0 0 1rem' }}>Company Logo</h4>
              <div
                style={{
                  height: '110px',
                  border: '2px dashed rgba(255,255,255,0.1)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.3)',
                  marginBottom: '1rem',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {companyData.logo ? (
                  <>
                    <img src={companyData.logo} alt="Logo Preview" style={{ maxHeight: '90px', maxWidth: '90%', objectFit: 'contain' }} />
                    <button
                      type="button"
                      onClick={() => handleClearImage('logo')}
                      style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        background: 'rgba(239, 68, 68, 0.85)',
                        border: 'none',
                        color: 'white',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px'
                      }}
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <span className="text-muted" style={{ fontSize: '0.9rem' }}>No logo uploaded</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload('logo', e)}
                style={{ display: 'block', fontSize: '0.85rem' }}
              />
            </div>

            {/* Digital Signature Slot */}
            <div className="glass-panel p-6">
              <h4 style={{ margin: '0 0 1rem' }}>Digital Signature (Authorized Signatory)</h4>
              <div
                style={{
                  height: '100px',
                  border: '2px dashed rgba(255,255,255,0.1)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.3)',
                  marginBottom: '1rem',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {companyData.digitalSign ? (
                  <>
                    <img src={companyData.digitalSign} alt="Signature Preview" style={{ maxHeight: '80px', maxWidth: '90%', objectFit: 'contain' }} />
                    <button
                      type="button"
                      onClick={() => handleClearImage('digitalSign')}
                      style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        background: 'rgba(239, 68, 68, 0.85)',
                        border: 'none',
                        color: 'white',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px'
                      }}
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <span className="text-muted" style={{ fontSize: '0.9rem' }}>No signature uploaded</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload('digitalSign', e)}
                style={{ display: 'block', fontSize: '0.85rem' }}
              />
            </div>

            {/* Stamp and Seal Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              
              {/* Official Stamp */}
              <div className="glass-panel p-4" style={{ display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem' }}>Official Stamp</h4>
                <div
                  style={{
                    height: '90px',
                    border: '2px dashed rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.3)',
                    marginBottom: '0.75rem',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  {companyData.stamp ? (
                    <>
                      <img src={companyData.stamp} alt="Stamp Preview" style={{ maxHeight: '75px', maxWidth: '90%', objectFit: 'contain' }} />
                      <button
                        type="button"
                        onClick={() => handleClearImage('stamp')}
                        style={{
                          position: 'absolute',
                          top: '3px',
                          right: '3px',
                          background: 'rgba(239, 68, 68, 0.85)',
                          border: 'none',
                          color: 'white',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px'
                        }}
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>No Stamp</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload('stamp', e)}
                  style={{ display: 'block', fontSize: '0.7rem', width: '100%' }}
                />
              </div>

              {/* Official Seal */}
              <div className="glass-panel p-4" style={{ display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem' }}>Official Seal</h4>
                <div
                  style={{
                    height: '90px',
                    border: '2px dashed rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.3)',
                    marginBottom: '0.75rem',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  {companyData.seal ? (
                    <>
                      <img src={companyData.seal} alt="Seal Preview" style={{ maxHeight: '75px', maxWidth: '90%', objectFit: 'contain' }} />
                      <button
                        type="button"
                        onClick={() => handleClearImage('seal')}
                        style={{
                          position: 'absolute',
                          top: '3px',
                          right: '3px',
                          background: 'rgba(239, 68, 68, 0.85)',
                          border: 'none',
                          color: 'white',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px'
                        }}
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>No Seal</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload('seal', e)}
                  style={{ display: 'block', fontSize: '0.7rem', width: '100%' }}
                />
              </div>

            </div>

          </div>

        </div>
      </form>
    </div>
  );
};

export default CompanyProfileSettings;
