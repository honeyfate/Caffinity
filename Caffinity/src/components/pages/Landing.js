import React from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import Dashboard from './Dashboard';
import cafeHomeBg from '../../images/cafe-home-bg.jpeg';
import '../css/Landing.css';

// Coffee images
import cappuccinoImg from '../../images/cappuccino.jpeg';
import espressoImg from '../../images/espresso.jpeg';
import caramelMacchiatoImg from '../../images/caramel-macchiato.jpeg';
import latteImg from '../../images/latte.jpeg';
import mochaImg from '../../images/mocha.jpeg';
import coldBrewImg from '../../images/cold-brew.jpeg';
import americanoImg from '../../images/americano.jpg';
import flatWhiteImg from '../../images/flat-white.jpg';

// Dessert images
import tiramisuImg from '../../images/tiramisu.jpeg';
import cheesecakeImg from '../../images/cheesecake.jpeg';
import chocolateCakeImg from '../../images/chocolate-cake.jpeg';
import croissantImg from '../../images/croissant.jpeg';
import macaronsImg from '../../images/macarons.jpeg';
import brownieImg from '../../images/brownie.jpeg';
import cremeBruleeImg from '../../images/creme-brulee.jpg';
import redVelvetImg from '../../images/red-velvet.jpg';

// About us image
import coffeeShopImg from '../../images/coffee-shop.jpeg';

const coffeeItems = [
  { id: 1, name: 'Cappuccino', description: 'Rich espresso with steamed milk foam and a touch of cinnamon', price: '₱125.00', image: cappuccinoImg, type: 'Hot Coffee' },
  { id: 2, name: 'Espresso', description: 'Pure Italian espresso shot with perfect crema', price: '₱90.00', image: espressoImg, type: 'Hot Coffee' },
  { id: 3, name: 'Iced Caramel Macchiato', description: 'Espresso with vanilla-flavored syrup, milk, and caramel drizzle over ice', price: '₱170.00', image: caramelMacchiatoImg, type: 'Iced Coffee' },
  { id: 4, name: 'Latte', description: 'Smooth espresso with steamed milk and a light foam layer', price: '₱130.00', image: latteImg, type: 'Hot Coffee' },
  { id: 5, name: 'Mocha', description: 'Chocolate-flavored espresso drink topped with whipped cream', price: '₱150.00', image: mochaImg, type: 'Hot Coffee' },
  { id: 6, name: 'Cold Brew', description: 'Slow-steeped coffee served chilled for a bold and smooth flavor', price: '₱160.00', image: coldBrewImg, type: 'Iced Coffee' },
  { id: 7, name: 'Americano', description: 'Rich espresso shots topped with hot water for a smooth, bold flavor', price: '₱110.00', image: americanoImg, type: 'Hot Coffee' },
  { id: 8, name: 'Flat White', description: 'Velvety smooth coffee with microfoam and double ristretto shots', price: '₱140.00', image: flatWhiteImg, type: 'Hot Coffee' }
];

