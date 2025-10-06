import React from 'react';
import Dashboard from './components/Dashboard';
import CoffeeSection from './components/CoffeeSection'; // Import CoffeeSection
import './App.css';
import cafeHomeBg from './cafe-home-bg.jpeg';

const App = () => {
  return (
    <div>
      <Dashboard />
      {/* Home Section */}
      <section
        id="home"
        className="section home-section"
        style={{ backgroundImage: `url(${cafeHomeBg})` }}
      >
        <div className="home-content">
          <h1>
            WELCOME TO <span className="caffinity-highlight">CAFFINITY </span>
          </h1>
          <p>
            Where every cup tells a story. Experience the perfect blend of artisanal coffee
            and handcrafted desserts in a warm, welcoming atmosphere.
          </p>
          <div className="home-buttons">
            <a href="#coffee" className="button coffee-button">
              Explore our coffee
            </a>
            <a href="#desserts" className="button desserts-button">
              View desserts
            </a>
          </div>
        </div>
      </section>

      {/* Coffee Section */}
      <CoffeeSection /> {/* Replace the static coffee section with CoffeeSection */}

      {/* Desserts Section */}
      <section id="desserts" className="section">
        <h1>Desserts</h1>
        <p>Indulge in our delicious desserts.</p>
      </section>

      {/* About Us Section */}
      <section id="about-us" className="section">
        <h1>About Us</h1>
        <p>Learn more about Caffinity.</p>
      </section>
    </div>
  );
};

export default App;
