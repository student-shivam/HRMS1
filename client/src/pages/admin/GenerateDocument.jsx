import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const GenerateDocument = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [role, setRole] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState(null);

  useEffect(() => {
    api.get('/employees').then(res => setEmployees(res.data.data)).catch(err => console.error(err));
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedEmp) return setStatus('Please select an employee.');
    
    setLoading(true);
    setStatus('Generating Offer Letter...');
    setGeneratedDoc(null);

    try {
      const res = await api.post('/documents/generate-offer', {
        employeeId: selectedEmp,
        role,
        joiningDate
      });
      setStatus('Success! Offer Letter generated.');
      setGeneratedDoc(res.data.data);
      setRole('');
      setJoiningDate('');
    } catch (err) {
      console.error(err);
      setStatus(err.response?.data?.error || 'Failed to generate document');
    } finally {
      setLoading(false);
    }
  };

  const selectedEmpObj = employees.find(e => e._id === selectedEmp) || {};

  return (
    <div className="admin-page animate-fade-in">
      <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="dashboard-title">Offer Letter Generator</h1>
          <p className="dashboard-subtitle">Dynamically assemble and execute official encrypted PDF contracts directly assigning sub-schemas.</p>
        </div>
      </div>

      <div className="dashboard-bottom-grid">
        {/* Input Form Column */}
        <div className="glass-panel p-6 animate-fade-in">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>Contract Configuration</h2>
      <form onSubmit={handleGenerate} className="flex flex-col gap-4">
        
        <div className="form-group">
          <label>Select Employee</label>
          <select required value={selectedEmp} onChange={(e) => setSelectedEmp(e.target.value)}>
            <option value="">-- Choose Employee --</option>
            {employees.map(emp => (
              <option key={emp._id} value={emp._id}>{emp.name} ({emp.department}) - ${emp.salary}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Role / Designation Override (Optional)</label>
          <input 
            type="text" 
            value={role} 
            onChange={e => setRole(e.target.value)} 
            placeholder="e.g. Senior Software Engineer" 
          />
        </div>

        <div className="form-group">
          <label>Joining Date</label>
          <input 
            type="date" 
            required 
            value={joiningDate} 
            onChange={e => setJoiningDate(e.target.value)} 
          />
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary mt-4 w-full">
          {loading ? 'Generating...' : 'Generate PDF'}
        </button>

        {status && (
          <div style={{ padding: '1rem', marginTop: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textAlign: 'center', color: 'var(--primary)' }}>
            {status}
          </div>
        )}

        {generatedDoc && (
          <div style={{ padding: '1.5rem', marginTop: '1rem', border: '1px solid var(--success)', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{color: 'var(--success)', marginBottom: '0.5rem'}}>Document Ready</h3>
            <p style={{marginBottom: '1rem'}}>The offer letter has been generated and saved to the employee's profile.</p>
            <a href={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5001'}${generatedDoc.url}`} target="_blank" rel="noreferrer" className="btn btn-secondary">
              View PDF Document
            </a>
          </div>
        )}

        </form>
        </div>

        {/* Live Preview Column */}
        <div className="glass-panel p-6 animate-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>Live Preview</h2>
          <div style={{
            background: 'white', 
            color: 'black', 
            padding: '2rem', 
            borderRadius: '4px',
            flexGrow: 1,
            overflowY: 'auto',
            maxHeight: '600px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ textAlign: 'center', borderBottom: '2px solid #1e3a8a', paddingBottom: '1rem', marginBottom: '2rem' }}>
              <h1 style={{ color: '#1e3a8a', fontSize: '1.5rem', margin: 0 }}>COMPANY HRMS INC.</h1>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>123 Corporate Blvd, Tech City, CA 90210</p>
            </div>
            
            <p style={{ textAlign: 'right', marginBottom: '2rem' }}>Date: {new Date().toLocaleDateString()}</p>
            
            <p><strong>To:</strong> {selectedEmpObj.name || '[Employee Name]'}</p>
            <p><strong>Department:</strong> {selectedEmpObj.department || '[Department]'}</p>
            
            <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Subject: Offer of Employment</h3>
            
            <p>Dear {selectedEmpObj.name ? selectedEmpObj.name.split(' ')[0] : '[First Name]'},</p>
            
            <p style={{ lineHeight: '1.6' }}>
              We are pleased to offer you the position of <strong>{role || selectedEmpObj.role || '[Role]'}</strong> with Company HRMS Inc. 
              Your expected joining date will be <strong>{joiningDate ? new Date(joiningDate).toLocaleDateString() : '[Date]'}</strong>.
            </p>
            
            <p style={{ lineHeight: '1.6' }}>
               Your starting compensation will be <strong>${selectedEmpObj.salary ? selectedEmpObj.salary.toLocaleString() : '[Salary]'}</strong> per year, subject to standard deductions and taxes. You will report directly to the Head of {selectedEmpObj.department || '[Department]'}.
            </p>
            
            <p style={{ lineHeight: '1.6' }}>
               This offer is contingent upon successful completion of background verification.
            </p>
            
            <div style={{ marginTop: '3rem' }}>
              <p>Sincerely,</p>
              <div style={{ height: '50px', borderBottom: '1px solid #000', width: '200px', marginBottom: '0.5rem' }}></div>
              <p>Human Resources Director</p>
              <p>Company HRMS Inc.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GenerateDocument;
