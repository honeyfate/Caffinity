import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
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
    // TODO: Replace with real registration logic
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
      <div className="auth-form-wrapper"> {/* New wrapper for the form to manage background and overlay */}
        <div className="logo-section">
           <img src={caffinityLogo} alt="Caffinity Logo" className="logo-image" />
          <h1 className="app-title">CAFFINITY</h1>
          <p className="app-slogan">Join our coffee community today</p>
        </div>

        <form className="auth-form" onSubmit={handleRegister}>
          <p className="form-description">Sign up for exclusive coffee experiences</p>
          <div className="name-fields">
            <input 
              type="text" 
              name="firstName"
              placeholder="First Name" 
              value={form.firstName} 
              onChange={handleChange} 
              className="name-input"
            />
            <input 
              type="text" 
              name="lastName"
              placeholder="Last Name" 
              value={form.lastName} 
              onChange={handleChange} 
              className="name-input"
            />
          </div>
          <input 
            type="email" 
            name="email"
            placeholder="Email" 
            value={form.email} 
            onChange={handleChange} 
          />
          <input 
            type="tel" // Use type="tel" for phone numbers
            name="phoneNumber"
            placeholder="Phone Number" 
            value={form.phoneNumber} 
            onChange={handleChange} 
          />
          <input 
            type="password" 
            name="password"
            placeholder="Password" 
            value={form.password} 
            onChange={handleChange} 
          />
          <input 
            type="password" 
            name="confirmPassword"
            placeholder="Confirm Password" 
            value={form.confirmPassword} 
            onChange={handleChange} 
          />
          <button type="submit" className="create-account-button">Create Account</button>
          <p className="login-link-text">Already have an account? <a href="/login" className="login-link">Sign In Here</a></p>
        </form>
      </div>
    </div>
  );
};

export default Register;