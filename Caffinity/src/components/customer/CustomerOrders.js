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
  FaRedo,
  FaChevronRight,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaTimes,
  FaTag,
  FaTruck,
  FaPhone,
  FaEnvelope,
  FaPrint,
  FaWhatsapp,
  FaStar,
  FaUser
} from 'react-icons/fa';
import axios from 'axios';

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const navigate = useNavigate();

  // Get current user ID from localStorage or auth context
  const getCurrentUserId = () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      return parseInt(userId, 10);
    }
    
    const sessionUserId = sessionStorage.getItem('userId');
    if (sessionUserId) {
      return parseInt(sessionUserId, 10);
    }
    
    console.warn('⚠️ No user ID found, using default ID 2 for testing');
    return 2;
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

  // Format date with more details
  const formatDetailedDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
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
              name: item.product?.name || 'Unknown Product',
              description: item.product?.description || '',
              quantity: item.quantity || 1,
              price: item.unitPrice || 0,
              totalPrice: item.totalPrice || 0,
              image: item.product?.imageUrl,
              category: item.product?.category || 'General'
            })) : [],
            itemCount: itemCount,
            total: order.totalAmount || 0,
            status: mapBackendStatus(order.status),
            backendStatus: order.status,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            paymentAmount: order.paymentAmount || order.totalAmount || 0,
            transactionId: order.transactionId || 'N/A',
            deliveryTime: '30-45 mins',
            deliveryAddress: order.deliveryAddress || 'Not specified',
            contactNumber: order.contactNumber || 'Not provided',
            notes: order.notes || '',
            updatedAt: order.updatedAt,
            deliveryFee: order.deliveryFee || 50,
            tax: order.tax || 0,
            subtotal: order.subtotal || 0
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
      
      navigate('/customer/menu', { 
        state: { reorderItems: order.items }
      });
      
    } catch (error) {
      console.error('❌ Error preparing reorder:', error);
      alert('Failed to prepare reorder. Please try again.');
    }
  }, [navigate]);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedOrder(null);
  };

  const handleCancelOrder = async (order) => {
    // Only allow cancellation for PENDING orders
    if (order.backendStatus !== 'PENDING' || order.status !== 'pending') {
      alert('This order can no longer be cancelled as it has already been confirmed.');
      return;
    }
    
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = getAuthToken();
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await axios.put(
        `http://localhost:8080/api/orders/${order.orderId}/cancel`,
        {},
        { headers }
      );
      
      console.log('✅ Order cancelled:', response.data);
      alert('Order cancelled successfully!');
      
      fetchOrders();
      
    } catch (error) {
      console.error('❌ Error cancelling order:', error);
      
      if (error.response?.status === 400) {
        alert('This order cannot be cancelled as it is already confirmed or being processed.');
      } else {
        alert(`Failed to cancel order: ${error.response?.data?.message || error.message}`);
      }
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
            <div className="header-title">
              <h1><FaShoppingBag /> My Orders</h1>
              <p className="orders-subtitle">Track and manage your orders</p>
            </div>
            <div className="header-actions">
              <button 
                className="refresh-btn"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <FaRedo className={refreshing ? 'spinning' : ''} />
                {refreshing ? 'Refreshing...' : 'Refresh Orders'}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="error-alert">
              <FaExclamationCircle />
              <div className="error-message">
                <strong>Error loading orders:</strong>
                <span>{error}</span>
              </div>
              <button onClick={fetchOrders}>Try Again</button>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="orders-stats">
          <div className="stat-card">
            <div className="stat-icon pending">
              <FaClock />
            </div>
            <div className="stat-info">
              <span className="stat-count">
                {orders.filter(o => o.status === 'pending').length}
              </span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon processing">
              <FaCheckCircle />
            </div>
            <div className="stat-info">
              <span className="stat-count">
                {orders.filter(o => o.status === 'confirmed' || o.status === 'processing').length}
              </span>
              <span className="stat-label">In Progress</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon completed">
              <FaCheckCircle />
            </div>
            <div className="stat-info">
              <span className="stat-count">
                {orders.filter(o => o.status === 'completed').length}
              </span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon total">
              <FaReceipt />
            </div>
            <div className="stat-info">
              <span className="stat-count">{orders.length}</span>
              <span className="stat-label">Total Orders</span>
            </div>
          </div>
        </div>

        <div className="orders-filter">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Orders
            <span className="filter-count">({orders.length})</span>
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
            <span className="filter-count">({orders.filter(o => o.status === 'pending').length})</span>
          </button>
          <button 
            className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
            onClick={() => setFilter('confirmed')}
          >
            In Progress
            <span className="filter-count">({orders.filter(o => o.status === 'confirmed' || o.status === 'processing').length})</span>
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
            <span className="filter-count">({orders.filter(o => o.status === 'completed').length})</span>
          </button>
          <button 
            className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setFilter('cancelled')}
          >
            Cancelled
            <span className="filter-count">({orders.filter(o => o.status === 'cancelled').length})</span>
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
            <div className="no-orders-content">
              <FaReceipt className="no-orders-icon" />
              <h3>No {filter !== 'all' ? filter : ''} orders found</h3>
              <p>
                {filter === 'all' 
                  ? "You haven't placed any orders yet. Start exploring our menu!" 
                  : `You don't have any ${filter} orders at the moment.`}
              </p>
              <button 
                className="browse-btn"
                onClick={() => navigate('/customer/menu')}
              >
                <FaShoppingBag /> Browse Menu
              </button>
            </div>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div key={order.orderId || order.id} className="order-card">
                <div className="order-card-header">
                  <div className="order-meta">
                    <div className="order-number">
                      <h3>Order #{order.id}</h3>
                      <span className="order-date">
                        <FaCalendarAlt /> {formatBackendDate(order.date)}
                      </span>
                    </div>
                    <div className="order-quick-info">
                      <span className="order-items-count">
                        <FaShoppingBag /> {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                      </span>
                      <span className="order-total">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>
                  <div className="order-status-section">
                    <span className={getStatusClass(order.status)}>
                      {getStatusIcon(order.status)}
                      {getStatusDisplay(order.status)}
                    </span>
                    {order.deliveryAddress && order.deliveryAddress !== 'Not specified' && (
                      <span className="delivery-address">
                        <FaMapMarkerAlt /> {order.deliveryAddress.substring(0, 30)}...
                      </span>
                    )}
                  </div>
                </div>

                <div className="order-card-body">
                  <div className="order-items-summary">
                    <h4><FaShoppingBag /> Items</h4>
                    <div className="items-list">
                      {order.items.slice(0, 2).map((item, index) => (
                        <div key={item.id || index} className="item-summary">
                          <span className="item-name">{item.name}</span>
                          <span className="item-details">
                            <span className="item-quantity">x{item.quantity}</span>
                            <span className="item-price">{formatCurrency(item.price * item.quantity)}</span>
                          </span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="more-items-indicator">
                          + {order.items.length - 2} more item{order.items.length - 2 !== 1 ? 's' : ''}
                        </div>
                      )}
                      {order.items.length === 0 && (
                        <div className="more-items-indicator">
                          No items available
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="order-details-grid">
                    <div className="detail-column">
                      <div className="detail-item">
                        <span className="detail-label">Payment Method</span>
                        <span className="detail-value">
                          {getPaymentMethodIcon(order.paymentMethod)}
                          {getPaymentMethodDisplay(order.paymentMethod)}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Payment Status</span>
                        <span className={`detail-value payment-status ${order.paymentStatus?.toLowerCase() || 'pending'}`}>
                          {order.paymentStatus || 'Pending'}
                        </span>
                      </div>
                    </div>
                    <div className="detail-column">
                      <div className="detail-item">
                        <span className="detail-label">Pickup</span>
                        <span className="detail-value">
                          <FaClock /> {order.deliveryTime}
                        </span>
                      </div>
                      {order.transactionId && order.transactionId !== 'N/A' && (
                        <div className="detail-item">
                          <span className="detail-label">Transaction ID</span>
                          <span className="detail-value transaction">
                            {order.transactionId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="order-card-footer">
                  <div className="footer-actions">
                    {order.status === 'completed' && (
                      <button 
                        className="action-btn reorder-btn"
                        onClick={() => handleReorder(order)}
                      >
                        <FaRedo /> Reorder
                      </button>
                    )}
                    
                    {/* Cancel button ONLY shows for PENDING orders */}
                    {order.status === 'pending' && order.backendStatus === 'PENDING' && (
                      <button 
                        className="action-btn cancel-btn"
                        onClick={() => handleCancelOrder(order)}
                      >
                        <FaTimesCircle /> Cancel Order
                      </button>
                    )}
                    
                    <button 
                      className="action-btn details-btn"
                      onClick={() => handleViewDetails(order)}
                    >
                      <FaInfoCircle /> View Details <FaChevronRight />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="orders-footer">
          <div className="footer-content">
            <p className="orders-help">
              <FaInfoCircle /> Need help with an order? 
              <a href="/customer/support"> Contact our support team</a>
            </p>
            <p className="orders-note">
              Orders are updated in real-time. Refresh to see the latest status.
            </p>
          </div>
        </div>
      </main>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="order-details-modal">
          <div className="modal-overlay" onClick={handleCloseDetails}></div>
          <div className="modal-content">
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-title">
                <h2><FaReceipt /> Order Details</h2>
                <span className="modal-order-id">#{selectedOrder.id}</span>
              </div>
              <button className="modal-close-btn" onClick={handleCloseDetails}>
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              <div className="modal-scroll-container">
                
              {/* Order Summary */}
              <div className="modal-section">
                <div className="modal-summary">
                  <div className="summary-item">
                    <span className="summary-label">Order Date</span>
                    <span className="summary-value">
                      <FaCalendarAlt /> {formatDetailedDate(selectedOrder.date)}
                    </span>
                  </div>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Status</span>
                    <span className={`summary-value ${getStatusClass(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      {getStatusDisplay(selectedOrder.status)}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Total Amount</span>
                    <span className="summary-value total-amount">
                      {formatCurrency(selectedOrder.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items with Images */}
              <div className="modal-section">
                <h3><FaShoppingBag /> Order Items ({selectedOrder.itemCount})</h3>
                <div className="modal-items-list">
                  {selectedOrder.items.map((item, index) => (
                    <div key={item.id || index} className="modal-item">
                      <div className="item-image-container">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="item-image"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://via.placeholder.com/150x150?text=${encodeURIComponent(item.name.substring(0, 2))}`;
                            }}
                          />
                        ) : (
                          <div className="item-image-placeholder">
                            <FaTag />
                            <span>{item.name.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <div className="item-details">
                        <h4 className="item-name">{item.name}</h4>
                        <p className="item-description">{item.description || 'No description available'}</p>
                        <div className="item-meta">
                          <span className="item-quantity">Quantity: {item.quantity}</span>
                          <span className="item-category">{item.category}</span>
                        </div>
                        <div className="item-pricing">
                          <span className="item-unit-price">
                            Unit Price: {formatCurrency(item.price)}
                          </span>
                          <span className="item-total-price">
                            Total: {formatCurrency(item.totalPrice || item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Delivery Details */}
              <div className="modal-section-grid">
                <div className="modal-section">
                  <h3><FaCreditCard /> Payment Details</h3>
                  <div className="details-card">
                    <div className="detail-row">
                      <span>Payment Method</span>
                      <span className="detail-value">
                        {getPaymentMethodIcon(selectedOrder.paymentMethod)}
                        {getPaymentMethodDisplay(selectedOrder.paymentMethod)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span>Payment Status</span>
                      <span className={`detail-value payment-status ${selectedOrder.paymentStatus?.toLowerCase()}`}>
                        {selectedOrder.paymentStatus || 'Pending'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span>Transaction ID</span>
                      <span className="detail-value transaction-id">
                        {selectedOrder.transactionId || 'N/A'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span>Payment Amount</span>
                      <span className="detail-value">
                        {formatCurrency(selectedOrder.paymentAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="modal-section">
                  <h3><FaTruck /> Delivery Details</h3>
                  <div className="details-card">
                    <div className="detail-row">
                      <span>Delivery Address</span>
                      <span className="detail-value">
                        <FaMapMarkerAlt /> {selectedOrder.deliveryAddress}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span>Contact Number</span>
                      <span className="detail-value">
                        <FaPhone /> {selectedOrder.contactNumber}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span>Estimated Delivery</span>
                      <span className="detail-value">
                        <FaClock /> {selectedOrder.deliveryTime}
                      </span>
                    </div>
                    {selectedOrder.notes && (
                      <div className="detail-row">
                        <span>Special Instructions</span>
                        <span className="detail-value notes">
                          {selectedOrder.notes}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="modal-section">
                <h3>Order Summary</h3>
                <div className="order-summary-card">
                  <div className="summary-row">
                    <span>Subtotal ({selectedOrder.itemCount} items)</span>
                    <span>{formatCurrency(selectedOrder.subtotal || selectedOrder.total - (selectedOrder.deliveryFee || 50) - (selectedOrder.tax || 0))}</span>
                  </div>
                  <div className="summary-row">
                    <span>Delivery Fee</span>
                    <span>{formatCurrency(selectedOrder.deliveryFee || 50)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Tax</span>
                    <span>{formatCurrency(selectedOrder.tax || 0)}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total Amount</span>
                    <span>{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Customer Support */}
              <div className="modal-section support-section">
                <h3><FaEnvelope /> Need Help?</h3>
                <p>If you have questions about your order, contact our support team.</p>
                <div className="support-buttons">
                  <button className="support-btn chat">
                    <FaWhatsapp /> Chat Support
                  </button>
                  <button className="support-btn call">
                    <FaPhone /> Call Support
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button className="modal-btn secondary" onClick={handleCloseDetails}>
                Close
              </button>
              {selectedOrder.status === 'completed' && (
                <button 
                  className="modal-btn primary"
                  onClick={() => {
                    handleCloseDetails();
                    handleReorder(selectedOrder);
                  }}
                >
                  <FaRedo /> Reorder
                </button>
              )}
              {selectedOrder.status === 'pending' && selectedOrder.backendStatus === 'PENDING' && (
                <button 
                  className="modal-btn danger"
                  onClick={() => {
                    handleCloseDetails();
                    handleCancelOrder(selectedOrder);
                  }}
                >
                  <FaTimesCircle /> Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;