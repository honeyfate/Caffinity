import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerDashboard from './CustomerDashboard';
import '../css/CustomerOrders.css';
import { FaReceipt, FaCalendarAlt, FaCheckCircle, FaClock, FaTimesCircle, FaShoppingBag } from 'react-icons/fa';

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, completed, cancelled
  const navigate = useNavigate();

  // Mock orders data - replace with API call in real implementation
  const mockOrders = [
    {
      id: 'ORD-001',
      date: '2024-01-15',
      items: [
        { name: 'Espresso', quantity: 2, price: 3.50 },
        { name: 'Chocolate Cake', quantity: 1, price: 5.99 },
      ],
      total: 12.99,
      status: 'completed',
      deliveryTime: '30-40 mins',
      paymentMethod: 'Credit Card'
    },
    {
      id: 'ORD-002',
      date: '2024-01-16',
      items: [
        { name: 'Cappuccino', quantity: 1, price: 4.50 },
        { name: 'Latte', quantity: 1, price: 4.75 },
        { name: 'Croissant', quantity: 2, price: 3.25 },
      ],
      total: 15.75,
      status: 'pending',
      deliveryTime: '20-30 mins',
      paymentMethod: 'Cash on Delivery'
    },
    {
      id: 'ORD-003',
      date: '2024-01-14',
      items: [
        { name: 'Americano', quantity: 1, price: 3.75 },
      ],
      total: 3.75,
      status: 'cancelled',
      deliveryTime: 'N/A',
      paymentMethod: 'Credit Card'
    },
    {
      id: 'ORD-004',
      date: '2024-01-13',
      items: [
        { name: 'Mocha', quantity: 1, price: 5.25 },
        { name: 'Blueberry Muffin', quantity: 1, price: 3.50 },
      ],
      total: 8.75,
      status: 'completed',
      deliveryTime: '25-35 mins',
      paymentMethod: 'Digital Wallet'
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 500);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="status-icon completed" />;
      case 'pending':
        return <FaClock className="status-icon pending" />;
      case 'cancelled':
        return <FaTimesCircle className="status-icon cancelled" />;
      default:
        return <FaClock className="status-icon" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status-badge completed';
      case 'pending':
        return 'status-badge pending';
      case 'cancelled':
        return 'status-badge cancelled';
      default:
        return 'status-badge';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleReorder = useCallback((orderId) => {
    // Implement reorder functionality
    console.log(`Reordering order ${orderId}`);
    // Navigate to cart or coffee/desserts page with pre-filled items
    navigate('/customer/cart');
  }, [navigate]);

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  if (loading) {
    return (
      <div className="customer-orders-container">
        <CustomerDashboard />
        <div className="orders-loading">
          <div className="loading-spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-orders-container">
      <CustomerDashboard />
      
      <main className="orders-content">
        <div className="orders-header">
          <h1><FaShoppingBag /> My Orders</h1>
          <p>View and manage your past and current orders</p>
        </div>

        <div className="orders-filter">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Orders
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
          <button 
            className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setFilter('cancelled')}
          >
            Cancelled
          </button>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <FaReceipt className="no-orders-icon" />
            <h3>No orders found</h3>
            <p>You haven't placed any orders in this category yet.</p>
            <button 
              className="browse-btn"
              onClick={() => navigate('/customer/coffee')}
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order.id}</h3>
                    <p className="order-date">
                      <FaCalendarAlt /> {formatDate(order.date)}
                    </p>
                  </div>
                  <div className="order-status">
                    <span className={getStatusClass(order.status)}>
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="order-items">
                  <h4>Items Ordered:</h4>
                  <ul>
                    {order.items.map((item, index) => (
                      <li key={index}>
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">x{item.quantity}</span>
                        <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="order-details">
                  <div className="detail-row">
                    <span className="detail-label">Total Amount:</span>
                    <span className="detail-value total">${order.total.toFixed(2)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Delivery Time:</span>
                    <span className="detail-value">{order.deliveryTime}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Payment Method:</span>
                    <span className="detail-value">{order.paymentMethod}</span>
                  </div>
                </div>

                <div className="order-actions">
                  {order.status === 'completed' && (
                    <button 
                      className="reorder-btn"
                      onClick={() => handleReorder(order.id)}
                    >
                      Reorder
                    </button>
                  )}
                  <button className="view-details-btn">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerOrders;