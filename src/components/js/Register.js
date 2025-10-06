import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Register.css';
import caffinityLogo from '../../caffinity-logo.png';

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

  return (
    <div className="auth-container">
      <div className="auth-form-wrapper">
        <form className="auth-form" onSubmit={handleRegister}>
          {/* MOVED LOGO SECTION INSIDE THE FORM */}
          <div className="logo-section">
            <img src={caffinityLogo} alt="Caffinity Logo" className="logo-icon" />
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
            Create Account
          </button>
          
          <a href="/login" className="login-link">Already have an account? Sign in</a>
        </form>
      </div>
    </div>
  );
};

export default Register;