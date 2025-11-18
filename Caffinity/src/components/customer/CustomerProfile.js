import React, { useState, useEffect, useRef } from 'react';
import { 
  FaUser, 
  FaLock, 
  FaEnvelope, 
  FaPhone, 
  FaAt, 
  FaCamera, 
  FaTrash, 
  FaSave, 
  FaKey,
  FaShoppingBag,
  FaHeart,
  FaCalendarDay,
  FaStar,
  FaUserCircle,
  FaEdit,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCog,
  FaChartBar
} from 'react-icons/fa';
import '../css/CustomerProfile.css';

const CustomerProfile = () => {
    const [user, setUser] = useState({
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

    // Get current user ID from localStorage - FIXED VERSION
    const getCurrentUserId = () => {
        try {
            // Try multiple possible storage locations and formats
            const userData = localStorage.getItem('userData');
            const currentUser = localStorage.getItem('currentUser');
            const token = localStorage.getItem('authToken');
            
            console.log('🔍 Debug - localStorage contents:');
            console.log('userData:', userData);
            console.log('currentUser:', currentUser);
            console.log('authToken:', token);

            if (userData) {
                const parsedData = JSON.parse(userData);
                console.log('📋 Parsed userData:', parsedData);
                
                // Try different ID field names and nested structures
                if (parsedData.id) return parsedData.id;
                if (parsedData.userId) return parsedData.userId;
                if (parsedData.user && parsedData.user.id) return parsedData.user.id;
                if (parsedData.customer && parsedData.customer.id) return parsedData.customer.id;
            }

            if (currentUser) {
                const parsedUser = JSON.parse(currentUser);
                console.log('📋 Parsed currentUser:', parsedUser);
                
                if (parsedUser.id) return parsedUser.id;
                if (parsedUser.userId) return parsedUser.userId;
            }

            // If we have a token but no user data, try to extract from token or use a default
            if (token) {
                console.log('🔑 Auth token found, but no user ID. You might need to decode JWT or check your login flow.');
            }

            console.warn('⚠️ No user ID found in localStorage, falling back to ID 2 (first customer)');
            return 2; // Fallback to first customer ID instead of admin (ID 1)
            
        } catch (error) {
            console.error('❌ Error getting user ID:', error);
            return 2; // Fallback to first customer ID
        }
    };

    const userId = getCurrentUserId();

    useEffect(() => {
        console.log('👤 CustomerProfile mounted, userId:', userId);
        console.log('📝 Full localStorage dump:', localStorage);
        fetchCustomerProfile();
    }, []);

    const fetchCustomerProfile = async () => {
        try {
            setLoading(true);
            console.log('🔄 Fetching customer profile for ID:', userId);
            
            // Try customer-specific endpoint first
            let response = await fetch(`http://localhost:8080/api/users/customer/profile/${userId}`);
            
            // If customer endpoint not found, try general user endpoint
            if (response.status === 404) {
                console.log('❌ Customer endpoint not found, trying general user endpoint...');
                response = await fetch(`http://localhost:8080/api/users/${userId}`);
            }
            
            if (!response.ok) {
                throw new Error(`Failed to fetch profile data: ${response.status} ${response.statusText}`);
            }

            const userData = await response.json();
            console.log('✅ Fetched customer profile:', userData);
            
            // Map the backend response to our frontend state
            setUser({
                firstName: userData.firstName || 'Customer',
                lastName: userData.lastName || 'User',
                email: userData.email || '',
                phoneNumber: userData.phoneNumber || '',
                username: userData.username || '',
                profilePicture: userData.profilePicture || ''
            });
            setError('');
        } catch (error) {
            console.error('❌ Error fetching profile:', error);
            setError('Failed to load profile data. Please check if you are logged in.');
            
            // Try to get basic info from localStorage as fallback
            await tryLocalStorageFallback();
        } finally {
            setLoading(false);
        }
    };

    const tryLocalStorageFallback = async () => {
        try {
            console.log('🔄 Trying localStorage fallback...');
            const userData = localStorage.getItem('userData');
            const currentUser = localStorage.getItem('currentUser');
            
            let userInfo = null;
            
            if (userData) {
                const parsedData = JSON.parse(userData);
                userInfo = parsedData.user || parsedData;
            } else if (currentUser) {
                userInfo = JSON.parse(currentUser);
            }
            
            if (userInfo) {
                console.log('📋 Using localStorage user info:', userInfo);
                setUser({
                    firstName: userInfo.firstName || 'Customer',
                    lastName: userInfo.lastName || 'User',
                    email: userInfo.email || '',
                    phoneNumber: userInfo.phoneNumber || '',
                    username: userInfo.username || '',
                    profilePicture: userInfo.profilePicture || ''
                });
                setError('Profile loaded from session data. Some features may be limited.');
            } else {
                setError('Please log in to view your profile.');
            }
        } catch (fallbackError) {
            console.error('❌ LocalStorage fallback failed:', fallbackError);
            setError('Unable to load profile. Please log in again.');
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({
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

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file (JPEG, PNG, etc.)');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setError('Image size should be less than 2MB');
            return;
        }

        try {
            setUploading(true);
            setError('');
            setMessage('');
            
            // Convert file to base64
            const base64Image = await convertToBase64(file);
            
            // Update local state for immediate preview
            setUser(prev => ({
                ...prev,
                profilePicture: base64Image
            }));
            
            // Update in database - try customer-specific endpoint first
            let response = await fetch(`http://localhost:8080/api/users/customer/profile/${userId}/picture`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ profilePicture: base64Image }),
            });

            // If customer endpoint fails, try general user endpoint
            if (!response.ok) {
                console.log('Customer picture endpoint failed, trying general user endpoint...');
                response = await fetch(`http://localhost:8080/api/users/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...user,
                        profilePicture: base64Image
                    }),
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update profile picture');
            }

            const result = await response.json();
            setMessage('Profile picture updated successfully!');
            
            // Update localStorage
            updateLocalStorage({ profilePicture: base64Image });
            
            // Clear file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Error updating profile picture:', error);
            setError('Failed to save profile picture');
            
            // Revert to previous profile picture on error
            fetchCustomerProfile();
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

    const updateLocalStorage = (updates) => {
        try {
            const currentUserData = localStorage.getItem('userData');
            if (currentUserData) {
                const parsedData = JSON.parse(currentUserData);
                
                // Update both top-level and nested user object if they exist
                const updatedData = { ...parsedData, ...updates };
                if (updatedData.user) {
                    updatedData.user = { ...updatedData.user, ...updates };
                }
                
                localStorage.setItem('userData', JSON.stringify(updatedData));
                console.log('💾 localStorage updated:', updatedData);
            }
        } catch (error) {
            console.error('❌ Error updating localStorage:', error);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            console.log('🔄 Updating profile for user ID:', userId);
            console.log('📝 Update data:', user);
            
            let response = await fetch(`http://localhost:8080/api/users/customer/profile/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    username: user.username,
                    phoneNumber: user.phoneNumber,
                    profilePicture: user.profilePicture
                }),
            });

            // If customer endpoint fails, try general user endpoint
            if (!response.ok) {
                console.log('❌ Customer update endpoint failed, trying general endpoint...');
                response = await fetch(`http://localhost:8080/api/users/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        username: user.username,
                        phoneNumber: user.phoneNumber,
                        profilePicture: user.profilePicture
                    }),
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update profile');
            }

            const updatedUser = await response.json();
            console.log('✅ Profile updated successfully:', updatedUser);
            
            setMessage('Profile updated successfully!');
            
            // Update localStorage with new data
            updateLocalStorage({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                profilePicture: user.profilePicture
            });
        } catch (error) {
            console.error('❌ Profile update error:', error);
            setError(error.message || 'Failed to update profile');
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
            const response = await fetch(`http://localhost:8080/api/users/customer/change-password/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to change password');
            }
            
            setMessage('Password changed successfully!');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveProfilePicture = async () => {
        try {
            setUploading(true);
            setError('');
            setMessage('');
            
            const response = await fetch(`http://localhost:8080/api/users/customer/profile/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                    ...user,
                    profilePicture: ''
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to remove profile picture');
            }
            
            setUser(prev => ({
                ...prev,
                profilePicture: ''
            }));
            
            setMessage('Profile picture removed successfully!');
            updateLocalStorage({ profilePicture: '' });
        } catch (error) {
            console.error('Error removing profile picture:', error);
            setError('Failed to remove profile picture');
        } finally {
            setUploading(false);
        }
    };

    const getProfilePicture = () => {
        if (user.profilePicture) {
            return user.profilePicture;
        }
        const initials = `${user.firstName?.[0] || 'C'}${user.lastName?.[0] || 'U'}`;
        return `https://ui-avatars.com/api/?name=${initials}&background=8B4513&color=fff&size=150&bold=true`;
    };

    // Mock data for statistics
    const stats = {
        totalOrders: 12,
        favoriteItems: 5,
        daysAsMember: 45,
        loyaltyPoints: 450
    };

    if (loading && !user.firstName) {
        return (
            <div className="customer-profile-loading">
                <div className="loading-spinner"></div>
                <p>Loading your profile...</p>
            </div>
        );
    }

    return (
        <div className="customer-profile-container">
            <div className="customer-profile">
                <div className="profile-header">
                    <div className="header-content">
                        <FaUserCircle className="header-icon" />
                        <div className="header-text">
                            <h1>My Profile</h1>
                            <p>Manage your account information and preferences</p>
                        </div>
                    </div>
                </div>

                {message && (
                    <div className="alert alert-success">
                        <FaCheckCircle className="alert-icon" />
                        {message}
                    </div>
                )}
                {error && (
                    <div className="alert alert-error">
                        <FaExclamationTriangle className="alert-icon" />
                        {error}
                    </div>
                )}

                {/* Debug info - remove in production */}
                <div style={{ 
                    background: '#f8f9fa', 
                    padding: '10px', 
                    margin: '10px 0', 
                    borderRadius: '5px',
                    fontSize: '12px',
                    border: '1px solid #e9ecef'
                }}>
                    <strong>Debug Info:</strong> User ID: {userId} | Name: {user.firstName} {user.lastName}
                </div>

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
                                    {user.profilePicture && (
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
                                <p>Click to upload a new profile picture</p>
                                <p>Max size: 2MB • JPG, PNG, GIF</p>
                            </div>
                        </div>
                        <div className="profile-info-summary">
                            <h2>
                                <FaUser className="summary-icon" />
                                {user.firstName} {user.lastName}
                            </h2>
                            <p className="customer-role">
                                <FaUser className="summary-icon" />
                                Valued Customer
                            </p>
                            <p className="customer-email">
                                <FaEnvelope className="summary-icon" />
                                {user.email}
                            </p>
                            <p className="customer-username">
                                <FaAt className="summary-icon" />
                                @{user.username}
                            </p>
                        </div>
                    </div>

                    {/* Account Statistics */}
                    <div className="stats-section">
                        <h3>
                            <FaChartBar className="section-icon" />
                            Account Statistics
                        </h3>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <div className="stat-icon">
                                    <FaShoppingBag />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-value">{stats.totalOrders}</div>
                                    <div className="stat-label">Total Orders</div>
                                </div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-icon">
                                    <FaHeart />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-value">{stats.favoriteItems}</div>
                                    <div className="stat-label">Favorite Items</div>
                                </div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-icon">
                                    <FaCalendarDay />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-value">{stats.daysAsMember}</div>
                                    <div className="stat-label">Days as Member</div>
                                </div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-icon">
                                    <FaStar />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-value">{stats.loyaltyPoints}</div>
                                    <div className="stat-label">Loyalty Points</div>
                                </div>
                            </div>
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
                        <button 
                            className={`nav-tab ${activeSection === 'settings' ? 'active' : ''}`}
                            onClick={() => setActiveSection('settings')}
                        >
                            <FaCog className="nav-icon" />
                            Account Settings
                        </button>
                    </div>

                    <div className="profile-sections-container">
                        {activeSection === 'profile' && (
                            <div className="profile-section">
                                <h2>
                                    <FaEdit className="section-icon" />
                                    Profile Information
                                </h2>
                                <form onSubmit={handleProfileUpdate} className="profile-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="firstName">
                                                First Name
                                            </label>
                                            <div className="input-wrapper">
                                                <FaUser className="input-icon" />
                                                <input
                                                    type="text"
                                                    id="firstName"
                                                    name="firstName"
                                                    value={user.firstName}
                                                    onChange={handleProfileChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="lastName">
                                                Last Name
                                            </label>
                                            <div className="input-wrapper">
                                                <FaUser className="input-icon" />
                                                <input
                                                    type="text"
                                                    id="lastName"
                                                    name="lastName"
                                                    value={user.lastName}
                                                    onChange={handleProfileChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="username">
                                            Username
                                        </label>
                                        <div className="input-wrapper">
                                            <FaAt className="input-icon" />
                                            <input
                                                type="text"
                                                id="username"
                                                name="username"
                                                value={user.username}
                                                onChange={handleProfileChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="email">
                                            Email
                                        </label>
                                        <div className="input-wrapper">
                                            <FaEnvelope className="input-icon" />
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={user.email}
                                                onChange={handleProfileChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="phoneNumber">
                                            Phone Number
                                        </label>
                                        <div className="input-wrapper">
                                            <FaPhone className="input-icon" />
                                            <input
                                                type="tel"
                                                id="phoneNumber"
                                                name="phoneNumber"
                                                value={user.phoneNumber || ''}
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
                                    <FaKey className="section-icon" />
                                    Change Password
                                </h2>
                                <form onSubmit={handlePasswordUpdate} className="password-form">
                                    <div className="form-group">
                                        <label htmlFor="currentPassword">
                                            Current Password
                                        </label>
                                        <div className="input-wrapper">
                                            <FaLock className="input-icon" />
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
                                            New Password
                                        </label>
                                        <div className="input-wrapper">
                                            <FaKey className="input-icon" />
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
                                            Confirm New Password
                                        </label>
                                        <div className="input-wrapper">
                                            <FaKey className="input-icon" />
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

                        {activeSection === 'settings' && (
                            <div className="settings-section">
                                <h2>
                                    <FaCog className="section-icon" />
                                    Account Settings
                                </h2>
                                <div className="settings-grid">
                                    <div className="setting-item">
                                        <div className="setting-content">
                                            <h4>Notification Preferences</h4>
                                            <p>Manage how you receive notifications</p>
                                        </div>
                                        <button className="btn-secondary">
                                            Configure
                                        </button>
                                    </div>
                                    <div className="setting-item">
                                        <div className="setting-content">
                                            <h4>Privacy Settings</h4>
                                            <p>Control your privacy and data</p>
                                        </div>
                                        <button className="btn-secondary">
                                            Manage
                                        </button>
                                    </div>
                                    <div className="setting-item">
                                        <div className="setting-content">
                                            <h4>Order History</h4>
                                            <p>View your past orders and receipts</p>
                                        </div>
                                        <button className="btn-secondary">
                                            View History
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerProfile;