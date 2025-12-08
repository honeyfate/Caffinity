// components/admin/AdminOrders.js (COMPLETE IMPLEMENTATION)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/AdminOrders.css';
import { 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaTimes, 
  FaCheck, 
  FaClock, 
  FaShoppingBag,
  FaCalendarAlt,
  FaMoneyBill,
  FaUser,
  FaPhone,
  FaCreditCard,
  FaMobileAlt
} from 'react-icons/fa';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Fetch all orders from API
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📋 Fetching orders from backend...');
      const response = await axios.get('http://localhost:8080/api/orders');
      
      console.log('✅ Orders fetched:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // Transform backend data to match frontend structure
        const transformedOrders = response.data.map(order => ({
          id: order.orderId,
          orderId: order.orderId, // Keep backend ID
          user: {
            id: order.user?.userId,
            name: order.user?.name || 'Guest Customer',
            phone: order.user?.phone || 'N/A'
          },
          customerName: order.user?.name || 'Guest Customer',
          customerPhone: order.user?.phone || 'N/A',
          orderDate: order.orderDate,
          updatedAt: order.updatedAt,
          totalAmount: order.totalAmount || 0,
          paymentAmount: order.paymentAmount || order.totalAmount || 0,
          status: order.status || 'PENDING',
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          transactionId: order.transactionId,
          orderItems: order.orderItems || [],
          // Calculate total items count
          itemCount: order.orderItems ? 
            order.orderItems.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0
        }));
        
        // Sort by date (newest first)
        transformedOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
        
        setOrders(transformedOrders);
        setFilteredOrders(transformedOrders);
      } else {
        console.error('Invalid response format:', response.data);
        setError('Invalid data received from server');
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      
      if (error.response) {
        setError(`Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
      } else if (error.request) {
        setError('Cannot connect to server. Please check your connection.');
      } else {
        setError(`Error: ${error.message}`);
      }
      
      // Fallback to mock data for testing
      console.log('⚠️ Using mock data as fallback');
      setOrders(getMockOrders());
      setFilteredOrders(getMockOrders());
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for fallback
  const getMockOrders = () => {
    return [
      {
        id: 1,
        orderId: 1,
        user: { id: 2, name: 'John Doe', phone: '09123456789' },
        customerName: 'John Doe',
        customerPhone: '09123456789',
        orderDate: '2025-12-08T20:54:16.805379',
        totalAmount: 100,
        paymentAmount: 100,
        status: 'PENDING',
        paymentMethod: 'GCASH',
        paymentStatus: 'PENDING',
        transactionId: 'TXN-123456789',
        orderItems: [],
        itemCount: 0
      },
      {
        id: 2,
        orderId: 2,
        user: { id: 2, name: 'John Doe', phone: '09123456789' },
        customerName: 'John Doe',
        customerPhone: '09123456789',
        orderDate: '2025-12-08T21:00:14.705238',
        totalAmount: 100,
        paymentAmount: 100,
        status: 'PENDING',
        paymentMethod: 'CREDIT_CARD',
        paymentStatus: 'PENDING',
        transactionId: 'TXN-987654321',
        orderItems: [],
        itemCount: 0
      }
    ];
  };

  // Filter orders based on status and search term
  useEffect(() => {
    let filtered = orders;

    // Filter by status
    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    // Filter by search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.orderId.toString().includes(term) ||
        order.customerName.toLowerCase().includes(term) ||
        order.customerPhone.includes(term) ||
        order.transactionId?.toLowerCase().includes(term)
      );
    }

    setFilteredOrders(filtered);
  }, [orders, selectedStatus, searchTerm]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setIsLoading(true);
      
      console.log(`🔄 Updating order ${orderId} status to ${newStatus}`);
      const response = await axios.put(
        `http://localhost:8080/api/orders/${orderId}/status`, 
        null,
        { params: { status: newStatus } }
      );

      console.log('✅ Status update response:', response.data);
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.orderId === orderId ? { ...order, status: newStatus } : order
        )
      );

      alert(`✅ Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      alert(`Failed to update order status: ${error.response?.data || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setIsLoading(true);
      console.log(`🔄 Cancelling order ${orderId}`);
      
      const response = await axios.put(`http://localhost:8080/api/orders/${orderId}/cancel`);
      
      console.log('✅ Cancel response:', response.data);
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.orderId === orderId ? { ...order, status: 'CANCELLED' } : order
        )
      );

      alert('✅ Order cancelled successfully');
    } catch (error) {
      console.error('❌ Error cancelling order:', error);
      alert(`Failed to cancel order: ${error.response?.data || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const formatDate = (dateString) => {
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

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'PENDING': 'status-pending',
      'CONFIRMED': 'status-confirmed',
      'COMPLETED': 'status-completed',
      'CANCELLED': 'status-cancelled'
    };
    return statusClasses[status] || 'status-pending';
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'PENDING': 'Pending',
      'CONFIRMED': 'Confirmed',
      'COMPLETED': 'Completed',
      'CANCELLED': 'Cancelled'
    };
    return statusMap[status] || status;
  };

  const getPaymentMethodDisplay = (paymentMethod) => {
    if (!paymentMethod) return 'Not Specified';
    
    const methodMap = {
      'CREDIT_CARD': 'Credit Card',
      'DEBIT_CARD': 'Debit Card',
      'GCASH': 'GCash',
      'CASH': 'Cash'
    };
    
    return methodMap[paymentMethod] || paymentMethod;
  };

  const getPaymentMethodIcon = (paymentMethod) => {
    if (!paymentMethod) return null;
    
    const iconMap = {
      'CREDIT_CARD': <FaCreditCard className="payment-icon" />,
      'DEBIT_CARD': <FaCreditCard className="payment-icon" />,
      'GCASH': <FaMobileAlt className="payment-icon" />,
      'CASH': <FaMoneyBill className="payment-icon" />
    };
    
    return iconMap[paymentMethod] || <FaCreditCard className="payment-icon" />;
  };

  const getNextStatusOptions = (currentStatus) => {
    const statusFlow = {
      'PENDING': ['CONFIRMED', 'CANCELLED'],
      'CONFIRMED': ['COMPLETED', 'CANCELLED'],
      'COMPLETED': [],
      'CANCELLED': []
    };
    return statusFlow[currentStatus] || [];
  };

  const getOrderStatistics = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'PENDING').length,
      confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
      completed: orders.filter(o => o.status === 'COMPLETED').length,
      cancelled: orders.filter(o => o.status === 'CANCELLED').length
    };
    return stats;
  };

  const stats = getOrderStatistics();

  return (
    <div className="admin-orders">
      <div className="page-header">
        <h1><FaShoppingBag /> Order Management</h1>
        <p>View and manage customer orders</p>
        
        {error && (
          <div className="error-alert">
            <FaTimes />
            <span>{error}</span>
            <button onClick={fetchOrders}>Retry</button>
          </div>
        )}
      </div>

      {/* Order Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card confirmed">
          <div className="stat-value">{stats.confirmed}</div>
          <div className="stat-label">Confirmed</div>
        </div>
        <div className="stat-card completed">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card cancelled">
          <div className="stat-value">{stats.cancelled}</div>
          <div className="stat-label">Cancelled</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by Order ID, Customer Name, Phone, or Transaction ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="status-filters">
          <FaFilter className="filter-icon" />
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            disabled={isLoading}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <button 
          className="refresh-btn"
          onClick={fetchOrders}
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : 'Refresh Orders'}
        </button>
      </div>

      {/* Orders Table */}
      <div className="content-card">
        <div className="card-header">
          <h3 className="card-title">
            Orders ({filteredOrders.length})
            {selectedStatus !== 'ALL' && ` - ${getStatusDisplay(selectedStatus)}`}
          </h3>
        </div>
        <div className="card-content">
          {isLoading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="empty-state">
              <FaShoppingBag className="empty-icon" />
              <p>No orders found {searchTerm ? `for "${searchTerm}"` : ''}</p>
              {searchTerm && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="orders-table">
              <div className="table-header">
                <div className="table-col order-id">Order ID</div>
                <div className="table-col customer">Customer</div>
                <div className="table-col date">Order Date</div>
                <div className="table-col amount">Amount</div>
                <div className="table-col payment">Payment</div>
                <div className="table-col status">Status</div>
                <div className="table-col actions">Actions</div>
              </div>
              
              <div className="table-body">
                {filteredOrders.map(order => (
                  <div key={order.orderId} className="table-row">
                    <div className="table-col order-id">
                      <span className="order-id-badge">#{order.orderId}</span>
                    </div>
                    <div className="table-col customer">
                      <div className="customer-info">
                        <FaUser className="customer-icon" />
                        <div>
                          <div className="customer-name">{order.customerName}</div>
                          <div className="customer-phone">
                            <FaPhone /> {order.customerPhone}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="table-col date">
                      <FaCalendarAlt className="date-icon" />
                      {formatDate(order.orderDate)}
                    </div>
                    <div className="table-col amount">
                      <FaMoneyBill className="amount-icon" />
                      ₱{order.totalAmount?.toFixed(2)}
                    </div>
                    <div className="table-col payment">
                      <div className="payment-info">
                        {getPaymentMethodIcon(order.paymentMethod)}
                        <div>
                          <div className="payment-method">
                            {getPaymentMethodDisplay(order.paymentMethod)}
                          </div>
                          <div className="transaction-id">
                            {order.transactionId ? `TXN: ${order.transactionId}` : 'No TXN ID'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="table-col status">
                      <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                        {getStatusDisplay(order.status)}
                      </span>
                    </div>
                    <div className="table-col actions">
                      <div className="action-buttons">
                        {/* Status Update Dropdown */}
                        {getNextStatusOptions(order.status).length > 0 && (
                          <select
                            value=""
                            onChange={(e) => handleStatusUpdate(order.orderId, e.target.value)}
                            disabled={isLoading}
                            className="status-select"
                          >
                            <option value="">Update Status</option>
                            {getNextStatusOptions(order.status).map(status => (
                              <option key={status} value={status}>
                                Mark as {getStatusDisplay(status)}
                              </option>
                            ))}
                          </select>
                        )}
                        
                        {/* Cancel Button */}
                        {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                          <button
                            className="btn-cancel"
                            onClick={() => handleCancelOrder(order.orderId)}
                            disabled={isLoading}
                          >
                            <FaTimes /> Cancel
                          </button>
                        )}
                        
                        {/* View Details Button */}
                        <button
                          className="btn-view"
                          onClick={() => handleViewOrderDetails(order)}
                        >
                          <FaEye /> View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="modal-overlay">
          <div className="order-details-modal">
            <div className="modal-header">
              <h3>Order Details #{selectedOrder.orderId}</h3>
              <button 
                className="close-modal"
                onClick={() => setShowOrderDetails(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-content">
              <div className="details-section">
                <h4>Customer Information</h4>
                <div className="detail-row">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{selectedOrder.customerName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{selectedOrder.customerPhone}</span>
                </div>
              </div>
              
              <div className="details-section">
                <h4>Order Information</h4>
                <div className="detail-row">
                  <span className="detail-label">Order Date:</span>
                  <span className="detail-value">{formatDate(selectedOrder.orderDate)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className={`detail-value status-badge ${getStatusBadgeClass(selectedOrder.status)}`}>
                    {getStatusDisplay(selectedOrder.status)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Total Amount:</span>
                  <span className="detail-value">₱{selectedOrder.totalAmount?.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="details-section">
                <h4>Payment Information</h4>
                <div className="detail-row">
                  <span className="detail-label">Payment Method:</span>
                  <span className="detail-value">
                    {getPaymentMethodIcon(selectedOrder.paymentMethod)}
                    {getPaymentMethodDisplay(selectedOrder.paymentMethod)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Payment Status:</span>
                  <span className="detail-value">{selectedOrder.paymentStatus || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Transaction ID:</span>
                  <span className="detail-value">{selectedOrder.transactionId || 'N/A'}</span>
                </div>
              </div>
              
              <div className="details-section">
                <h4>Order Items ({selectedOrder.itemCount})</h4>
                {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? (
                  <div className="order-items-list">
                    {selectedOrder.orderItems.map((item, index) => (
                      <div key={index} className="order-item">
                        <div className="item-name">{item.product?.productName || 'Unknown Product'}</div>
                        <div className="item-quantity">x{item.quantity}</div>
                        <div className="item-price">₱{(item.unitPrice * item.quantity).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-items">No item details available</p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-close"
                onClick={() => setShowOrderDetails(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;