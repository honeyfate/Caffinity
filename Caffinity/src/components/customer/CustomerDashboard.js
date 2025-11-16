import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../css/CustomerDashboard.css';
import logo from '../../images/caffinity-logo.png';
import { FaUserCircle, FaShoppingCart } from 'react-icons/fa';
import '../css/CustomerDashboard.css';

const CustomerDashboard = () => {
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();
  const navigate = useNavigate();

  // Update active section based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/customer/coffee')) setActiveSection('coffee');
    else if (path.includes('/customer/desserts')) setActiveSection('desserts');
    else if (path.includes('/customer/cart')) setActiveSection('cart');
    else if (path.includes('/customer/profile')) setActiveSection('profile');
    else setActiveSection('home');
  }, [location.pathname]);

  const handleLogoClick = () => {
    if (location.pathname !== '/customer') {
      navigate('/customer');
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const handleNavClick = (section) => {
    setActiveSection(section);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    navigate('/');
  };

  return (
    <header className="customer-dashboard">
      <div className="customer-logo-container" onClick={handleLogoClick} style={{cursor: 'pointer'}}>
        <img src={logo} alt="Caffinity Logo" className="customer-logo" />
        <span className="customer-brand-name">CAFFINITY</span>
      </div>
      
      <nav className="customer-navigation">
        <Link 
          to="/customer"
          className={activeSection === 'home' ? 'customer-active' : ''}
          onClick={() => handleNavClick('home')}
        >
          Home
        </Link>
        <Link 
          to="/customer/coffee"
          className={activeSection === 'coffee' ? 'customer-active' : ''}
          onClick={() => handleNavClick('coffee')}
        >
          Coffee
        </Link>
        <Link 
          to="/customer/desserts"
          className={activeSection === 'desserts' ? 'customer-active' : ''}
          onClick={() => handleNavClick('desserts')}
        >
          Desserts
        </Link>
        <Link 
          to="/customer/cart"
          className={activeSection === 'cart' ? 'customer-active' : ''}
          onClick={() => handleNavClick('cart')}
        >
          <FaShoppingCart className="cart-icon" />
          Cart
        </Link>
        <Link 
          to="/customer/profile"
          className={activeSection === 'profile' ? 'customer-active' : ''}
          onClick={() => handleNavClick('profile')}
        >
          <FaUserCircle className="profile-icon" />
          Profile
        </Link>
      </nav>
      
      <div className="customer-actions">
        <button className="customer-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default CustomerDashboard;