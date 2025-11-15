import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../css/DashboardContent.css';
import logo from '../../images/caffinity-logo.png';

const DashboardContent = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const location = useLocation();
  const navigate = useNavigate();

  // Update active section based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/admin/coffee')) setActiveSection('coffee');
    else if (path.includes('/admin/desserts')) setActiveSection('desserts');
    else if (path.includes('/admin/orders')) setActiveSection('orders');
    else if (path.includes('/admin/profile')) setActiveSection('profile');
    else setActiveSection('dashboard');
  }, [location.pathname]);

  const handleLogoClick = () => {
    if (location.pathname !== '/admin') {
      navigate('/admin');
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
    // Add logout logic here
    console.log('Logging out...');
    navigate('/');
  };

  return (
    <header className="dashboard-content">
      <div className="dashboard-logo-container" onClick={handleLogoClick} style={{cursor: 'pointer'}}>
        <img src={logo} alt="Caffinity Logo" className="dashboard-logo" />
        <span className="dashboard-brand-name">CAFFINITY</span>
        <span className="dashboard-badge">Admin</span>
      </div>
      
      <nav className="dashboard-navigation">
        <Link 
          to="/admin"
          className={activeSection === 'dashboard' ? 'dashboard-active' : ''}
          onClick={() => handleNavClick('dashboard')}
        >
          Dashboard
        </Link>
        <Link 
          to="/admin/coffee"
          className={activeSection === 'coffee' ? 'dashboard-active' : ''}
          onClick={() => handleNavClick('coffee')}
        >
          Coffee
        </Link>
        <Link 
          to="/admin/desserts"
          className={activeSection === 'desserts' ? 'dashboard-active' : ''}
          onClick={() => handleNavClick('desserts')}
        >
          Desserts
        </Link>
        <Link 
          to="/admin/orders"
          className={activeSection === 'orders' ? 'dashboard-active' : ''}
          onClick={() => handleNavClick('orders')}
        >
          Orders
        </Link>
        <Link 
          to="/admin/profile"
          className={activeSection === 'profile' ? 'dashboard-active' : ''}
          onClick={() => handleNavClick('profile')}
        >
          Profile
        </Link>
      </nav>
      
      <div className="dashboard-actions">
        <button className="dashboard-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default DashboardContent;