import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import cafeHomeBg from '../../images/cafe-home-bg.jpeg';
import '../css/CustomerHome.css';

const CustomerHome = () => {
  const navigate = useNavigate();

  // Sample data for demonstration
  const userStats = {
    totalOrders: 12,
    favoriteItems: 5,
    loyaltyPoints: 450,
    daysAsMember: 45
  };

  const recentOrders = [
    { id: 1, item: 'Cappuccino', price: '₱125.00', date: '2024-01-15', status: 'Completed' },
    { id: 2, item: 'Tiramisu', price: '₱180.00', date: '2024-01-14', status: 'Completed' },
    { id: 3, item: 'Latte', price: '₱130.00', date: '2024-01-13', status: 'Completed' }
  ];

  const featuredItems = [
    { id: 1, name: 'Seasonal Special', description: 'Winter Spice Latte', price: '₱160.00', type: 'coffee' },
    { id: 2, name: 'New Arrival', description: 'Red Velvet Cake', price: '₱195.00', type: 'dessert' },
    { id: 3, name: 'Customer Favorite', description: 'Caramel Macchiato', price: '₱170.00', type: 'coffee' }
  ];

  const handleExploreCoffee = () => {
    navigate('/customer/coffee');
  };

  const handleViewDesserts = () => {
    navigate('/customer/desserts');
  };

  return (
    <div className="customer-home">
      {/* HERO SECTION - EXACT COPY FROM LANDING PAGE */}
      <section
        id="home"
        className="section home-section"
        style={{ 
          backgroundImage: `url(${cafeHomeBg})`,
            backgroundSize: 'cover',
            marginTop: '-60px',
            marginLeft: '-60px',
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
              onClick={handleExploreCoffee}
            >
              Explore our coffee
            </button>
            <button 
              className="button desserts-button"
              onClick={handleViewDesserts}
            >
              View desserts
            </button>
          </div>
        </div>
      </section>

      {/* REST OF YOUR DASHBOARD CODE */}
      <div className="dashboard-container">
        <div className="welcome-section">
          <h1>Welcome to Caffinity</h1>
          <p>Your favorite coffee experience awaits! Discover our premium selection of coffees and desserts.</p>
        </div>

        {/* Statistics Cards */}
        <div className="cards-grid">
          {/* Total Orders Card */}
          <div className="content-card">
            <div className="card-header">
              <div className="card-icon">📦</div>
              <h3 className="card-title">Total Orders</h3>
            </div>
            <div className="card-content">
              <p>Your completed orders with us</p>
            </div>
            <div className="card-stats">
              <div>
                <div className="stat-value">{userStats.totalOrders}</div>
                <div className="stat-label">Orders</div>
              </div>
              <span className="status-badge status-active">Regular</span>
            </div>
          </div>

          {/* Favorite Items Card */}
          <div className="content-card">
            <div className="card-header">
              <div className="card-icon">❤️</div>
              <h3 className="card-title">Favorite Items</h3>
            </div>
            <div className="card-content">
              <p>Items you've marked as favorites</p>
            </div>
            <div className="card-stats">
              <div>
                <div className="stat-value">{userStats.favoriteItems}</div>
                <div className="stat-label">Favorites</div>
              </div>
              <div className="card-actions">
                <Link to="/customer/coffee" className="card-btn">View All</Link>
              </div>
            </div>
          </div>

          {/* Loyalty Points Card */}
          <div className="content-card">
            <div className="card-header">
              <div className="card-icon">⭐</div>
              <h3 className="card-title">Loyalty Points</h3>
            </div>
            <div className="card-content">
              <p>Points available for rewards</p>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(userStats.loyaltyPoints / 500) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="card-stats">
              <div>
                <div className="stat-value">{userStats.loyaltyPoints}</div>
                <div className="stat-label">Points</div>
              </div>
              <span className="status-badge status-pending">100 to next reward</span>
            </div>
          </div>

          {/* Member Duration Card */}
          <div className="content-card">
            <div className="card-header">
              <div className="card-icon">📅</div>
              <h3 className="card-title">Member For</h3>
            </div>
            <div className="card-content">
              <p>Days since you joined Caffinity</p>
            </div>
            <div className="card-stats">
              <div>
                <div className="stat-value">{userStats.daysAsMember}</div>
                <div className="stat-label">Days</div>
              </div>
              <span className="status-badge status-active">Loyal Member</span>
            </div>
          </div>

          {/* Recent Orders Card */}
          <div className="content-card">
            <div className="card-header">
              <div className="card-icon">📋</div>
              <h3 className="card-title">Recent Orders</h3>
            </div>
            <div className="card-content">
              {recentOrders.map(order => (
                <div key={order.id} className="order-item">
                  <div className="order-info">
                    <div className="order-name">{order.item}</div>
                    <div className="order-date">{order.date}</div>
                  </div>
                  <div className="order-details">
                    <div className="order-price">{order.price}</div>
                    <span className={`status-badge ${order.status === 'Completed' ? 'status-active' : 'status-pending'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="card-actions">
              <button className="card-btn secondary">View All Orders</button>
            </div>
          </div>

          {/* Featured Items Card */}
          <div className="content-card">
            <div className="card-header">
              <div className="card-icon">🔥</div>
              <h3 className="card-title">Featured Items</h3>
            </div>
            <div className="card-content">
              {featuredItems.map(item => (
                <div key={item.id} className="featured-item">
                  <div className="featured-info">
                    <div className="featured-name">{item.name}</div>
                    <div className="featured-description">{item.description}</div>
                  </div>
                  <div className="featured-price">{item.price}</div>
                </div>
              ))}
            </div>
            <div className="card-actions">
              <Link to={`/customer/${featuredItems[0].type}`} className="card-btn">
                Order Now
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="content-card" style={{ marginTop: '30px' }}>
          <div className="card-header">
            <div className="card-icon">⚡</div>
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div className="card-content">
            <p>Quick access to popular sections</p>
          </div>
          <div className="card-actions">
            <Link to="/customer/coffee" className="card-btn">Browse Coffee</Link>
            <Link to="/customer/desserts" className="card-btn secondary">View Desserts</Link>
            <Link to="/customer/cart" className="card-btn secondary">Check Cart</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerHome;