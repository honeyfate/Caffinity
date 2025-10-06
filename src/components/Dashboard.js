import React from 'react';
import './Dashboard.css';
import logo from '../caffinity-logo.png';
import cartIcon from '../cart.png';

const Dashboard = () => {
  return (
    <header className="dashboard">
      <div className="logo-container">
        <img src={logo} alt="Caffinity Logo" className="logo" />
        <span className="brand-name">CAFFINITY</span>
      </div>
      <nav className="navigation">
        <a href="#home">Home</a>
        <a href="#coffee">Coffee</a>
        <a href="#desserts">Desserts</a>
        <a href="#about-us">About us</a>
        <a href="#login">Login</a>
      </nav>
      <div className="cart-container">
        <img src={cartIcon} alt="Cart Icon" className="cart-icon" />
      </div>
    </header>
  );
};

export default Dashboard;