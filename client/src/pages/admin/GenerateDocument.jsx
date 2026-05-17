import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api, { API_BASE_URL, getApiErrorMessage } from '../../utils/api';
import { APP_NAME, APP_TAGLINE } from '../../utils/branding';

const GenerateDocument = () => {
  const { user } = useSelector((state) => state.auth);
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [docType, setDocType] = useState('Offer Letter');
  const [role, setRole] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState(null);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    // Fetch Employees
    api.get('/employees')
      .then((res) => setEmployees(res.data.data))
      .catch((err) => console.error('Failed to fetch employees:', err));

    // Fetch Company Profile Settings
    api.get('/company-profile')
      .then((res) => {
        if (res.data.success && res.data.data) {
          setCompany(res.data.data);
        }
      })
      .catch((err) => console.error('Failed to fetch company settings:', err));
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedEmp) return setStatus('Please select an employee.');

    setLoading(true);
    setStatus(`Generating ${docType}...`);
    setGeneratedDoc(null);

    try {
      const endpoint = docType === 'Joining Letter' 
        ? '/documents/generate-joining' 
        : '/documents/generate-offer';

      const res = await api.post(endpoint, {
        employeeId: selectedEmp,
        role,
        joiningDate
      });
      
      setStatus(`Success! ${docType} generated.`);
      setGeneratedDoc(res.data.data);
      setRole('');
      setJoiningDate('');
    } catch (err) {
      console.error(err);
      setStatus(getApiErrorMessage(err, 'Failed to generate document'));
    } finally {
      setLoading(false);
    }
  };

  const selectedEmpObj = employees.find((e) => e._id === selectedEmp) || {};
  const employeeName = selectedEmpObj.name || '[Employee Name]';
  const firstName = selectedEmpObj.name ? selectedEmpObj.name.split(' ')[0] : '[First Name]';
  const employeeRole = role || selectedEmpObj.role || '[Role]';
  const departmentName = selectedEmpObj.department || '[Department Name]';
  const formattedJoiningDate = joiningDate
    ? new Date(joiningDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '[Joining Date]';
  
  const formattedSalary = selectedEmpObj.salary
    ? `Rs. ${selectedEmpObj.salary.toLocaleString('en-IN')} per annum`
    : '[Salary]';

  const hrName = company?.authorizedSignatoryName || user?.name || '[HR Name]';
  const hrRole = company?.authorizedSignatoryRole || 'HR Manager';
  const themeColor = company?.themeColor || '#4f46e5';

  const emailSubject = generatedDoc ? encodeURIComponent(`${docType} - ${generatedDoc.employeeName || employeeName}`) : '';
  const emailBody = generatedDoc ? encodeURIComponent(
    `Dear ${firstName},\n\nPlease find your official ${docType.toLowerCase()} here:\n${API_BASE_URL.replace(/\/api$/, '')}${generatedDoc.downloadUrl}\n\nRegards,\n${hrName}\n${hrRole}`
  ) : '';

  const handleSecureOpen = async (endpoint, downloadName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL.replace(/\/api$/, '')}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Unable to access file');

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      if (downloadName) {
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = downloadName;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      } else {
        window.open(objectUrl, '_blank', 'noopener,noreferrer');
      }
      setTimeout(() => window.URL.revokeObjectURL(objectUrl), 4000);
    } catch (error) {
      setStatus(getApiErrorMessage(error, 'Unable to access generated document'));
    }
  };

  return (
    <div className="admin-page animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="dashboard-title">Document Generator</h1>
          <p className="dashboard-subtitle">Generate dynamic, print-ready Offer Letters or Appointment Joining Letters with premium color styling.</p>
        </div>
      </div>

      <div className="dashboard-bottom-grid">
        {/* Left Form Panel */}
        <div className="glass-panel p-6 animate-fade-in" style={{ height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>Contract Configuration</h2>
          <form onSubmit={handleGenerate} className="flex flex-col gap-4">
            
            <div className="form-group">
              <label>Select Document Type</label>
              <select value={docType} onChange={(e) => setDocType(e.target.value)} style={{ padding: '0.85rem' }}>
                <option value="Offer Letter">Offer Letter</option>
                <option value="Joining Letter">Joining Letter / Appointment Letter</option>
              </select>
            </div>

            <div className="form-group">
              <label>Select Employee</label>
              <select required value={selectedEmp} onChange={(e) => setSelectedEmp(e.target.value)}>
                <option value="">-- Choose Employee --</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>{emp.name} ({emp.department}) - Rs. {emp.salary?.toLocaleString()}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Role / Designation Override (Optional)</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
              />
            </div>

            <div className="form-group">
              <label>Joining Date</label>
              <input
                type="date"
                required
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary mt-4 w-full" style={{ padding: '0.85rem' }}>
              {loading ? 'Generating...' : `Generate ${docType}`}
            </button>

            {status && (
              <div style={{ padding: '1rem', marginTop: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textAlign: 'center', color: themeColor, fontWeight: '600' }}>
                {status}
              </div>
            )}

            {generatedDoc && (
              <div style={{ padding: '1.5rem', marginTop: '1rem', border: `1.5px solid ${themeColor}`, borderRadius: '8px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                <h3 style={{ color: themeColor, marginBottom: '0.5rem', fontWeight: 'bold' }}>Document Ready</h3>
                <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>The {docType.toLowerCase()} has been generated and saved to the employee&apos;s profile.</p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => handleSecureOpen(generatedDoc.previewUrl)}>
                    View PDF
                  </button>
                  <button type="button" className="btn btn-primary" style={{ background: themeColor, borderColor: themeColor }} onClick={() => handleSecureOpen(generatedDoc.downloadUrl, `${generatedDoc.employeeName || employeeName}-${docType.replace(' ', '-')}.pdf`)}>
                    Download PDF
                  </button>
                  <a
                    href={`mailto:${generatedDoc.employeeEmail || ''}?subject=${emailSubject}&body=${emailBody}`}
                    className="btn btn-secondary"
                  >
                    Send via Email
                  </a>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Right Live Preview Panel */}
        <div className="glass-panel p-6 animate-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>Live Branding Preview</h2>
          <div
            style={{
              background: 'white',
              color: '#1f2937',
              padding: '28px 30px',
              borderRadius: '4px',
              flexGrow: 1,
              overflowY: 'auto',
              maxHeight: '800px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
              fontFamily: 'Arial, Helvetica, sans-serif',
              lineHeight: '1.38',
              fontSize: '12px'
            }}
          >
            {/* Dynamic Letterhead */}
            <div style={{ textAlign: 'center', borderBottom: `1.8px solid ${themeColor}`, paddingBottom: '12px', marginBottom: '18px' }}>
              {company?.logo ? (
                <img src={company.logo} alt="Company Logo" style={{ maxHeight: '42px', maxWidth: '170px', marginBottom: '4px', objectFit: 'contain' }} />
              ) : (
                <h1 style={{ color: themeColor, fontSize: '20px', fontWeight: '700', margin: 0, letterSpacing: '0.8px' }}>{company?.name || APP_NAME}</h1>
              )}
              <p style={{ margin: '4px 0 2px', fontSize: '10px', color: '#4b5563' }}>{company?.address || 'Corporate Headquarters'}</p>
              <p style={{ margin: 0, fontSize: '10px', color: '#4b5563' }}>{company?.email || 'support@ravindranexus.com'} | {company?.website || 'www.ravindranexus.com'}</p>
            </div>

            {/* Meta Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '11px' }}>
              <p style={{ margin: 0 }}><strong>Ref No:</strong> {(company?.name || APP_NAME).substring(0, 3).toUpperCase()}/{docType === 'Joining Letter' ? 'JOINING' : 'OFFER'}/{new Date().getFullYear()}/{Math.floor(1000 + Math.random() * 9000)}</p>
              <p style={{ margin: 0 }}><strong>Date:</strong> {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>

            {/* Recipient */}
            <div style={{ marginBottom: '12px' }}>
              <p style={{ margin: '0 0 2px' }}><strong>To,</strong></p>
              <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '700', color: '#111827' }}>{employeeName}</p>
              <p style={{ margin: 0 }}><strong>Department:</strong> {departmentName}</p>
            </div>

            {/* Subject Bar styled with Brand themeColor */}
            <div style={{ margin: '0 0 12px', padding: '7px 9px', border: `1px solid ${themeColor}`, background: themeColor, color: 'white', fontSize: '11px', fontWeight: '700', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {docType === 'Joining Letter' ? 'Letter of Appointment / Joining confirmation' : 'Offer of Employment'}
            </div>

            <p style={{ margin: '0 0 10px' }}>Dear <strong>{firstName}</strong>,</p>

            {docType === 'Offer Letter' ? (
              <>
                <p style={{ margin: '0 0 10px', textAlign: 'justify' }}>
                  We are pleased to offer you the position of <strong>{employeeRole}</strong> in the <strong>{departmentName}</strong> department at <strong>{company?.name || APP_NAME}</strong>. Your date of joining will be <strong>{formattedJoiningDate}</strong>, subject to completion of joining formalities, submission of required documents, and verification as per company policy.
                </p>

                <p style={{ margin: '0 0 10px', textAlign: 'justify' }}>
                  Your annual gross compensation will be <strong>{formattedSalary}</strong>. The salary structure, statutory components, reimbursements, and other benefits applicable to your role will be administered in accordance with prevailing company policy and applicable law.
                </p>

                <div style={{ marginTop: '12px' }}>
                  <h4 style={{ fontSize: '11px', fontWeight: '700', margin: '0 0 6px', color: themeColor, textTransform: 'uppercase', letterSpacing: '0.45px' }}>Key Terms of Employment</h4>
                  <ul style={{ margin: 0, paddingLeft: '18px' }}>
                    <li style={{ marginBottom: '4px' }}><strong>Working Hours:</strong> Your standard working hours will be <strong>10:00 AM to 5:00 PM</strong>, Monday through Saturday.</li>
                    <li style={{ marginBottom: '4px' }}><strong>Probation:</strong> Subject to satisfactory performance, conduct, and successful completion of the probation period.</li>
                    <li style={{ marginBottom: '4px' }}><strong>Notice Period:</strong> Either party may terminate employment by giving <strong>30 days</strong> written notice.</li>
                    <li style={{ marginBottom: '4px' }}><strong>Confidentiality:</strong> Maintain strict confidentiality of all business information.</li>
                    <li><strong>Verification:</strong> Contingent upon academic, professional, and reference checks.</li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <p style={{ margin: '0 0 10px', textAlign: 'justify' }}>
                  With reference to your acceptance of our offer of employment and subsequent joining formalities, we are extremely pleased to confirm your appointment as <strong>{employeeRole}</strong> in the <strong>{departmentName}</strong> department at <strong>{company?.name || APP_NAME}</strong>, effective from your joining date of <strong>{formattedJoiningDate}</strong>.
                </p>

                <p style={{ margin: '0 0 10px', textAlign: 'justify' }}>
                  Your annual gross compensation is confirmed at <strong>{formattedSalary}</strong>. You will be on probation for a period of six months from your date of joining. Upon successful completion of your probation, your services will be confirmed in writing.
                </p>

                <div style={{ marginTop: '12px' }}>
                  <h4 style={{ fontSize: '11px', fontWeight: '700', margin: '0 0 6px', color: themeColor, textTransform: 'uppercase', letterSpacing: '0.45px' }}>Standard Terms & Undertakings</h4>
                  <ul style={{ margin: 0, paddingLeft: '18px' }}>
                    <li style={{ marginBottom: '4px' }}><strong>Duties:</strong> Perform all tasks assigned to your role diligently and follow administrative orders.</li>
                    <li style={{ marginBottom: '4px' }}><strong>Adherence:</strong> Abide by code of conduct, non-disclosure, and data security policies.</li>
                    <li style={{ marginBottom: '4px' }}><strong>Exclusivity:</strong> Do not engage in any other business or consulting role during employment.</li>
                    <li><strong>Notice Period:</strong> Post-probation, notice period of <strong>30 days</strong> is mandatory.</li>
                  </ul>
                </div>
              </>
            )}

            <div style={{ marginTop: '12px' }}>
              <p style={{ margin: 0, textAlign: 'justify' }}>
                We welcome you to the family and look forward to a mutually successful, long, and rewarding career journey together. We are confident that your expertise and dedication will add great value to our teams.
              </p>
            </div>

            <p style={{ margin: '12px 0 0', textAlign: 'justify' }}>
              Kindly sign and return a copy of this letter as confirmation of your acceptance of the above terms.
            </p>

            {/* Signature Block with Stamp, Seal & Digital Sign Previews */}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', gap: '20px', position: 'relative' }}>
              
              <div style={{ width: '48%', position: 'relative' }}>
                <p style={{ margin: '0 0 6px', color: themeColor }}><strong>For {company?.name || APP_NAME}</strong></p>
                
                {company?.digitalSign ? (
                  <div style={{ margin: '4px 0' }}><img src={company.digitalSign} alt="Digital Sign" style={{ maxHeight: '36px', maxWidth: '100%', objectFit: 'contain' }} /></div>
                ) : (
                  <div style={{ height: '36px' }}></div>
                )}
                
                <p style={{ margin: '0 0 2px', fontWeight: '700', color: '#111827' }}>{hrName}</p>
                <p style={{ margin: '0 0 2px', color: '#4b5563' }}>{hrRole}</p>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '10px' }}>Authorized Signatory</p>

                {/* Overlaid Stamp & Seal */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  {company?.stamp && <img src={company.stamp} alt="Stamp" style={{ maxHeight: '38px', maxWidth: '60px', opacity: 0.8 }} />}
                  {company?.seal && <img src={company.seal} alt="Seal" style={{ maxHeight: '38px', maxWidth: '60px', opacity: 0.8 }} />}
                </div>

                <div style={{ marginTop: '8px', borderTop: '1px solid #94a3b8', width: '88%' }}></div>
              </div>

              <div style={{ width: '48%' }}>
                <p style={{ margin: '0 0 42px', color: themeColor }}><strong>Employee Acceptance</strong></p>
                <p style={{ margin: '0 0 2px' }}>Name: <strong>{employeeName}</strong></p>
                <p style={{ margin: '0 0 2px' }}>Signature: ____________________</p>
                <p style={{ margin: 0 }}>Date: ____________________</p>
                <div style={{ marginTop: '8px', borderTop: '1px solid #94a3b8', width: '88%' }}></div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default GenerateDocument;
