import React, { useEffect } from 'react';
import '../css/Notification.css';

const Notification = ({ message, type, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={`notification ${type}`}>
      <div className="notification-content">
        <div className="notification-icon">
          {type === 'success' ? '☕' : type === 'error' ? '⚠️' : 'ℹ️'}
        </div>
        <div className="notification-message">{message}</div>
        <button className="notification-close" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Notification;