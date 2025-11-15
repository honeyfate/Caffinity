import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/CustomerDashboard.css';
import logo from '../../images/caffinity-logo.png';
import { FaUserCircle } from 'react-icons/fa';

const CustomerDashboard = () => {
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
    }
  }, [navigate]);

  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'coffee', 'desserts', 'about', 'profile'];
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setActiveSection(targetId);
    
    const element = document.getElementById(targetId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleLogoClick = () => {
    setActiveSection('home');
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    navigate('/');
  };

  return (
    <div className="customer-dashboard-page">
      <header className="customer-dashboard">
        <div className="customer-logo-container" onClick={handleLogoClick} style={{cursor: 'pointer'}}>
          <img src={logo} alt="Caffinity Logo" className="customer-logo" />
          <span className="customer-brand-name">CAFFINITY</span>
        </div>
        
        <nav className="customer-navigation">
          <a 
            href="#home" 
            onClick={(e) => handleNavClick(e, 'home')}
            className={activeSection === 'home' ? 'customer-active' : ''}
          >
            Home
          </a>
          <a 
            href="#coffee" 
            onClick={(e) => handleNavClick(e, 'coffee')}
            className={activeSection === 'coffee' ? 'customer-active' : ''}
          >
            Coffee
          </a>
          <a 
            href="#desserts" 
            onClick={(e) => handleNavClick(e, 'desserts')}
            className={activeSection === 'desserts' ? 'customer-active' : ''}
          >
            Desserts
          </a>
          <a 
            href="#about" 
            onClick={(e) => handleNavClick(e, 'about')}
            className={activeSection === 'about' ? 'customer-active' : ''}
          >
            About
          </a>
          <a 
            href="#profile" 
            onClick={(e) => handleNavClick(e, 'profile')}
            className={activeSection === 'profile' ? 'customer-active' : ''}
          >
            <FaUserCircle className="profile-icon" />
            Profile
          </a>
          <button className="customer-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </header>

      {/* Main content area */}
      <main className="customer-main-content">
        {/* Home Section */}
        <section id="home" className="dashboard-section">
          <div className="welcome-banner">
            <h1>Welcome to Caffinity</h1>
            <p>Your favorite coffee experience</p>
          </div>
        </section>

        {/* Coffee Section */}
        <section id="coffee" className="dashboard-section">
          <h2>Our Coffees</h2>
          <div className="coffee-grid">
            {/* Coffee items will go here */}
          </div>
        </section>

        {/* Desserts Section */}
        <section id="desserts" className="dashboard-section">
          <h2>Delicious Desserts</h2>
          <div className="desserts-grid">
            {/* Dessert items will go here */}
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="dashboard-section">
          <h2>About Caffinity</h2>
          <p>Your story about the coffee shop...</p>
        </section>

        {/* Profile Section */}
        <section id="profile" className="dashboard-section">
          <h2>My Profile</h2>
          <div className="profile-content">
            {/* Profile content will go here */}
          </div>
        </section>
      </main>
    </div>
  );
};

export default CustomerDashboard;