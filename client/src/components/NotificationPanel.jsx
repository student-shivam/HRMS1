import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useSocket } from '../context/SocketContext';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Utilizing the existing styles securely

const NotificationPanel = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket() || { notifications: [], unreadCount: 0 };
  const panelRef = useRef(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Ignore clicks on the bell toggle button specifically to prevent double-firing
      if (document.getElementById('notification-bell-btn')?.contains(event.target)) {
        return;
      }
      
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    onClose();
  };

  if (!isOpen) return null;

  // Render permanently attached to document body bypassing all contextual layout restrictions!
  return ReactDOM.createPortal(
    <div 
      ref={panelRef}
      className="notification-dropdown" 
      style={{
        position: 'fixed',
        top: '70px',
        right: '25px',
        zIndex: 999999, // Supreme elevation over Profile Modals and Headers
        transformOrigin: 'top right'
      }}
    >
      <div className="dropdown-header">
        <h3>Notifications</h3>
        {unreadCount > 0 && (
          <button className="mark-all-btn" onClick={markAllAsRead}>Mark all read</button>
        )}
      </div>
      <div className="dropdown-body">
        {notifications.length === 0 ? (
          <p className="no-notifications">No notifications yet.</p>
        ) : (
          notifications.slice(0, 5).map(notif => (
            <div 
              key={notif._id} 
              className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notif)}
            >
              <div className="notif-content">
                <p>{notif.message}</p>
                <span className="notif-time">
                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                </span>
              </div>
              {!notif.isRead && <div className="unread-dot"></div>}
            </div>
          ))
        )}
      </div>
      <div className="dropdown-footer">
        <Link to="/admin/notifications" onClick={onClose}>View all activity</Link>
      </div>
    </div>,
    document.body
  );
};

export default NotificationPanel;
