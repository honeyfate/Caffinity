import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Register.css';

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

  const handleRegister = (e) => {
    e.preventDefault();
    if (form.firstName && form.lastName && form.email && form.phoneNumber && form.password && form.confirmPassword) {
      if (form.password !== form.confirmPassword) {
        alert('Passwords do not match!');
        return;
      }
      alert('Registration successful!');
      navigate('/login');
    } else {
      alert('Please fill in all fields');
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
              <img src={require('../../caffinity-logo.png')} alt="Caffinity Logo" className="logo-icon" />
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