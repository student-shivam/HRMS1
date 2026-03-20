import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const MyDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await api.get('/employees/my/documents');
        setDocuments(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch documents');
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="glass-panel p-6 animate-fade-in">
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>My Official Documents</h2>
      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
      
      {documents.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No documents have been uploaded to your profile yet. Please contact HR.</p>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {documents.map((doc) => (
            <div key={doc._id} className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderLeft: '4px solid var(--primary)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'white' }}>{doc.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Uploaded on: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                </div>
                {/* Dynamically fallback to localhost if VITE_API_URL isn't set since this is a static href */}
                <a href={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5001'}${doc.url}`} target="_blank" rel="noreferrer" className="btn btn-secondary w-full" style={{ textAlign: 'center' }}>
                  Download / View
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyDocuments;
