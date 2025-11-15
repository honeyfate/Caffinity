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
    role: 'customer' // Default role
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (role) => {
    setForm({ ...form, role });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
     // Add fade-out class to all elements
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
    
    // Add fade-out to form groups
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => group.classList.add('fade-out'));
    
    // Add fade-out to login button
    document.querySelector('.login-button').classList.add('fade-out');
    
    // Wait for transition to complete before submitting
    setTimeout(() => {
        // Your login logic here
        console.log('Login submitted after fade animation');
    }, 500); // Match this with your CSS transition duration
    if (!form.email || !form.password) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    const loginData = {
      username: form.email,
      password: form.password
    };

    console.log('Attempting to login:', { username: form.email, role: form.role });

    try {
      // Test backend connection first
      try {
        await axios.get('http://localhost:8080/api/users/test');
      } catch (testError) {
        console.error('Backend connection failed:', testError);
        alert('Cannot connect to server. Please make sure the backend is running on port 8080.');
        setIsLoading(false);
        return;
      }

      // Attempt login
      const response = await axios.post('http://localhost:8080/api/users/login', loginData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });
      
      console.log('Login response:', response);
      
      if (response.status === 200) {
        const userData = response.data.user;
        
        // Check if the selected role matches the user's actual role
        if (form.role === 'admin' && userData.role !== 'ADMIN') {
          alert('You do not have admin privileges. Please select Customer role.');
          setIsLoading(false);
          return;
        }

        if (form.role === 'customer' && userData.role === 'ADMIN') {
          alert('You are logging in as an admin account. Please select Admin role.');
          setIsLoading(false);
          return;
        }
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        
        alert('Login successful! Welcome back, ' + userData.firstName + '!');
        
        // Redirect based on role
        if (userData.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/customer');
        }
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