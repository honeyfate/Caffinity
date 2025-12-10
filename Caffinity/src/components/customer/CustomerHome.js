// components/customer/CustomerHome.js (UPDATED VERSION)
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import cafeHomeBg from '../../images/cafe-home-bg.jpeg';
import '../css/CustomerHome.css';

const CustomerHome = () => {
  const navigate = useNavigate();
  const [recentOrders, setRecentOrders] = useState([]);
  const [userStats, setUserStats] = useState({
    totalOrders: 0,
    favoriteItems: 5,
    loyaltyPoints: 450,
    daysAsMember: 45
  });
  const [isLoading, setIsLoading] = useState(true);

  const featuredItems = [
    { id: 1, name: 'Seasonal Special', description: 'Winter Spice Latte', price: '₱160.00', type: 'coffee' },
    { id: 2, name: 'New Arrival', description: 'Red Velvet Cake', price: '₱195.00', type: 'dessert' },
    { id: 3, name: 'Customer Favorite', description: 'Caramel Macchiato', price: '₱170.00', type: 'coffee' }
  ];

  // Fetch user orders from API
  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        setIsLoading(true);
        // Get current user ID (you might want to get this from auth context)
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.id || 1; // Fallback to 1 for demo

        const response = await axios.get(`http://localhost:8080/api/orders/user/${userId}`);
        
        if (response.data && Array.isArray(response.data)) {
          setRecentOrders(response.data.slice(0, 3)); // Show only 3 most recent
          setUserStats(prev => ({
            ...prev,
            totalOrders: response.data.length
          }));
        }
      } catch (error) {
        console.error('Error fetching user orders:', error);
        // Fallback to empty array
        setRecentOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserOrders();
  }, []);

  const handleExploreCoffee = () => {
    navigate('/customer/coffee');
  };

  const handleViewDesserts = () => {
    navigate('/customer/desserts');
  };

  const formatOrderDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getOrderStatusBadge = (status) => {
    const statusClass = {
      'COMPLETED': 'status-active',
      'PENDING': 'status-pending',
      'CONFIRMED': 'status-active',
      'PREPARING': 'status-pending',
      'READY': 'status-active',
      'CANCELLED': 'status-cancelled'
    }[status] || 'status-pending';

    return `status-badge ${statusClass}`;
  };

  return (
    <div className="customer-home">
      {/* HERO SECTION */}
      <section
        id="home"
        className="section home-section"
        style={{ 
          backgroundImage: `url(${cafeHomeBg})`,
          backgroundSize: 'cover',
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
              {isLoading ? (
                <div className="loading">Loading orders...</div>
              ) : recentOrders.length === 0 ? (
                <div className="empty-orders">
                  <p>No orders yet</p>
                  <Link to="/customer/coffee" className="card-btn small">Start Shopping</Link>
                </div>
              ) : (
                recentOrders.map(order => (
                  <div key={order.id} className="order-item">
                    <div className="order-info">
                      <div className="order-name">Order #{order.id}</div>
                      <div className="order-date">{formatOrderDate(order.orderDate)}</div>
                    </div>
                    <div className="order-details">
                      <div className="order-price">₱{order.totalAmount?.toFixed(2)}</div>
                      <span className={getOrderStatusBadge(order.status)}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
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