import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './ApplyLeave.css';

const ApplyLeave = () => {
  const [formData, setFormData] = useState({
    leaveType: '',
    fromDate: '',
    toDate: '',
    reason: ''
  });
  const [totalDays, setTotalDays] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [errors, setErrors] = useState({});

  // Helper to get today's date in YYYY-MM-DD format for the 'min' attribute
  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Calculate days dynamically whenever dates change
  useEffect(() => {
    if (formData.fromDate && formData.toDate) {
      const start = new Date(formData.fromDate);
      const end = new Date(formData.toDate);
      
      // Calculate difference in milliseconds
      const diffTime = end.getTime() - start.getTime();
      
      // If end date is at least equal to start date
      if (diffTime >= 0) {
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 includes the start day itself
        setTotalDays(diffDays);
        
        // Clear date sequence errors
        if (errors.dateRange) {
           setErrors(prev => ({ ...prev, dateRange: null }));
        }
      } else {
        setTotalDays(0);
        setErrors(prev => ({ ...prev, dateRange: 'To Date cannot be earlier than From Date' }));
      }
    } else {
      setTotalDays(0);
    }
  }, [formData.fromDate, formData.toDate, errors.dateRange]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear validation error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 4000);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.leaveType) newErrors.leaveType = 'Please select a leave type';
    if (!formData.fromDate) newErrors.fromDate = 'From Date is required';
    if (!formData.toDate) newErrors.toDate = 'To Date is required';
    if (!formData.reason || formData.reason.trim() === '') newErrors.reason = 'Please provide a valid reason';
    if (totalDays <= 0) newErrors.dateRange = 'Invalid Date Range selected';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // We pass the required schema variables mapping directly into exactly what the backend demands
      const payload = {
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        reason: formData.reason,
        type: formData.leaveType, // Optional backend inclusion
        numberOfDays: totalDays   // Sending extra metrics natively tracked by Mongo seamlessly if bound
      };

      await api.post('/leaves', payload);
      
      showToast('Leave request submitted successfully!', 'success');
      
      // Reset Form State entirely
      setFormData({
        leaveType: '',
        fromDate: '',
        toDate: '',
        reason: ''
      });
      setTotalDays(0);

    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to submit leave request';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apply-leave-container">
      <div className="leave-card">
        
        <div className="leave-header">
          <h2>Apply for Leave</h2>
          <p>Submit your formal time-off requests electronically.</p>
          <div className="leave-balance-badge">Remaining Balance: 20 Days</div>
        </div>

        {toast.show && (
          <div className={`toast-notification ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
            {toast.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          <div className="leave-form-group full-width">
            <label>Leave Type</label>
            <select 
              name="leaveType" 
              className="leave-input" 
              value={formData.leaveType}
              onChange={handleChange}
            >
              <option value="">-- Select Option --</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Earned Leave">Earned Leave</option>
              <option value="Unpaid Leave">Unpaid Leave</option>
            </select>
            {errors.leaveType && <span className="error-text">{errors.leaveType}</span>}
          </div>

          <div className="form-grid">
            <div className="leave-form-group">
              <label>From Date</label>
              <input 
                type="date" 
                name="fromDate" 
                className="leave-input"
                min={getTodayDateString()} 
                value={formData.fromDate}
                onChange={handleChange}
              />
              {errors.fromDate && <span className="error-text">{errors.fromDate}</span>}
            </div>

            <div className="leave-form-group">
              <label>To Date</label>
              <input 
                type="date" 
                name="toDate" 
                className="leave-input"
                min={formData.fromDate || getTodayDateString()} 
                value={formData.toDate}
                onChange={handleChange}
              />
              {errors.toDate && <span className="error-text">{errors.toDate}</span>}
            </div>
          </div>

          {errors.dateRange && (
            <div className="leave-form-group full-width">
               <span className="error-text" style={{ textAlign: 'center', display: 'block' }}>{errors.dateRange}</span>
            </div>
          )}

          <div className="total-days-display">
            <span>Total Duration:</span>
            <strong>{totalDays} {totalDays === 1 ? 'Day' : 'Days'}</strong>
          </div>

          <div className="leave-form-group full-width">
            <label>Reason for Leave</label>
            <textarea 
              name="reason" 
              className="leave-input" 
              placeholder="Briefly explain the reason for your leave request..."
              value={formData.reason}
              onChange={handleChange}
            />
            {errors.reason && <span className="error-text">{errors.reason}</span>}
          </div>

          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading || totalDays === 0}
          >
            {loading && <div className="btn-spinner"></div>}
            {loading ? 'Submitting...' : 'Apply Leave'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default ApplyLeave;