const dessertItems = [
  { id: 1, name: 'Classic Tiramisu', description: 'Layers of coffee-soaked ladyfingers and mascarpone cream', price: '₱180.00', image: tiramisuImg, type: 'Italian Dessert' },
  { id: 2, name: 'New York Cheesecake', description: 'Creamy cheesecake with graham cracker crust and berry compote', price: '₱160.00', image: cheesecakeImg, type: 'Cheesecake' },
  { id: 3, name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with molten chocolate center, served with vanilla ice cream', price: '₱190.00', image: chocolateCakeImg, type: 'Chocolate Dessert' },
  { id: 4, name: 'Butter Croissant', description: 'Flaky, buttery French croissant perfect with any coffee', price: '₱95.00', image: croissantImg, type: 'Pastry' },
  { id: 5, name: 'French Macarons', description: 'Assorted flavors of delicate almond meringue cookies', price: '₱220.00', image: macaronsImg, type: 'Cookies' },
  { id: 6, name: 'Walnut Brownie', description: 'Rich chocolate brownie with walnuts, served warm', price: '₱120.00', image: brownieImg, type: 'Brownie' },
  { id: 7, name: 'Crème Brûlée', description: 'Classic French dessert with rich custard base and caramelized sugar top', price: '₱165.00', image: cremeBruleeImg, type: 'French Dessert' },
  { id: 8, name: 'Red Velvet Cake', description: 'Moist red velvet layers with cream cheese frosting and red velvet crumbs', price: '₱175.00', image: redVelvetImg, type: 'Cake' }
];

const Landing = () => {
  const navigate = useNavigate(); // Add this hook

  // Function to handle Order Now button click
  const handleOrderNow = () => {
    navigate('/login'); // Navigate to login page
  };

  // Function to handle CTA Order Now button click
  const handleCtaOrderNow = () => {
    navigate('/login'); // Navigate to login page
  };

  return (
    <div>

      {/* Fixed Header */}
      <Dashboard />

      {/* HERO SECTION */}
      <section
        id="home"
        className="section home-section"
        style={{ 
          backgroundImage: `url(${cafeHomeBg})`,
          paddingTop: '80px'
        }}
      >
        <div className="home-content">
          <h1>
            WELCOME TO <span className="caffinity-highlight">CAFFINITY</span>
          </h1>
          <p>
            Where every cup tells a story. Experience the perfect blend of artisanal coffee
            and handcrafted desserts in a warm, welcoming atmosphere.
          </p>
          <div className="home-buttons">
            <button 
              className="button coffee-button"
              onClick={() => document.getElementById('coffee-showcase').scrollIntoView({ behavior: 'smooth' })}
            >
              Explore our coffee
            </button>
            <button 
              className="button desserts-button"
              onClick={() => document.getElementById('dessert-showcase').scrollIntoView({ behavior: 'smooth' })}
            >
              View desserts
            </button>
          </div>
        </div>
      </section>

      {/* COFFEE SHOWCASE */}
      <section id="coffee-showcase" className="coffee-showcase">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Coffee Selection</h2>
            <p className="section-subtitle">Handcrafted with passion, served with perfection</p>
            <div className="coffee-bean-divider">
              <span className="coffee-bean">☕</span>
            </div>
          </div>

          <div className="coffee-grid">
            {coffeeItems.map((item) => (
              <div key={item.id} className="coffee-card">
                <div className="card-image-container">
                  <img src={item.image} alt={item.name} className="coffee-image" />
                  <div className="coffee-type-badge">{item.type}</div>
                  <div className="image-overlay">
                    <span className="view-details">View Details</span>
                  </div>
                </div>
                <div className="card-content">
                  <h3 className="coffee-name">{item.name}</h3>
                  <p className="coffee-description">{item.description}</p>
                  <div className="card-footer">
                    <span className="coffee-price">{item.price}</span>
                    <button className="order-button" onClick={handleOrderNow}>
                      Order Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESSERT SHOWCASE */}
      <section id="dessert-showcase" className="dessert-showcase">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Sweet Delights</h2>
            <p className="section-subtitle">Indulge in our exquisite desserts made with love</p>
            <div className="coffee-bean-divider">
              <span className="coffee-bean">🍰</span>
            </div>
          </div>

          <div className="coffee-grid">
            {dessertItems.map((item) => (
              <div key={item.id} className="coffee-card">
                <div className="card-image-container">
                  <img src={item.image} alt={item.name} className="coffee-image" />
                  <div className="coffee-type-badge">{item.type}</div>
                  <div className="image-overlay">
                    <span className="view-details">View Details</span>
                  </div>
                </div>
                <div className="card-content">
                  <h3 className="coffee-name">{item.name}</h3>
                  <p className="coffee-description">{item.description}</p>
                  <div className="card-footer">
                    <span className="coffee-price">{item.price}</span>
                    <button className="order-button" onClick={handleOrderNow}>
                      Order Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section id="about-us" className="about-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Story</h2>
            <p className="section-subtitle">Brewing connections, one cup at a time</p>
            <div className="coffee-bean-divider">
              <span className="coffee-bean">📖</span>
            </div>
          </div>

          <div className="about-content">
            <div className="about-text">
              <h3>Welcome to Caffinity</h3>
              <p>
                Founded in 2020, Caffinity was born from a simple passion: to create a space where 
                exceptional coffee meets meaningful connections. Our name combines "caffeine" and 
                "affinity" - representing our love for great coffee and the relationships we build 
                around it.
              </p>
              <p>
                We believe that every cup tells a story. From the farmers who grow our beans to the 
                baristas who craft your drink, each step is filled with care and dedication. Our 
                mission is to serve not just coffee, but experiences that bring people together.
              </p>
              <div className="about-stats">
                <div className="stat">
                  <h4>5000+</h4>
                  <p>Happy Customers</p>
                </div>
                <div className="stat">
                  <h4>3</h4>
                  <p>Years of Excellence</p>
                </div>
                <div className="stat">
                  <h4>50+</h4>
                  <p>Coffee Varieties</p>
                </div>
                <div className="stat">
                  <h4>100%</h4>
                  <p>Customer Satisfaction</p>
                </div>
              </div>
            </div>
            <div className="about-image">
              <img 
                src={coffeeShopImg} 
                alt="Caffinity Coffee Shop Interior" 
                className="coffee-shop-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features-section" className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose Caffinity?</h2>
            <p className="section-subtitle">Experience the difference in every cup and bite</p>
            <div className="coffee-bean-divider">
              <span className="coffee-bean">⭐</span>
            </div>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🌱</div>
              <h3>Premium Beans</h3>
              <p>100% organic coffee beans sourced from sustainable farms around the world. We ensure ethical sourcing and the highest quality for every brew.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👨‍🍳</div>
              <h3>Expert Baristas</h3>
              <p>Our skilled craftsmen are dedicated to perfecting your coffee experience. Each barista is trained in the art of coffee making and latte art.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Fast Service</h3>
              <p>Quick preparation without compromising quality and taste. We value your time while ensuring every order meets our high standards.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏠</div>
              <h3>Cozy Atmosphere</h3>
              <p>Relax in our warm, inviting space designed for comfort and conversation. Perfect for work, meetings, or simply unwinding.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🍃</div>
              <h3>Eco-Friendly</h3>
              <p>Committed to sustainability with biodegradable packaging and eco-conscious practices that help protect our planet.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💝</div>
              <h3>Community Focused</h3>
              <p>We support local artists and host community events, creating a space that brings people together over great coffee.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section id="cta-section" className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Experience Perfect Coffee?</h2>
            <p>Join our community of coffee lovers today</p>
            <div className="cta-buttons">
              <button className="cta-primary" onClick={handleCtaOrderNow}>
                Order Now
              </button>
              <button className="cta-secondary">Visit Us Today</button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Landing;