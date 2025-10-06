import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    // TODO: Replace with real registration logic
    if (form.name && form.email && form.password) {
      alert('Registration successful!');
      navigate('/login');
    } else {
      alert('Please fill in all fields');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleRegister}>
        <h2>Register</h2>
        <input 
          type="text" 
          name="name"
          placeholder="Name" 
          value={form.name} 
          onChange={handleChange} 
        />
        <input 
          type="email" 
          name="email"
          placeholder="Email" 
          value={form.email} 
          onChange={handleChange} 
        />
        <input 
          type="password" 
          name="password"
          placeholder="Password" 
          value={form.password} 
          onChange={handleChange} 
        />
        <button type="submit">Register</button>
        <p>Already have an account? <a href="/login">Login</a></p>
      </form>
    </div>
  );
};

export default Register;
