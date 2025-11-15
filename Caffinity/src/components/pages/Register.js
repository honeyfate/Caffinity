import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Register.css';
import axios from 'axios';

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match!');
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
      // Role is automatically set to CUSTOMER by backend
    };

    console.log('Attempting to register:', newUser);

    try {
      // First, test if the backend is reachable
      try {
        const testResponse = await axios.get('http://localhost:8080/api/users/test');
        console.log('Backend connection test:', testResponse.data);
      } catch (testError) {
        console.error('Backend connection failed:', testError);
        alert('Cannot connect to server. Please make sure the backend is running on port 8080.');
        return;
      }

      // If backend is reachable, proceed with registration
      const response = await axios.post('http://localhost:8080/api/users/register', newUser, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000 // 10 second timeout
      });
      
      console.log('Registration response:', response);
      
      if (response.status === 200 || response.status === 201) {
        alert('Registration successful!');
        navigate('/login');
      }
    } catch (error) {
      console.error('Full error object:', error);
      
      if (error.code === 'ECONNREFUSED') {
        alert('Connection refused. Please ensure the Spring Boot server is running on port 8080.');
      } else if (error.code === 'NETWORK_ERROR') {
        alert('Network error. Check your internet connection and ensure the server is running.');
      } else if (error.response) {
        // Server responded with error status
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        alert(`Registration failed: ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received:', error.request);
        alert('No response from server. The server might be down.');
      } else {
        // Something else happened
        console.error('Error message:', error.message);
        alert(`Registration failed: ${error.message}`);
      }
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="auth-container">
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