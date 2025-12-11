// src/components/AdminProfile.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
    FaUserShield, 
    FaEnvelope, 
    FaUser, 
    FaLock, 
    FaCamera, 
    FaTrash, 
    FaKey,
    FaPhone,
    FaTag,
    FaCheckCircle,
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
        return `https://ui-avatars.com/api/?name=${initials}&background=8B4513&color=fff&size=200&bold=true`;
    };

    if (loading && !admin.firstName) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Loading admin profile...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.profile}>
                <div style={styles.header}>
                    <div style={styles.headerContent}>
                        <FaUserShield style={styles.headerIcon} />
                        <div>
                            <h1 style={styles.headerTitle}>Admin Profile</h1>
                            <p style={styles.headerSubtitle}>Manage your administrator account</p>
                        </div>
                    </div>
                </div>

                {message && (
                    <div style={{...styles.alert, ...styles.alertSuccess}}>
                        <FaCheckCircle style={styles.alertIcon} />
                        {message}
                    </div>
                )}
                {error && (
                    <div style={{...styles.alert, ...styles.alertError}}>
                        <FaExclamationTriangle style={styles.alertIcon} />
                        {error}
                    </div>
                )}

                <div style={styles.content}>
                    <div style={styles.pictureSection}>
                        <div style={styles.pictureContainer}>
                            <div style={styles.pictureWrapper}>
                                <img 
                                    src={getProfilePicture()} 
                                    alt="Profile" 
                                    style={styles.picture}
                                />
                                <div style={styles.pictureOverlay}>
                                    <button 
                                        style={styles.changeBtn}
                                        onClick={handleProfilePictureClick}
                                        disabled={uploading}
                                    >
                                        {uploading ? (
                                            <span style={styles.uploadingText}>
                                                <div style={styles.miniSpinner}></div>
                                                Uploading...
                                            </span>
                                        ) : (
                                            <>
                                                <FaCamera style={styles.btnIcon} />
                                                Change Photo
                                            </>
                                        )}
                                    </button>
                                    {admin.profilePicture && (
                                        <button 
                                            style={styles.removeBtn}
                                            onClick={handleRemoveProfilePicture}
                                            disabled={uploading}
                                        >
                                            <FaTrash style={styles.btnIcon} />
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
                            <div style={styles.uploadHelp}>
                                <p>Max size: 2MB</p>
                                <p>JPG, PNG, GIF</p>
                            </div>
                        </div>
                        <div style={styles.infoSummary}>
                            <h2 style={styles.userName}>{admin.firstName} {admin.lastName}</h2>
                            <p style={styles.adminLabel}>Administrator</p>
                            <div style={styles.infoRow}>
                                <FaEnvelope style={styles.infoIcon} />
                                <span>{admin.email}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <FaTag style={styles.infoIcon} />
                                <span>@{admin.username}</span>
                            </div>
                            {admin.phoneNumber && (
                                <div style={styles.infoRow}>
                                    <FaPhone style={styles.infoIcon} />
                                    <span>{admin.phoneNumber}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={styles.passwordSection}>
                        <h3 style={styles.sectionTitle}>
                            <FaLock style={styles.sectionIcon} />
                            Change Password
                        </h3>
                        <form onSubmit={handlePasswordUpdate}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Current Password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Enter current password"
                                    required
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Enter new password"
                                    required
                                    minLength="6"
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Confirm new password"
                                    required
                                    minLength="6"
                                    style={styles.input}
                                />
                            </div>

                            <button 
                                type="submit"
                                style={styles.btnPrimary}
                                disabled={loading}
                            >
                                <FaKey style={styles.btnIcon} />
                                {loading ? 'Changing Password...' : 'Change Password'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        background: '#3f1e00',
        padding: '90px 20px 20px 20px',
    },
    profile: {
        maxWidth: '1200px',
        margin: '0 auto',
        background: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(44, 26, 10, 0.15)',
        overflow: 'hidden',
    },
    header: {
        background: 'linear-gradient(135deg, #2c1a0a 0%, #4a2c1a 100%)',
        color: 'white',
        padding: '40px',
        borderBottom: '3px solid #ffffff',
    },
    headerContent: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
    },
    headerIcon: {
        fontSize: '3.5rem',
        color: '#ffd700',
        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
    },
    headerTitle: {
        fontSize: '2.5rem',
        margin: '0 0 8px 0',
        fontWeight: '700',
        color: '#ffffff',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
    },
    headerSubtitle: {
        fontSize: '1.1rem',
        opacity: 0.9,
        margin: 0,
        color: '#e8d5b5',
    },
    alert: {
        padding: '16px 24px',
        margin: '20px 40px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontWeight: '500',
    },
    alertSuccess: {
        background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
        color: '#155724',
        borderLeft: '4px solid #28a745',
    },
    alertError: {
        background: 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
        color: '#721c24',
        borderLeft: '4px solid #dc3545',
    },
    alertIcon: {
        fontSize: '1.3rem',
    },
    content: {
        padding: '40px',
    },
    pictureSection: {
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gap: '50px',
        marginBottom: '40px',
        alignItems: 'start',
        padding: '30px',
        background: 'linear-gradient(135deg, #a0522d 0%, #8B4513 100%)',
        borderRadius: '16px',
        border: '2px solid #ffffff',
    },
    pictureContainer: {
        textAlign: 'center',
    },
    pictureWrapper: {
        position: 'relative',
        width: '180px',
        height: '180px',
        margin: '0 auto 20px',
        borderRadius: '50%',
        overflow: 'hidden',
        border: '5px solid #2c1a0a',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
    },
    picture: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    pictureOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(44, 26, 10, 0.9) 0%, rgba(74, 44, 26, 0.9) 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        opacity: 0,
        transition: 'all 0.3s ease',
    },
    changeBtn: {
        background: 'linear-gradient(135deg, #8B4513, #a0522d)',
        border: 'none',
        padding: '10px 16px',
        borderRadius: '8px',
        fontSize: '0.85rem',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s ease',
        color: 'white',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    },
    removeBtn: {
        background: 'linear-gradient(135deg, #dc3545, #c82333)',
        border: 'none',
        padding: '10px 16px',
        borderRadius: '8px',
        fontSize: '0.85rem',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s ease',
        color: 'white',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    },
    uploadingText: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: 'white',
    },
    miniSpinner: {
        width: '14px',
        height: '14px',
        border: '2px solid transparent',
        borderTop: '2px solid white',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    uploadHelp: {
        marginTop: '15px',
        color: '#f5deb3',
        fontSize: '0.85rem',
    },
    infoSummary: {
        padding: '20px 0',
    },
    userName: {
        fontSize: '2.2rem',
        color: '#fff',
        margin: '0 0 15px 0',
        fontWeight: '700',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
    },
    adminLabel: {
        fontSize: '1.3rem',
        color: '#ffd700',
        fontWeight: '600',
        margin: '0 0 20px 0',
        textTransform: 'uppercase',
        letterSpacing: '1px',
    },
    infoRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        margin: '12px 0',
        color: '#f5deb3',
        fontSize: '1.05rem',
    },
    infoIcon: {
        fontSize: '1.1rem',
        color: '#ffffff',
    },
    passwordSection: {
        background: '#ffffff',
        padding: '30px',
        borderRadius: '16px',
        border: '2px solid #4a2c1a',
    },
    sectionTitle: {
        fontSize: '1.8rem',
        color: '#4a2c1a',
        margin: '0 0 25px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontWeight: '700',
    },
    sectionIcon: {
        fontSize: '1.6rem',
    },
    formGroup: {
        marginBottom: '25px',
    },
    label: {
        display: 'block',
        marginBottom: '10px',
        fontWeight: '600',
        color: '#fff',
        fontSize: '0.95rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    input: {
        width: '100%',
        padding: '14px 18px',
        border: '2px solid #8B4513',
        borderRadius: '10px',
        fontSize: '1rem',
        transition: 'all 0.3s ease',
        background: '#ffffff',
        boxSizing: 'border-box',
        color: '#2c1a0a',
    },
    btnPrimary: {
        background: 'linear-gradient(135deg, #2c1a0a, #4a2c1a)',
        color: '#ffd700',
        border: 'none',
        padding: '14px 32px',
        borderRadius: '10px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
        marginTop: '10px',
    },
    btnIcon: {
        fontSize: '0.9rem',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh',
        color: '#666',
    },
    spinner: {
        width: '60px',
        height: '60px',
        border: '5px solid #f3f3f3',
        borderTop: '5px solid #8B4513',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '20px',
    },
};

export default AdminProfile;