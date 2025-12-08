import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerDashboard from './CustomerDashboard';
import '../css/CustomerOrders.css';
import { 
  FaReceipt, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaClock, 
  FaTimesCircle, 
  FaShoppingBag,
  FaCreditCard,
  FaMoneyBill,
  FaMobileAlt,
  FaExclamationCircle,
  FaRedo
} from 'react-icons/fa';
import axios from 'axios';

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, completed, cancelled
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  // Get current user ID from localStorage or auth context
  const getCurrentUserId = () => {
    // Try to get from localStorage
    const userId = localStorage.getItem('userId');
    if (userId) {
      return parseInt(userId, 10);
    }
    
    // Try to get from sessionStorage
    const sessionUserId = sessionStorage.getItem('userId');
    if (sessionUserId) {
      return parseInt(sessionUserId, 10);
    }
    
    // For testing - remove this in production
    console.warn('⚠️ No user ID found, using default ID 2 for testing');
    return 2; // Default test user
  };

  // Get user token for authorization
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // Format date from backend
  const formatBackendDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date Error';
    }
  };

  // Map backend status to frontend status
  const mapBackendStatus = (backendStatus) => {
    if (!backendStatus) return 'pending';
    
    const statusMap = {
      'PENDING': 'pending',
      'CONFIRMED': 'confirmed',
      'PROCESSING': 'processing',
      'COMPLETED': 'completed',
      'CANCELLED': 'cancelled',
      'SHIPPED': 'shipped',
      'DELIVERED': 'completed'
    };
    
    return statusMap[backendStatus.toUpperCase()] || 'pending';
  };

  // Map payment method to display name
  const getPaymentMethodDisplay = (paymentMethod) => {
    if (!paymentMethod) return 'Not Specified';
    
    const methodMap = {
      'CREDIT_CARD': 'Credit Card',
      'DEBIT_CARD': 'Debit Card',
      'GCASH': 'GCash',
      'CASH': 'Cash',
      'COD': 'Cash on Delivery',
      'PAYPAL': 'PayPal',
      'BANK_TRANSFER': 'Bank Transfer'
    };
    
    return methodMap[paymentMethod] || paymentMethod.replace('_', ' ');
  };

  // Get payment method icon
  const getPaymentMethodIcon = (paymentMethod) => {
    if (!paymentMethod) return null;
    
    const iconMap = {
      'CREDIT_CARD': <FaCreditCard className="payment-icon" />,
      'DEBIT_CARD': <FaCreditCard className="payment-icon" />,
      'GCASH': <FaMobileAlt className="payment-icon" />,
      'CASH': <FaMoneyBill className="payment-icon" />,
      'COD': <FaMoneyBill className="payment-icon" />,
    };
    
    return iconMap[paymentMethod] || <FaCreditCard className="payment-icon" />;
  };

  // Format currency in Philippine Peso
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '₱0.00';
    }
    
    // Convert to number if it's a string
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // Format with peso sign and 2 decimal places
    return `₱${numAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  // Fetch orders from backend
  const fetchOrders = async () => {
    try {
      const userId = getCurrentUserId();
      const token = getAuthToken();
      
      console.log(`📋 Fetching orders for user ID: ${userId}`);
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await axios.get(
        `http://localhost:8080/api/orders/user/${userId}`,
        { headers }
      );
      
      console.log('✅ Orders fetched successfully:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // Transform backend data to frontend format
        const transformedOrders = response.data.map(order => {
          // Calculate total items count
          const itemCount = order.orderItems 
            ? order.orderItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
            : 0;
          
          return {
            id: `ORD-${order.orderId?.toString().padStart(3, '0') || '000'}`,
            orderId: order.orderId,
            backendOrder: order, // Keep full backend object for details
            date: order.orderDate,
            items: order.orderItems ? order.orderItems.map(item => ({
              id: item.orderItemId,
              name: item.product?.productName || 'Unknown Product',
              description: item.product?.description || '',
              quantity: item.quantity || 1,
              price: item.unitPrice || 0,
              totalPrice: item.totalPrice || 0,
              image: item.product?.imageUrl
            })) : [],
            itemCount: itemCount,
            total: order.totalAmount || 0,
            status: mapBackendStatus(order.status),
            backendStatus: order.status,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            paymentAmount: order.paymentAmount || order.totalAmount || 0,
            transactionId: order.transactionId || 'N/A',
            deliveryTime: '30-45 mins', // This should come from backend
            deliveryAddress: order.deliveryAddress || 'Not specified',
            notes: order.notes || '',
            updatedAt: order.updatedAt
          };
        });
        
        // Sort by date (newest first)
        transformedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setOrders(transformedOrders);
        setError(null);
      } else {
        console.error('Invalid response format:', response.data);
        setError('Invalid data received from server');
      }
      
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      
      if (error.response) {
        // Server responded with error
        console.error('Server error:', error.response.status, error.response.data);
        setError(`Server error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
      } else if (error.request) {
        // No response received
        console.error('No response received from server');
        setError('Cannot connect to server. Please check your connection.');
      } else {
        // Request setup error
        setError(`Error: ${error.message}`);
      }
      
      // Don't use mock data in production - just show error
      // setOrders(getMockOrders()); // Uncomment for testing
      
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return <FaCheckCircle className="status-icon completed" />;
      case 'confirmed':
      case 'processing':
      case 'shipped':
        return <FaClock className="status-icon processing" />;
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
      case 'delivered':
        return 'status-badge completed';
      case 'confirmed':
      case 'processing':
      case 'shipped':
        return 'status-badge processing';
      case 'pending':
        return 'status-badge pending';
      case 'cancelled':
        return 'status-badge cancelled';
      default:
        return 'status-badge';
    }
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'processing': 'Processing',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'shipped': 'Shipped',
      'delivered': 'Delivered'
    };
    return statusMap[status] || 'Pending';
  };

  const handleReorder = useCallback(async (order) => {
    try {
      console.log(`🔄 Reordering order ${order.id}`);
      
      // Navigate to menu with pre-selected items
      // You might want to save the order items to context or localStorage
      // and redirect to the cart page
      navigate('/customer/menu', { 
        state: { reorderItems: order.items }
      });
      
    } catch (error) {
      console.error('❌ Error preparing reorder:', error);
      alert('Failed to prepare reorder. Please try again.');
    }
  }, [navigate]);

  const handleViewDetails = (order) => {
    // Navigate to order details page or show modal
    navigate(`/customer/orders/${order.orderId}`, { 
      state: { order }
    });
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }
    
    try {
      const token = getAuthToken();
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await axios.put(
        `http://localhost:8080/api/orders/${orderId}/cancel`,
        {},
        { headers }
      );
      
      console.log('✅ Order cancelled:', response.data);
      alert('Order cancelled successfully!');
      
      // Refresh orders
      fetchOrders();
      
    } catch (error) {
      console.error('❌ Error cancelling order:', error);
      alert(`Failed to cancel order: ${error.response?.data || error.message}`);
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  if (loading && !refreshing) {
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
          <div className="header-top">
            <h1><FaShoppingBag /> My Orders</h1>
            <button 
              className="refresh-btn"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <FaRedo className={refreshing ? 'spinning' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <p>View and manage your past and current orders</p>
          
          {error && (
            <div className="error-alert">
              <FaExclamationCircle />
              <span>{error}</span>
              <button onClick={fetchOrders}>Try Again</button>
            </div>
          )}
        </div>

        <div className="orders-filter">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Orders ({orders.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({orders.filter(o => o.status === 'pending').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
            onClick={() => setFilter('confirmed')}
          >
            Confirmed ({orders.filter(o => o.status === 'confirmed' || o.status === 'processing').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({orders.filter(o => o.status === 'completed').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setFilter('cancelled')}
          >
            Cancelled ({orders.filter(o => o.status === 'cancelled').length})
          </button>
        </div>

        {refreshing && (
          <div className="refreshing-indicator">
            <div className="mini-spinner"></div>
            Updating orders...
          </div>
        )}

        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <FaReceipt className="no-orders-icon" />
            <h3>No orders found</h3>
            <p>
              {filter === 'all' 
                ? "You haven't placed any orders yet." 
                : `You don't have any ${filter} orders.`}
            </p>
            <button 
              className="browse-btn"
              onClick={() => navigate('/customer/menu')}
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div key={order.orderId || order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order.id}</h3>
                    <p className="order-date">
                      <FaCalendarAlt /> {formatBackendDate(order.date)}
                    </p>
                    <p className="order-items-count">
                      {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="order-status">
                    <span className={getStatusClass(order.status)}>
                      {getStatusIcon(order.status)}
                      {getStatusDisplay(order.status)}
                    </span>
                  </div>
                </div>

                <div className="order-items">
                  <h4>Items Ordered:</h4>
                  <ul>
                    {order.items.slice(0, 3).map((item, index) => (
                      <li key={item.id || index}>
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">x{item.quantity}</span>
                        <span className="item-price">{formatCurrency(item.price * item.quantity)}</span>
                      </li>
                    ))}
                    {order.items.length > 3 && (
                      <li className="more-items">
                        + {order.items.length - 3} more item{order.items.length - 3 !== 1 ? 's' : ''}
                      </li>
                    )}
                    {order.items.length === 0 && (
                      <li className="no-items">No items details available</li>
                    )}
                  </ul>
                </div>

                <div className="order-details">
                  <div className="detail-row">
                    <span className="detail-label">Total Amount:</span>
                    <span className="detail-value total">{formatCurrency(order.total)}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Payment Method:</span>
                    <span className="detail-value payment-method">
                      {getPaymentMethodIcon(order.paymentMethod)}
                      {getPaymentMethodDisplay(order.paymentMethod)}
                      {order.transactionId && order.transactionId !== 'N/A' && (
                        <span className="transaction-id">(ID: {order.transactionId})</span>
                      )}
                    </span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Payment Status:</span>
                    <span className={`detail-value payment-status ${order.paymentStatus?.toLowerCase()}`}>
                      {order.paymentStatus || 'Not Specified'}
                    </span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Delivery Time:</span>
                    <span className="detail-value">{order.deliveryTime}</span>
                  </div>
                </div>

                <div className="order-actions">
                  {order.status === 'completed' && (
                    <button 
                      className="reorder-btn"
                      onClick={() => handleReorder(order)}
                    >
                      Reorder
                    </button>
                  )}
                  
                  {(order.status === 'pending' || order.status === 'confirmed') && (
                    <button 
                      className="cancel-btn"
                      onClick={() => handleCancelOrder(order.orderId)}
                    >
                      Cancel Order
                    </button>
                  )}
                  
                  <button 
                    className="view-details-btn"
                    onClick={() => handleViewDetails(order)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="orders-footer">
          <p className="orders-help">
            Need help with an order? <a href="/customer/support">Contact Support</a>
          </p>
          <p className="orders-note">
            Orders are updated in real-time. Pull down to refresh or click the refresh button.
          </p>
        </div>
      </main>
    </div>
  );
};

export default CustomerOrders;