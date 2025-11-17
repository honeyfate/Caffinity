import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';
import caffinityLogo from '../../images/caffinity-logo.png';
import axios from 'axios';
import Notification from '../common/Notification';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'customer'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (role) => {
    setForm({ ...form, role });
  };

  const runFadeOutAnimation = () => {
    document.querySelector('.auth-container').classList.add('fade-out');
    document.querySelector('.auth-form-wrapper').classList.add('fade-out');
    document.querySelector('.logo-section').classList.add('fade-out');
    document.querySelector('.logo-icon').classList.add('fade-out');
    document.querySelector('.app-title').classList.add('fade-out');
    document.querySelector('.app-slogan').classList.add('fade-out');
    document.querySelector('.auth-form').classList.add('fade-out');
    document.querySelector('.back-button').classList.add('fade-out');
    document.querySelector('.register-text').classList.add('fade-out');
    document.querySelector('.role-selection').classList.add('fade-out');
    document.querySelector('.role-label').classList.add('fade-out');
    document.querySelector('.role-options').classList.add('fade-out');
    
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => group.classList.add('fade-out'));
    document.querySelector('.login-button').classList.add('fade-out');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!form.email || !form.password) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    setIsLoading(true);

    const loginData = {
      username: form.email,
      password: form.password
    };

    try {
      try {
        await axios.get('http://localhost:8080/api/users/test');
      } catch (testError) {
        console.error('Backend connection failed:', testError);
        showNotification('Cannot connect to server. Please make sure the backend is running on port 8080.', 'error');
        setIsLoading(false);
        return;
      }

      const response = await axios.post('http://localhost:8080/api/users/login', loginData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });
      
      if (response.status === 200) {
        const userData = response.data.user;
        
        if (form.role === 'admin' && userData.role !== 'ADMIN') {
          showNotification('You do not have admin privileges. Please select Customer role.', 'error');
          setIsLoading(false);
          return;
        }

        if (form.role === 'customer' && userData.role === 'ADMIN') {
          showNotification('You are logging in as an admin account. Please select Admin role.', 'error');
          setIsLoading(false);
          return;
        }
        
        runFadeOutAnimation();
        
        setTimeout(() => {
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('isLoggedIn', 'true');
          showNotification(`Welcome back, ${userData.firstName}!`, 'success');
          
          if (userData.role === 'ADMIN') {
            navigate('/admin');
          } else {
            navigate('/customer');
          }
        }, 500);
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.error || error.response.data?.message || 'Login failed';
        
        if (error.response.status === 401) {
          showNotification('Invalid email or password. Please try again.', 'error');
        } else {
          showNotification(`Login failed: ${errorMessage}`, 'error');
        }
      } else if (error.request) {
        showNotification('No response from server. Please check if the backend is running.', 'error');
      } else {
        showNotification(`Login failed: ${error.message}`, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleCreateAccount = () => {
    navigate('/register');
  };

  return (
    <div className="auth-container">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}
      
      <div className="auth-form-wrapper">
        <form className="auth-form" onSubmit={handleLogin}>
          {/* Back button */}
          <button 
            type="button" 
            className="back-button" 
            onClick={handleBackToHome}
            disabled={isLoading}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>

          {/* Logo section */}
          <div className="logo-section">
            <img src={caffinityLogo} alt="Caffinity Logo" className="logo-icon" />
            <h1 className="app-title">CAFFINITY</h1>
            <p className="app-slogan">Welcome back to our coffee community</p>
          </div>

          {/* Role Selection */}
          <div className="form-group role-selection">
            <label className="role-label">Login as:</label>
            <div className="role-options">
              <button
                type="button"
                className={`role-option ${form.role === 'customer' ? 'role-active' : ''}`}
                onClick={() => handleRoleChange('customer')}
                disabled={isLoading}
              >
                <div className="role-icon">👤</div>
                <span>Customer</span>
              </button>
              <button
                type="button"
                className={`role-option ${form.role === 'admin' ? 'role-active' : ''}`}
                onClick={() => handleRoleChange('admin')}
                disabled={isLoading}
              >
                <div className="role-icon">👑</div>
                <span>Admin</span>
              </button>
            </div>
          </div>

          <div className="form-group">
            <input 
              type="email" 
              name="email"
              placeholder="Email" 
              value={form.email} 
              onChange={handleChange} 
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <input 
              type="password" 
              name="password"
              placeholder="Password" 
              value={form.password} 
              onChange={handleChange} 
              required
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
          
          <p className="register-text">
            Don't have an account?{' '}
            <span 
              className="create-account-link" 
              onClick={isLoading ? undefined : handleCreateAccount}
              style={{ cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1 }}
            >
              Create Account
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;