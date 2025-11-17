// src/components/AdminProfile.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../css/AdminProfile.css';
import { 
    FaUserShield, 
    FaEnvelope, 
    FaUser, 
    FaLock, 
    FaCamera, 
    FaTrash, 
    FaSave, 
    FaKey,
    FaPhone,
    FaTag,
    FaCheck,
    FaExclamationTriangle
} from 'react-icons/fa';

const AdminProfile = () => {
    const [admin, setAdmin] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        username: '',
        profilePicture: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeSection, setActiveSection] = useState('profile');
    const fileInputRef = useRef(null);

    const adminId = localStorage.getItem('userId') || 1;

    useEffect(() => {
        fetchAdminProfile();
    }, []);

    const fetchAdminProfile = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/api/users/admin/profile/${adminId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setAdmin(response.data);
            setError('');
        } catch (error) {
            setError('Failed to fetch admin profile');
            console.error('Error fetching admin profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setAdmin(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProfilePictureClick = () => {
        fileInputRef.current?.click();
    };

    const handleProfilePictureChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file (JPEG, PNG, etc.)');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setError('Image size should be less than 2MB');
            return;
        }

        try {
            setUploading(true);
            setError('');
            setMessage('');
            
            const base64Image = await convertToBase64(file);
            
            setAdmin(prev => ({
                ...prev,
                profilePicture: base64Image
            }));
            
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/users/admin/profile/${adminId}`, {
                ...admin,
                profilePicture: base64Image
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            setMessage('Profile picture updated successfully!');
            
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Error updating profile picture:', error);
            setError('Failed to save profile picture');
            fetchAdminProfile();
        } finally {
            setUploading(false);
        }
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:8080/api/users/admin/profile/${adminId}`, {
                firstName: admin.firstName,
                lastName: admin.lastName,
                email: admin.email,
                username: admin.username,
                phoneNumber: admin.phoneNumber,
                profilePicture: admin.profilePicture
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setMessage('Profile updated successfully!');
            setAdmin(response.data);
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            setLoading(false);
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setError('New password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/users/admin/change-password/${adminId}`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            setMessage('Password changed successfully!');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveProfilePicture = async () => {
        try {
            setUploading(true);
            setError('');
            setMessage('');
            
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/users/admin/profile/${adminId}`, {
                ...admin,
                profilePicture: ''
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            setAdmin(prev => ({
                ...prev,
                profilePicture: ''
            }));
            
            setMessage('Profile picture removed successfully!');
        } catch (error) {
            console.error('Error removing profile picture:', error);
            setError('Failed to remove profile picture');
        } finally {
            setUploading(false);
        }
    };

    const getProfilePicture = () => {
        if (admin.profilePicture) {
            return admin.profilePicture;
        }
        const initials = `${admin.firstName?.[0] || 'A'}${admin.lastName?.[0] || 'D'}`;
        return `https://ui-avatars.com/api/?name=${initials}&background=8B4513&color=fff&size=150&bold=true`;
    };

    if (loading && !admin.firstName) {
        return (
            <div className="admin-profile-loading">
                <div className="loading-spinner"></div>
                <p>Loading admin profile...</p>
            </div>
        );
    }

    return (
        <div className="admin-profile-container">
            <div className="admin-profile">
                <div className="profile-header">
                    <div className="header-content">
                        <FaUserShield className="header-icon" />
                        <div className="header-text">
                            <h1>Admin Profile</h1>
                            <p>Manage your admin account settings and preferences</p>
                        </div>
                    </div>
                </div>

                {message && (
                    <div className="alert alert-success">
                        <FaCheck className="alert-icon" />
                        {message}
                    </div>
                )}
                {error && (
                    <div className="alert alert-error">
                        <FaExclamationTriangle className="alert-icon" />
                        {error}
                    </div>
                )}

                <div className="profile-content">
                    {/* Profile Picture Section */}
                    <div className="profile-picture-section">
                        <div className="profile-picture-container">
                            <div className="profile-picture-wrapper">
                                <img 
                                    src={getProfilePicture()} 
                                    alt="Profile" 
                                    className="profile-picture"
                                />
                                <div className="profile-picture-overlay">
                                    <button 
                                        className="change-photo-btn"
                                        onClick={handleProfilePictureClick}
                                        disabled={uploading}
                                    >
                                        {uploading ? (
                                            <span className="uploading-text">
                                                <div className="mini-spinner"></div>
                                                Uploading...
                                            </span>
                                        ) : (
                                            <>
                                                <FaCamera className="btn-icon" />
                                                Change Photo
                                            </>
                                        )}
                                    </button>
                                    {admin.profilePicture && (
                                        <button 
                                            className="remove-photo-btn"
                                            onClick={handleRemoveProfilePicture}
                                            disabled={uploading}
                                        >
                                            <FaTrash className="btn-icon" />
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleProfilePictureChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                            <div className="upload-help">
                                <p><FaCamera /> Click to upload a new profile picture</p>
                                <p><FaSave /> Max size: 2MB • JPG, PNG, GIF</p>
                            </div>
                        </div>
                        <div className="profile-info-summary">
                            <h2>
                                <FaUser className="summary-icon" />
                                {admin.firstName} {admin.lastName}
                            </h2>
                            <p className="admin-role">
                                <FaUserShield className="summary-icon" />
                                Administrator
                            </p>
                            <p className="admin-email">
                                <FaEnvelope className="summary-icon" />
                                {admin.email}
                            </p>
                            <p className="admin-username">
                                <FaTag className="summary-icon" />
                                @{admin.username}
                            </p>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="profile-navigation">
                        <button 
                            className={`nav-tab ${activeSection === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveSection('profile')}
                        >
                            <FaUser className="nav-icon" />
                            Profile Information
                        </button>
                        <button 
                            className={`nav-tab ${activeSection === 'password' ? 'active' : ''}`}
                            onClick={() => setActiveSection('password')}
                        >
                            <FaLock className="nav-icon" />
                            Change Password
                        </button>
                    </div>

                    <div className="profile-sections-container">
                        {activeSection === 'profile' && (
                            <div className="profile-section">
                                <h2>
                                    <FaUser className="section-icon" />
                                    Profile Information
                                </h2>
                                <form onSubmit={handleProfileUpdate} className="profile-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="firstName">
                                                <FaUser className="label-icon" />
                                                First Name
                                            </label>
                                            <div className="input-wrapper">
                                                <FaUser className="input-icon" />
                                                <input
                                                    type="text"
                                                    id="firstName"
                                                    name="firstName"
                                                    value={admin.firstName}
                                                    onChange={handleProfileChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="lastName">
                                                <FaUser className="label-icon" />
                                                Last Name
                                            </label>
                                            <div className="input-wrapper">
                                                <FaUser className="input-icon" />
                                                <input
                                                    type="text"
                                                    id="lastName"
                                                    name="lastName"
                                                    value={admin.lastName}
                                                    onChange={handleProfileChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="username">
                                            <FaTag className="label-icon" />
                                            Username
                                        </label>
                                        <div className="input-wrapper">
                                            <FaTag className="input-icon" />
                                            <input
                                                type="text"
                                                id="username"
                                                name="username"
                                                value={admin.username}
                                                onChange={handleProfileChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="email">
                                            <FaEnvelope className="label-icon" />
                                            Email
                                        </label>
                                        <div className="input-wrapper">
                                            <FaEnvelope className="input-icon" />
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={admin.email}
                                                onChange={handleProfileChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="phoneNumber">
                                            <FaPhone className="label-icon" />
                                            Phone Number
                                        </label>
                                        <div className="input-wrapper">
                                            <FaPhone className="input-icon" />
                                            <input
                                                type="tel"
                                                id="phoneNumber"
                                                name="phoneNumber"
                                                value={admin.phoneNumber || ''}
                                                onChange={handleProfileChange}
                                                placeholder="Enter phone number"
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        className="btn-primary"
                                        disabled={loading}
                                    >
                                        <FaSave className="btn-icon" />
                                        {loading ? 'Updating...' : 'Update Profile'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeSection === 'password' && (
                            <div className="password-section">
                                <h2>
                                    <FaLock className="section-icon" />
                                    Change Password
                                </h2>
                                <form onSubmit={handlePasswordUpdate} className="password-form">
                                    <div className="form-group">
                                        <label htmlFor="currentPassword">
                                            <FaKey className="label-icon" />
                                            Current Password
                                        </label>
                                        <div className="input-wrapper">
                                            <FaKey className="input-icon" />
                                            <input
                                                type="password"
                                                id="currentPassword"
                                                name="currentPassword"
                                                value={passwordData.currentPassword}
                                                onChange={handlePasswordChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="newPassword">
                                            <FaLock className="label-icon" />
                                            New Password
                                        </label>
                                        <div className="input-wrapper">
                                            <FaLock className="input-icon" />
                                            <input
                                                type="password"
                                                id="newPassword"
                                                name="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                required
                                                minLength="6"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="confirmPassword">
                                            <FaCheck className="label-icon" />
                                            Confirm New Password
                                        </label>
                                        <div className="input-wrapper">
                                            <FaCheck className="input-icon" />
                                            <input
                                                type="password"
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={handlePasswordChange}
                                                required
                                                minLength="6"
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        className="btn-primary"
                                        disabled={loading}
                                    >
                                        <FaKey className="btn-icon" />
                                        {loading ? 'Changing Password...' : 'Change Password'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;