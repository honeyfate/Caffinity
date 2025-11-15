import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';
import caffinityLogo from '../../images/caffinity-logo.png';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!form.email || !form.password) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    const loginData = {
      username: form.email, // Using email as username
      password: form.password
    };

    console.log('Attempting to login:', { username: form.email });

    try {
      // Test backend connection first
      try {
        await axios.get('http://localhost:8080/api/customers/test');
      } catch (testError) {
        console.error('Backend connection failed:', testError);
        alert('Cannot connect to server. Please make sure the backend is running on port 8080.');
        setIsLoading(false);
        return;
      }

      // Attempt login
      const response = await axios.post('http://localhost:8080/api/customers/login', loginData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });
      
      console.log('Login response:', response);
      
      if (response.status === 200) {
        const customerData = response.data.customer;
        
        // Store customer data in localStorage or context
        localStorage.setItem('customer', JSON.stringify(customerData));
        localStorage.setItem('isLoggedIn', 'true');
        
        alert('Login successful! Welcome back, ' + customerData.firstName + '!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.error || error.response.data?.message || 'Login failed';
        
        if (error.response.status === 401) {
          alert('Invalid email or password. Please try again.');
        } else {
          alert(`Login failed: ${errorMessage}`);
        }
      } else if (error.request) {
        // Request was made but no response received
        alert('No response from server. Please check if the backend is running.');
      } else {
        // Something else happened
        alert(`Login failed: ${error.message}`);
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