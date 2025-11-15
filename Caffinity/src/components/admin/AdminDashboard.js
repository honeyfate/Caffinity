    import React, { useState, useEffect } from 'react';
    import { Link, useLocation, useNavigate } from 'react-router-dom';
    import '../css/AdminDashboard.css';
    import logo from '../../images/caffinity-logo.png';

    const AdminDashboard = () => {
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
        // Navigate to admin dashboard home
        if (location.pathname !== '/admin') {
        navigate('/admin');
        } else {
        // If already on admin home, scroll to top
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        }
    };

    const handleNavClick = (section) => {
        setActiveSection(section);
    };

    return (
        <header className="admin-dashboard">
        <div className="admin-logo-container" onClick={handleLogoClick} style={{cursor: 'pointer'}}>
            <img src={logo} alt="Caffinity Logo" className="admin-logo" />
            <span className="admin-brand-name">CAFFINITY</span>
            <span className="admin-badge">Admin</span>
        </div>
        
        <nav className="admin-navigation">
            <Link 
            to="/admin"
            className={activeSection === 'dashboard' ? 'admin-active' : ''}
            onClick={() => handleNavClick('dashboard')}
            >
            Dashboard
            </Link>
            <Link 
            to="/admin/coffee"
            className={activeSection === 'coffee' ? 'admin-active' : ''}
            onClick={() => handleNavClick('coffee')}
            >
            Coffee
            </Link>
            <Link 
            to="/admin/desserts"
            className={activeSection === 'desserts' ? 'admin-active' : ''}
            onClick={() => handleNavClick('desserts')}
            >
            Desserts
            </Link>
            <Link 
            to="/admin/orders"
            className={activeSection === 'orders' ? 'admin-active' : ''}
            onClick={() => handleNavClick('orders')}
            >
            Orders
            </Link>
            <Link 
            to="/admin/profile"
            className={activeSection === 'profile' ? 'admin-active' : ''}
            onClick={() => handleNavClick('profile')}
            >
            Profile
            </Link>
        </nav>
        
        <div className="admin-actions">
            <button className="admin-logout-btn">
            Logout
            </button>
        </div>
        </header>
    );
    };

    export default AdminDashboard;