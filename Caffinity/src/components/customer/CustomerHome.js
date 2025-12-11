// components/customer/CustomerHome.js (UPDATED VERSION)
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import cafeHomeBg from '../../images/cafe-home-bg.jpeg';
import '../css/CustomerHome.css';

const CustomerHome = () => {
  const navigate = useNavigate();
  const [recentOrders, setRecentOrders] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [userStats, setUserStats] = useState({
    totalOrders: 0,
    favoriteItems: 0,
    totalSpent: 0,
    daysAsMember: 0,
    averageOrderValue: 0,
    completedOrders: 0,
    activeOrders: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);

  // Get current user from localStorage
  useEffect(() => {
    const getUserFromStorage = () => {
      try {
        // Try localStorage first
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setCurrentUser(user);
          return user;
        }

        // Try sessionStorage
        const sessionUserStr = sessionStorage.getItem('user');
        if (sessionUserStr) {
          const user = JSON.parse(sessionUserStr);
          setCurrentUser(user);
          return user;
        }

        // Try to get from currentUser object
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
          const user = JSON.parse(currentUserStr);
          setCurrentUser(user);
          return user;
        }

        // If no user in storage, use demo user ID for API calls
        console.log('No user found in storage, using demo user ID');
        const demoUser = {
          id: 2, // Default user ID for API calls
          name: 'Guest',
          email: 'guest@example.com',
          createdAt: new Date().toISOString()
        };
        setCurrentUser(demoUser);
        return demoUser;
      } catch (error) {
        console.error('Error parsing user from storage:', error);
        const demoUser = {
          id: 2,
          name: 'Guest',
          email: 'guest@example.com',
          createdAt: new Date().toISOString()
        };
        setCurrentUser(demoUser);
        return demoUser;
      }
    };

    getUserFromStorage();
  }, []);

  // Format currency in Philippine Peso
  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return '₱0.00';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₱${numAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  // Calculate stats from orders
  const calculateStatsFromOrders = (orders) => {
    if (!orders || orders.length === 0) {
      return {
        totalOrders: 0,
        totalSpent: 0,
        completedOrders: 0,
        activeOrders: 0,
        averageOrderValue: 0,
        daysAsMember: currentUser?.createdAt ? 
          Math.floor((new Date() - new Date(currentUser.createdAt)) / (1000 * 60 * 60 * 24)) : 1
      };
    }

    // Calculate total spent and completed orders
    const totalSpent = orders.reduce((sum, order) => {
      return sum + (parseFloat(order.totalAmount) || 0);
    }, 0);

    const completedOrders = orders.filter(order => 
      order.status === 'COMPLETED' || order.status === 'DELIVERED'
    ).length;

    const activeOrders = orders.filter(order => 
      order.status === 'PENDING' || order.status === 'CONFIRMED' || 
      order.status === 'PROCESSING' || order.status === 'SHIPPED'
    ).length;

    const averageOrderValue = orders.length > 0 ? totalSpent / orders.length : 0;

    // Calculate days as member
    const daysAsMember = currentUser?.createdAt ? 
      Math.floor((new Date() - new Date(currentUser.createdAt)) / (1000 * 60 * 60 * 24)) : 1;

    // Estimate favorite items based on order frequency
    let itemFrequency = {};
    orders.forEach(order => {
      if (order.orderItems && Array.isArray(order.orderItems)) {
        order.orderItems.forEach(item => {
          const productId = item.product?.productId || item.productId;
          if (productId) {
            itemFrequency[productId] = (itemFrequency[productId] || 0) + (item.quantity || 1);
          }
        });
      }
    });

    const favoriteItems = Object.keys(itemFrequency).length;

    return {
      totalOrders: orders.length,
      totalSpent,
      completedOrders,
      activeOrders,
      averageOrderValue,
      daysAsMember: daysAsMember > 0 ? daysAsMember : 1,
      favoriteItems
    };
  };

  // Fetch user orders from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setIsOrdersLoading(true);

        // Get user ID (use default 2 if not found)
        const userId = currentUser?.userId || currentUser?.id || 2;
        
        console.log(`Fetching orders for user ID: ${userId}`);

        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        };

        // Fetch user orders
        const response = await axios.get(
          `http://localhost:8080/api/orders/user/${userId}`,
          { headers }
        );

        console.log('Orders response:', response.data);

        if (response.data && Array.isArray(response.data)) {
          // Save all orders for stats calculation
          setUserOrders(response.data);

          // Get recent orders (3 most recent)
          const sortedOrders = response.data
            .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
            .slice(0, 3);

          setRecentOrders(sortedOrders);

          // Calculate stats from orders
          const stats = calculateStatsFromOrders(response.data);
          setUserStats(prev => ({
            ...prev,
            ...stats
          }));
        }
      } catch (error) {
        console.error('Error fetching user orders:', error);
        
        // For demo purposes, show sample data
        const sampleOrders = [
          {
            orderId: 101,
            orderDate: new Date().toISOString(),
            totalAmount: 345.50,
            status: 'COMPLETED',
            orderItems: [
              { product: { name: 'Caramel Macchiato', price: 170 }, quantity: 1 },
              { product: { name: 'Chocolate Croissant', price: 85 }, quantity: 2 }
            ]
          },
          {
            orderId: 100,
            orderDate: new Date(Date.now() - 86400000).toISOString(),
            totalAmount: 220.00,
            status: 'COMPLETED',
            orderItems: [
              { product: { name: 'Americano', price: 120 }, quantity: 1 },
              { product: { name: 'Blueberry Muffin', price: 100 }, quantity: 1 }
            ]
          }
        ];

        setUserOrders(sampleOrders);
        setRecentOrders(sampleOrders);
        
        const stats = calculateStatsFromOrders(sampleOrders);
        setUserStats(prev => ({
          ...prev,
          ...stats,
          daysAsMember: 45
        }));
      } finally {
        setIsOrdersLoading(false);
        setIsLoading(false);
      }
    };

    if (currentUser) {
      fetchUserData();
    }
  }, [currentUser]);

  // Fetch featured items from backend
  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        setIsFeaturedLoading(true);
        
        // Try to fetch real featured items
        const response = await axios.get('http://localhost:8080/api/products/featured');
        
        if (response.data && Array.isArray(response.data)) {
          const featured = response.data.slice(0, 3).map(item => ({
            id: item.productId || item.id,
            name: getFeaturedTitle(item.category),
            description: item.name,
            price: formatCurrency(item.price),
            type: item.category?.toLowerCase() || 'coffee',
            rating: 4.5,
            image: item.imageUrl
          }));
          
          setFeaturedItems(featured);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error fetching featured items:', error);
        // Fallback to static featured items
        setFeaturedItems([
          { 
            id: 1, 
            name: 'Seasonal Special', 
            description: 'Winter Spice Latte', 
            price: formatCurrency(160), 
            type: 'coffee',
            rating: 4.5
          },
          { 
            id: 2, 
            name: 'New Arrival', 
            description: 'Red Velvet Cake', 
            price: formatCurrency(195), 
            type: 'dessert',
            rating: 4.8
          },
          { 
            id: 3, 
            name: 'Customer Favorite', 
            description: 'Caramel Macchiato', 
            price: formatCurrency(170), 
            type: 'coffee',
            rating: 4.7
          }
        ]);
      } finally {
        setIsFeaturedLoading(false);
      }
    };

    fetchFeaturedItems();
  }, []);

  const getFeaturedTitle = (category) => {
    const titles = {
      'COFFEE': ['Seasonal Special', 'Barista\'s Choice', 'Artisan Blend'],
      'DESSERT': ['New Arrival', 'Chef\'s Special', 'Sweet Indulgence'],
      'BEVERAGE': ['Refreshing Pick', 'Summer Special', 'Cool Drink']
    };
    
    const categoryTitles = titles[category] || ['Featured Item'];
    return categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
  };

  const handleExploreCoffee = () => {
    navigate('/customer/coffee');
  };

  const handleViewDesserts = () => {
    navigate('/customer/desserts');
  };

  const handleViewAllOrders = () => {
    navigate('/customer/orders');
  };

  const formatOrderDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const getOrderStatusBadge = (status) => {
    const statusMap = {
      'COMPLETED': 'status-active',
      'DELIVERED': 'status-active',
      'CONFIRMED': 'status-pending',
      'PROCESSING': 'status-pending',
      'SHIPPED': 'status-pending',
      'PENDING': 'status-pending',
      'CANCELLED': 'status-cancelled'
    };
    
    return `status-badge ${statusMap[status] || 'status-pending'}`;
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'COMPLETED': 'Completed',
      'DELIVERED': 'Delivered',
      'PENDING': 'Pending',
      'CONFIRMED': 'Confirmed',
      'PROCESSING': 'Processing',
      'SHIPPED': 'Shipped',
      'CANCELLED': 'Cancelled',
      'READY': 'Ready for Pickup'
    };
    return statusMap[status] || status;
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

      {/* DASHBOARD */}
      <div className="dashboard-container">
        <div className="welcome-section">
          <h1>Welcome{currentUser?.name ? `, ${currentUser.name.split(' ')[0]}` : ''}!</h1>
          <p>Your favorite coffee experience awaits! Discover our premium selection of coffees and desserts.</p>
        </div>

        {/* Statistics Cards - Dynamic from Orders */}
        <div className="cards-grid">
          {/* Total Orders Card */}
          <div className="content-card">
            <div className="card-header">
              <div className="card-icon">📦</div>
              <h3 className="card-title">Total Orders</h3>
            </div>
            <div className="card-content">
              <p>Your total orders with us</p>
            </div>
            <div className="card-stats">
              <div>
                <div className="stat-value">{userStats.totalOrders}</div>
                <div className="stat-label">Orders</div>
              </div>
              <span className={`status-badge ${userStats.totalOrders >= 5 ? 'status-active' : 'status-pending'}`}>
                {userStats.totalOrders >= 10 ? 'Regular Customer' : 
                 userStats.totalOrders >= 5 ? 'Frequent Buyer' : 'New Customer'}
              </span>
            </div>
          </div>

          {/* Total Spent Card */}
          <div className="content-card">
            <div className="card-header">
              <div className="card-icon">💰</div>
              <h3 className="card-title">Total Spent</h3>
            </div>
            <div className="card-content">
              <p>Total amount spent at Caffinity</p>
            </div>
            <div className="card-stats">
              <div>
                <div className="stat-value">{formatCurrency(userStats.totalSpent)}</div>
                <div className="stat-label">Amount</div>
              </div>
              <span className={`status-badge ${userStats.totalSpent > 1000 ? 'status-active' : 'status-pending'}`}>
                {userStats.totalSpent > 1000 ? 'Valued Customer' : 
                 userStats.totalSpent > 500 ? 'Growing Relationship' : 'Getting Started'}
              </span>
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
              <span className={`status-badge ${userStats.daysAsMember > 30 ? 'status-active' : 'status-pending'}`}>
                {userStats.daysAsMember > 90 ? 'Loyal Member' : 
                 userStats.daysAsMember > 30 ? 'Established Member' : 'New Member'}
              </span>
            </div>
          </div>

          {/* Average Order Value Card */}
          <div className="content-card">
            <div className="card-header">
              <div className="card-icon">📊</div>
              <h3 className="card-title">Average Order</h3>
            </div>
            <div className="card-content">
              <p>Average value per order</p>
            </div>
            <div className="card-stats">
              <div>
                <div className="stat-value">{formatCurrency(userStats.averageOrderValue)}</div>
                <div className="stat-label">Per Order</div>
              </div>
              <span className={`status-badge ${userStats.averageOrderValue > 200 ? 'status-active' : 'status-pending'}`}>
                {userStats.averageOrderValue > 300 ? 'Premium Spender' : 
                 userStats.averageOrderValue > 200 ? 'Above Average' : 'Regular Spender'}
              </span>
            </div>
          </div>

          {/* Completed Orders Card */}
          <div className="content-card">
            <div className="card-header">
              <div className="card-icon">✅</div>
              <h3 className="card-title">Completed Orders</h3>
            </div>
            <div className="card-content">
              <p>Successfully delivered orders</p>
            </div>
            <div className="card-stats">
              <div>
                <div className="stat-value">{userStats.completedOrders}</div>
                <div className="stat-label">Orders</div>
              </div>
              <span className={`status-badge status-active`}>
                {userStats.completedOrders === userStats.totalOrders ? '100% Success' : 
                 `${Math.round((userStats.completedOrders / userStats.totalOrders) * 100)}% Rate`}
              </span>
            </div>
          </div>

          {/* Active Orders Card */}
          <div className="content-card">
            <div className="card-header">
              <div className="card-icon">⏳</div>
              <h3 className="card-title">Active Orders</h3>
            </div>
            <div className="card-content">
              <p>Orders currently in progress</p>
            </div>
            <div className="card-stats">
              <div>
                <div className="stat-value">{userStats.activeOrders}</div>
                <div className="stat-label">In Progress</div>
              </div>
              <span className={`status-badge ${userStats.activeOrders > 0 ? 'status-pending' : 'status-active'}`}>
                {userStats.activeOrders > 0 ? 'Processing' : 'All Clear'}
              </span>
            </div>
          </div>

          {/* Recent Orders Card */}
          <div className="content-card">
            <div className="card-header">
              <div className="card-icon">📋</div>
              <h3 className="card-title">Recent Orders</h3>
            </div>
            <div className="card-content">
              {isOrdersLoading ? (
                <div className="loading">Loading orders...</div>
              ) : recentOrders.length === 0 ? (
                <div className="empty-orders">
                  <p>No orders yet</p>
                  <Link to="/customer/coffee" className="card-btn small">Start Shopping</Link>
                </div>
              ) : (
                recentOrders.map(order => (
                  <div key={order.orderId} className="order-item">
                    <div className="order-info">
                      <div className="order-name">Order #{order.orderId}</div>
                      <div className="order-date">{formatOrderDate(order.orderDate)}</div>
                    </div>
                    <div className="order-details">
                      <div className="order-price">{formatCurrency(order.totalAmount)}</div>
                      <span className={getOrderStatusBadge(order.status)}>
                        {getStatusDisplay(order.status)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="card-actions">
              <button 
                className="card-btn secondary"
                onClick={handleViewAllOrders}
              >
                View All Orders
              </button>
            </div>
          </div>

          {/* Featured Items Card */}
          <div className="content-card">
            <div className="card-header">
              <div className="card-icon">🔥</div>
              <h3 className="card-title">Featured Items</h3>
            </div>
            <div className="card-content">
              {isFeaturedLoading ? (
                <div className="loading">Loading featured items...</div>
              ) : featuredItems.map(item => (
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
              <Link to={`/customer/${featuredItems[0]?.type || 'coffee'}`} className="card-btn">
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
            <button 
              className="card-btn"
              onClick={handleExploreCoffee}
            >
              Browse Coffee
            </button>
            <button 
              className="card-btn secondary"
              onClick={handleViewDesserts}
            >
              View Desserts
            </button>
            <Link to="/customer/cart" className="card-btn secondary">
              Check Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerHome;