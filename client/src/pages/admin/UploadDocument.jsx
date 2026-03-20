import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const UploadDocument = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [docName, setDocName] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [empDocs, setEmpDocs] = useState([]);

  useEffect(() => {
    api.get('/employees').then(res => setEmployees(res.data.data));
  }, []);

  useEffect(() => {
    if (selectedEmp) {
      const target = employees.find(e => e._id === selectedEmp);
      if (target) {
        setEmpDocs(target.documents || []);
      }
    } else {
      setEmpDocs([]);
    }
  }, [selectedEmp, employees]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedEmp || !file) return setStatus('Select employee and file.');
    
    const formData = new FormData();
    formData.append('document', file);
    formData.append('name', docName);

    try {
      setStatus('Uploading...');
      const response = await api.post(`/employees/${selectedEmp}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus('Document successfully uploaded!');
      setEmpDocs(response.data.data);
      setDocName('');
      setFile(null);
      
      setEmployees(employees.map(emp => emp._id === selectedEmp ? {...emp, documents: response.data.data} : emp));
      
    } catch (err) {
      setStatus(err.response?.data?.message || 'Upload failed');
    }
  };

  return (
    <div className="admin-page animate-fade-in">
      <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="dashboard-title">Document Management</h1>
          <p className="dashboard-subtitle">Securely transfer official PDF or Image transcripts targeting exact employee files.</p>
        </div>
      </div>

      <div className="dashboard-bottom-grid">
        <div className="glass-panel p-6 animate-fade-in">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>Upload New File</h2>
          <form onSubmit={handleUpload} className="flex flex-col gap-4">
            <div className="form-group">
              <label>Select Target Employee</label>
              <select required value={selectedEmp} onChange={(e) => setSelectedEmp(e.target.value)}>
                <option value="">-- Choose Employee Account --</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.name} ({emp.department})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Document Name (e.g. Offer Letter, W-2)</label>
              <input type="text" required value={docName} onChange={e => setDocName(e.target.value)} placeholder="Signed Contract" />
            </div>
            <div className="form-group">
              <label>Official File (PDF/PNG/JPG limit 10MB)</label>
              <input type="file" required accept=".pdf, .png, .jpg, .jpeg" onChange={e => setFile(e.target.files[0])} />
            </div>
            <button type="submit" className="btn btn-primary mt-4 w-full shadow-hover">Upload to Encrypted Vault</button>
            {status && <div style={{ padding: '0.8rem', marginTop: '1rem', background: 'var(--bg-highlight)', borderRadius: '8px', textAlign: 'center', color: 'var(--primary)' }}>{status}</div>}
          </form>
        </div>

        <div className="glass-panel p-6 animate-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
           <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>Current Employee Registry</h2>
           
           {!selectedEmp ? (
              <div className="flex-center" style={{ flexGrow: 1 }}>
                 <p className="text-muted text-center">Select an employee from the left panel to securely resolve their Document allocations.</p>
              </div>
           ) : empDocs.length === 0 ? (
              <div className="flex-center" style={{ flexGrow: 1 }}>
                 <p className="text-muted text-center" style={{ maxWidth: '80%' }}>No prior documentation tracking records detected actively assigned against this selected network node.</p>
              </div>
           ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: '450px', paddingRight: '0.5rem' }}>
                {empDocs.map((doc, idx) => (
                  <div key={idx} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderLeft: '3px solid var(--primary)', borderRadius: '6px' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'white' }}>{doc.name}</h4>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Uploaded: {new Date(doc.uploadedAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                        <a href={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}${doc.url}`} target="_blank" rel="noreferrer" className="badge badge-success" style={{ textDecoration: 'none' }}>
                          Download File
                        </a>
                     </div>
                  </div>
                ))}
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default UploadDocument;
