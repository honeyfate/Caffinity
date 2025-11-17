import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Register.css';
import axios from 'axios';
import Notification from '../common/Notification';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
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

  const handleRegister = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      showNotification('Passwords do not match!', 'error');
      return;
    }

    const newUser = {
      email: form.email,
      username: form.email,
      password: form.password,
      loginStatus: "OFFLINE",
      firstName: form.firstName,
      lastName: form.lastName,
      phoneNumber: form.phoneNumber,
    };

    try {
      try {
        const testResponse = await axios.get('http://localhost:8080/api/users/test');
        console.log('Backend connection test:', testResponse.data);
      } catch (testError) {
        console.error('Backend connection failed:', testError);
        showNotification('Cannot connect to server. Please make sure the backend is running on port 8080.', 'error');
        return;
      }

      const response = await axios.post('http://localhost:8080/api/users/register', newUser, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });
      
      if (response.status === 200 || response.status === 201) {
        showNotification('Registration successful! Welcome to Caffinity! ☕', 'success');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      console.error('Full error object:', error);
      
      if (error.code === 'ECONNREFUSED') {
        showNotification('Connection refused. Please ensure the Spring Boot server is running on port 8080.', 'error');
      } else if (error.code === 'NETWORK_ERROR') {
        showNotification('Network error. Check your internet connection and ensure the server is running.', 'error');
      } else if (error.response) {
        showNotification(`Registration failed: ${error.response.data?.message || error.response.statusText}`, 'error');
      } else if (error.request) {
        showNotification('No response from server. The server might be down.', 'error');
      } else {
        showNotification(`Registration failed: ${error.message}`, 'error');
      }
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
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
        <form className="auth-form" onSubmit={handleRegister}>
          {/* Back button */}
          <button 
            type="button" 
            className="back-button" 
            onClick={handleBackToLogin}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>

          {/* Logo section */}
          <div className="logo-section">
            <div className="logo-container">
              <img src={require('../../images/caffinity-logo.png')} alt="Caffinity Logo" className="logo-icon" />
            </div>
            <h1 className="app-title">CAFFINITY</h1>
            <p className="app-slogan">Join our coffee community today</p>
          </div>

          <div className="name-fields">
            <div className="form-group">
              <input 
                type="text" 
                name="firstName"
                placeholder="First Name" 
                value={form.firstName} 
                onChange={handleChange} 
                required
              />
            </div>
            <div className="form-group">
              <input 
                type="text" 
                name="lastName"
                placeholder="Last Name" 
                value={form.lastName} 
                onChange={handleChange} 
                required
              />
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
            />
          </div>
          
          <div className="form-group">
            <input 
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number" 
              value={form.phoneNumber} 
              onChange={handleChange} 
              required
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
            />
          </div>
          
          <div className="form-group">
            <input 
              type="password" 
              name="confirmPassword"
              placeholder="Confirm Password" 
              value={form.confirmPassword} 
              onChange={handleChange} 
              required
            />
          </div>
          
          <button type="submit" className="create-account-button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Create Account
          </button>
          
          <p className="login-text">
            Already have an account?{' '}
            <span className="sign-in-link" onClick={handleBackToLogin}>
              Sign in
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;