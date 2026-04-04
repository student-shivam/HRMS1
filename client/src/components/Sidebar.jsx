import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './Sidebar.css';
import { APP_NAME, APP_TAGLINE } from '../utils/branding';

const Sidebar = ({ links, isOpen, setIsOpen }) => {
  const { user } = useSelector((state) => state.auth);

  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(false)}
      ></div>
      <div className={`sidebar glass-panel ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>{APP_NAME}</h2>
          <p className="sidebar-tagline">{APP_TAGLINE}</p>
          <p className="role-badge">{user?.role || 'Guest'}</p>
        </div>
        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink 
              key={link.path} 
              to={link.path} 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end={link.exact}
              onClick={() => setIsOpen(false)}
            >
              {link.icon && (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d={link.icon}></path>
                </svg>
              )}
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
