import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './Employee.css';

const MySalary = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/employees/my/profile');
        setProfile(res.data.data);
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return <div className="employee-page"><div className="spinner" style={{ margin: 'auto' }}></div></div>;
  }

  if (!profile) {
    return <div className="employee-page glass-panel p-6 text-center text-muted">No profile found linked to this account. Contact HR.</div>;
  }

  const sd = profile.salaryDetails || { base: profile.salary || 0, bonus: 0, deductions: 0 };
  const netPay = sd.base + sd.bonus - sd.deductions;

  return (
    <div className="animate-fade-in employee-page">
      <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="dashboard-title">My Compensation</h1>
          <p className="dashboard-subtitle">Breakdown of your current compensation package.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.5fr) 1fr', gap: '2rem' }}>
        {/* Salary Breakdown Chart / Summary */}
        <div className="glass-panel p-6" style={{ borderTop: '4px solid var(--primary)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>Salary Breakdown</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border-glass)' }}>
              <span className="text-muted">Base Salary</span>
              <span className="text-main font-medium">${sd.base.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border-glass)' }}>
              <span className="text-muted">Performance Bonuses (YTD)</span>
              <span style={{ color: 'var(--success)' }}>+${sd.bonus.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border-glass)' }}>
              <span className="text-muted">Deductions (Taxes/Benefits)</span>
              <span style={{ color: 'var(--danger)' }}>-${sd.deductions.toLocaleString()}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Net Expected Pay</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-light, #818cf8)' }}>${netPay.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Informational Panel */}
        <div className="glass-panel p-6" style={{ height: 'fit-content' }}>
           <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Payroll Information</h3>
           <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1rem' }}>
             Your salary configuration is managed jointly by our HR and Accounting departments. Base salary is assessed annually.
           </p>
           <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
             <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
               <svg style={{ color: 'var(--success)' }} width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
               Direct Deposit Active
             </li>
             <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
               <svg style={{ color: 'var(--primary)' }} width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               Payments disburse on 1st & 15th
             </li>
           </ul>

           <button className="btn btn-secondary mt-6" style={{ width: '100%' }}>
             Download Last Payslip
           </button>
        </div>

      </div>
    </div>
  );
};

export default MySalary;
