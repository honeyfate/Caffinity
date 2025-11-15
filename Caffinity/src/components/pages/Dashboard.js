import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Add useNavigate
import '../css/Dashboard.css';
import logo from '../../images/caffinity-logo.png';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();
  const navigate = useNavigate(); // Add this hook

  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'coffee-showcase', 'dessert-showcase', 'about-us', 'features-section', 'cta-section'];
      
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
    // Set initial active section
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setActiveSection(targetId);
    
    const element = document.getElementById(targetId);
    if (element) {
      const offset = 80; // Height of fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleLogoClick = () => {
    // If we're not on the home page, navigate to home
    if (location.pathname !== '/') {
      navigate('/');
    } else {
      // If already on home page, scroll to top
      setActiveSection('home');
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header className="dashboard">
      <div className="logo-container" onClick={handleLogoClick} style={{cursor: 'pointer'}}>
        <img src={logo} alt="Caffinity Logo" className="logo" />
        <span className="brand-name">CAFFINITY</span>
      </div>
      
      <nav className="navigation">
        <Link 
          to="/"
          className={activeSection === 'home' ? 'active' : ''}
        >
          Home
        </Link>
        <a 
          href="#coffee-showcase" 
          onClick={(e) => handleNavClick(e, 'coffee-showcase')}
          className={activeSection === 'coffee-showcase' ? 'active' : ''}
        >
          Coffee
        </a>
        <a 
          href="#dessert-showcase" 
          onClick={(e) => handleNavClick(e, 'dessert-showcase')}
          className={activeSection === 'dessert-showcase' ? 'active' : ''}
        >
          Desserts
        </a>
        <a 
          href="#about-us" 
          onClick={(e) => handleNavClick(e, 'about-us')}
          className={activeSection === 'about-us' ? 'active' : ''}
        >
          About
        </a>
        <Link 
          to="/login" 
          className={`login-link ${location.pathname === '/login' ? 'active' : ''}`}
        >
          Login
        </Link>
      </nav>
      
      {/* Cart container removed */}
      <div className="cart-container"></div>
    </header>
  );
};

export default Dashboard;