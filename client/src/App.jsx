import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { APP_NAME } from './utils/branding';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminLayout from './pages/admin/AdminLayout';
import EmployeeLayout from './pages/employee/EmployeeLayout';

const App = () => {
  useEffect(() => {
    document.title = APP_NAME;
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Admin Routes - placeholder */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          } 
        />
        
        {/* Employee Routes - placeholder */}
        <Route 
          path="/employee/*" 
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <EmployeeLayout />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;
