import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../css/CustomerDashboard.css';
import logo from '../../images/caffinity-logo.png';
import { FaUserCircle, FaShoppingCart, FaCoffee, FaCookieBite, FaHome } from 'react-icons/fa';

const CustomerDashboard = () => {
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();
  const navigate = useNavigate();

  // Memoize the active section calculation
  const getActiveSection = useCallback((path) => {
    if (path.includes('/customer/coffee')) return 'coffee';
    if (path.includes('/customer/desserts')) return 'desserts';
    if (path.includes('/customer/cart')) return 'cart';
    if (path.includes('/customer/profile')) return 'profile';
    return 'home';
  }, []);

  // Update active section based on current route
  useEffect(() => {
    const newActiveSection = getActiveSection(location.pathname);
    setActiveSection(newActiveSection);
  }, [location.pathname, getActiveSection]);

  const handleLogoClick = useCallback(() => {
    if (location.pathname !== '/customer') {
      navigate('/customer');
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [location.pathname, navigate]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    navigate('/');
  }, [navigate]);

  // Memoize navigation items to prevent unnecessary re-renders
  const navItems = [
    { to: "/customer", section: "home", label: "Home", icon: <FaHome className="nav-icon" /> },
    { to: "/customer/coffee", section: "coffee", label: "Coffee", icon: <FaCoffee className="nav-icon" /> },
    { to: "/customer/desserts", section: "desserts", label: "Desserts", icon: <FaCookieBite className="nav-icon" /> },
    { to: "/customer/cart", section: "cart", label: "Cart", icon: <FaShoppingCart className="nav-icon" /> },
    { to: "/customer/profile", section: "profile", label: "Profile", icon: <FaUserCircle className="nav-icon" /> },
  ];

  return (
    <header className="customer-dashboard">
      <div className="customer-logo-container" onClick={handleLogoClick} style={{cursor: 'pointer'}}>
        <img src={logo} alt="Caffinity Logo" className="customer-logo" />
        <span className="customer-brand-name">CAFFINITY</span>
      </div>
      
      <nav className="customer-navigation">
        {navItems.map((item) => (
          <Link 
            key={item.section}
            to={item.to}
            className={activeSection === item.section ? 'customer-active' : ''}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
      
      <div className="customer-actions">
        <button className="customer-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default React.memo(CustomerDashboard);