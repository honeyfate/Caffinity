import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';
import caffinityLogo from '../../caffinity-logo.png';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (form.email && form.password) {
      alert('Login successful!');
      navigate('/dashboard');
    } else {
      alert('Please fill in all fields');
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
      <div className="auth-form-wrapper">
        <form className="auth-form" onSubmit={handleLogin}>
          {/* Back button */}
          <button 
            type="button" 
            className="back-button" 
            onClick={handleBackToHome}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>

          {/* Logo section inside the form */}
          <div className="logo-section">
            <img src={caffinityLogo} alt="Caffinity Logo" className="logo-icon" />
            <h1 className="app-title">CAFFINITY</h1>
            <p className="app-slogan">Welcome back to our coffee community</p>
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
              type="password" 
              name="password"
              placeholder="Password" 
              value={form.password} 
              onChange={handleChange} 
              required
            />
          </div>
          
          <button type="submit" className="login-button">
            Sign In
          </button>
          
          <p className="register-text">
            Don't have an account?{' '}
            <span className="create-account-link" onClick={handleCreateAccount}>
              Create Account
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;