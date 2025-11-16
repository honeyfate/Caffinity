import React, { useState } from 'react';
import '../css/CustomerProfile.css';

const CustomerProfile = () => {
  const [user, setUser] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+63 912 345 6789',
    address: '123 Coffee Street, Manila, Philippines'
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to backend
    alert('Profile updated successfully!');
  };

  return (
    <div className="customer-profile">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your account information and preferences</p>
      </div>

      <div className="profile-content">
        <div className="content-card">
          <div className="card-header">
            <div className="card-icon">👤</div>
            <h3 className="card-title">Personal Information</h3>
            <button 
              className="card-btn secondary"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
          <div className="card-content">
            <div className="profile-field">
              <label>First Name</label>
              {isEditing ? (
                <input 
                  type="text" 
                  value={user.firstName}
                  onChange={(e) => setUser({...user, firstName: e.target.value})}
                />
              ) : (
                <p>{user.firstName}</p>
              )}
            </div>
            <div className="profile-field">
              <label>Last Name</label>
              {isEditing ? (
                <input 
                  type="text" 
                  value={user.lastName}
                  onChange={(e) => setUser({...user, lastName: e.target.value})}
                />
              ) : (
                <p>{user.lastName}</p>
              )}
            </div>
            <div className="profile-field">
              <label>Email</label>
              {isEditing ? (
                <input 
                  type="email" 
                  value={user.email}
                  onChange={(e) => setUser({...user, email: e.target.value})}
                />
              ) : (
                <p>{user.email}</p>
              )}
            </div>
            <div className="profile-field">
              <label>Phone</label>
              {isEditing ? (
                <input 
                  type="tel" 
                  value={user.phone}
                  onChange={(e) => setUser({...user, phone: e.target.value})}
                />
              ) : (
                <p>{user.phone}</p>
              )}
            </div>
            <div className="profile-field">
              <label>Address</label>
              {isEditing ? (
                <textarea 
                  value={user.address}
                  onChange={(e) => setUser({...user, address: e.target.value})}
                />
              ) : (
                <p>{user.address}</p>
              )}
            </div>
          </div>
          {isEditing && (
            <div className="card-actions">
              <button className="card-btn" onClick={handleSave}>
                Save Changes
              </button>
            </div>
          )}
        </div>

        <div className="content-card">
          <div className="card-header">
            <div className="card-icon">📊</div>
            <h3 className="card-title">Account Statistics</h3>
          </div>
          <div className="card-content">
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">12</div>
                <div className="stat-label">Total Orders</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">5</div>
                <div className="stat-label">Favorite Items</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">45</div>
                <div className="stat-label">Days as Member</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">450</div>
                <div className="stat-label">Loyalty Points</div>
              </div>
            </div>
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <div className="card-icon">⚙️</div>
            <h3 className="card-title">Account Settings</h3>
          </div>
          <div className="card-content">
            <p>Manage your account preferences and settings</p>
          </div>
          <div className="card-actions">
            <button className="card-btn secondary">Change Password</button>
            <button className="card-btn secondary">Privacy Settings</button>
            <button className="card-btn secondary">Notification Preferences</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;