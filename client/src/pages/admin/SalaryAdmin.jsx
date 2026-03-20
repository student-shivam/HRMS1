import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './Admin.css';

const SalaryAdmin = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  
  const [formData, setFormData] = useState({ base: 0, bonus: 0, deductions: 0 });
  const [formStatus, setFormStatus] = useState({ type: '', text: '' });

  const fetchEmployees = async () => {
    try {
      // Intentionally passing high limit since dashboard views often don't want strict 10 pages for salary updates
      const res = await api.get('/employees?limit=100');
      setEmployees(res.data.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const openModal = (emp) => {
    setEditingEmp(emp);
    const sd = emp.salaryDetails || { base: emp.salary || 0, bonus: 0, deductions: 0 };
    setFormData({ base: sd.base, bonus: sd.bonus, deductions: sd.deductions });
    setFormStatus({ type: '', text: '' });
    setShowModal(true);
  };

  const handleUpdateSalary = async (e) => {
    e.preventDefault();
    setFormStatus({ type: 'loading', text: 'Updating...' });
    
    try {
      const updatedSalaryDetails = {
        base: Number(formData.base),
        bonus: Number(formData.bonus),
        deductions: Number(formData.deductions)
      };
      
      const newTotal = updatedSalaryDetails.base + updatedSalaryDetails.bonus - updatedSalaryDetails.deductions;
      
      await api.put(`/employees/${editingEmp._id}`, {
        salary: newTotal,
        salaryDetails: updatedSalaryDetails
      });
      
      setFormStatus({ type: 'success', text: 'Salary updated successfully!' });
      fetchEmployees();
      setTimeout(() => setShowModal(false), 1500);
    } catch (err) {
      setFormStatus({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    }
  };

  return (
    <div className="animate-fade-in admin-page">
      <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="dashboard-title">Salary Management</h1>
          <p className="dashboard-subtitle">Control base pay, allocate bonuses, and manage deductions.</p>
        </div>
      </div>

      <div className="glass-panel p-6">
        <div className="table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Base Salary</th>
                <th>Bonus</th>
                <th>Deductions</th>
                <th>Net Pay</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-6"><div className="spinner"></div></td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-6 text-muted">No employees registered.</td></tr>
              ) : (
                employees.map(emp => {
                  const sd = emp.salaryDetails || { base: emp.salary || 0, bonus: 0, deductions: 0 };
                  const netPay = sd.base + sd.bonus - sd.deductions;
                  return (
                    <tr key={emp._id}>
                      <td>
                        <div className="td-user">
                          <div className="avatar-placeholder-sm" style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}>{emp.name.charAt(0)}</div>
                          <div className="flex flex-col">
                            <span className="font-medium text-main">{emp.name}</span>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-primary">{emp.department}</span></td>
                      <td className="text-muted">${sd.base.toLocaleString()}</td>
                      <td style={{ color: 'var(--success)' }}>+${sd.bonus.toLocaleString()}</td>
                      <td style={{ color: 'var(--danger)' }}>-${sd.deductions.toLocaleString()}</td>
                      <td className="text-main font-medium">${netPay.toLocaleString()}</td>
                      <td className="text-right">
                        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => openModal(emp)}>
                          Manage Pay
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container glass-panel animate-fade-in">
            <div className="modal-header">
              <h3>Update Salary: {editingEmp?.name}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleUpdateSalary} className="modal-body">
              <div className="form-group">
                <label>Base Salary ($)</label>
                <input required type="number" min="0" value={formData.base} onChange={e => setFormData({...formData, base: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Bonus ($)</label>
                  <input required type="number" min="0" value={formData.bonus} onChange={e => setFormData({...formData, bonus: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Deductions ($)</label>
                  <input required type="number" min="0" value={formData.deductions} onChange={e => setFormData({...formData, deductions: e.target.value})} />
                </div>
              </div>

              <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: '4px solid var(--primary)', marginTop: '0.5rem' }}>
                <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.2rem' }}>Total Projected Net Pay</strong>
                <span style={{ fontSize: '1.25rem', color: 'var(--success)' }}>
                  ${(Number(formData.base) + Number(formData.bonus) - Number(formData.deductions)).toLocaleString()}
                </span>
              </div>

              {formStatus.text && (
                <div className={`status-msg ${formStatus.type}`}>
                  {formStatus.text}
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary shadow-hover" disabled={formStatus.type === 'loading'}>
                  Apply Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryAdmin;
