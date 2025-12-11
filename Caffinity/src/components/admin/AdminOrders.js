import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/AdminOrders.css';
import { 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaTimes, 
  FaCheck, 
  FaShoppingBag,
  FaCalendarAlt,
  FaMoneyBill,
  FaUser,
  FaPhone,
  FaCreditCard,
  FaMobileAlt,
  FaBox,
  FaImage,
  FaEllipsisV,
  FaUserCircle,
  FaStore,
  FaClock
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
  const [productsMap, setProductsMap] = useState({});

  // Fetch all orders from API
  useEffect(() => {
    fetchOrders();
    fetchAllProducts();
  }, []);

  // Fetch all products to get their images and details
  const fetchAllProducts = async () => {
    try {
      console.log('📦 Fetching all products for order details...');
      const [coffeeResponse, dessertsResponse] = await Promise.all([
        axios.get('http://localhost:8080/api/products/coffee'),
        axios.get('http://localhost:8080/api/products/desserts')
      ]);

      const coffeeProducts = coffeeResponse.data || [];
      const dessertProducts = dessertsResponse.data || [];
      
      const productMap = {};
      
      [...coffeeProducts, ...dessertProducts].forEach(product => {
        const productId = product.productId || product.id;
        if (productId) {
          productMap[productId] = {
            ...product,
            imageUrl: getProductImage(product),
            name: product.name,
            price: product.price,
            category: product.category
          };
        }
      });
      
      console.log('✅ Products map created with', Object.keys(productMap).length, 'products');
      setProductsMap(productMap);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📋 Fetching orders from backend...');
      const response = await axios.get('http://localhost:8080/api/orders');
      
      console.log('✅ Orders fetched:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        const transformedOrders = response.data.map(order => {
          // Extract customer information
          const customerName = order.customerName || 
                             order.user?.name || 
                             (order.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() : '') || 
                             order.user?.username || 
                             'Customer';
          
          const customerPhone = order.customerPhone || 
                               order.user?.phone || 
                               order.user?.phoneNumber || 
                               order.user?.mobile || 
                               'N/A';

          // Format order date as mm/dd/yyyy
          let orderDate = 'N/A';
          if (order.orderDate) {
            try {
              const date = new Date(order.orderDate);
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              const year = date.getFullYear();
              orderDate = `${month}/${day}/${year}`;
            } catch (e) {
              orderDate = order.orderDate;
            }
          }

          // Calculate item count and enhance order items
          const orderItems = (order.orderItems || []).map(item => {
            const productId = item.productId || item.product?.productId;
            const productDetails = productId ? productsMap[productId] : null;
            
            return {
              ...item,
              productId: productId,
              productName: item.productName || item.product?.name || 'Unknown Product',
              quantity: item.quantity || 1,
              price: item.price || item.unitPrice || 0,
              totalPrice: (item.quantity || 1) * (item.price || item.unitPrice || 0),
              imageUrl: productDetails?.imageUrl || 
                       item.product?.imageUrl || 
                       getDefaultProductImage(item.productName || 'Product'),
              productDetails: productDetails
            };
          });

          const itemCount = orderItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
          
          return {
            id: order.orderId,
            orderId: order.orderId,
            userId: order.userId || order.user?.userId,
            customerName: customerName,
            customerPhone: customerPhone,
            orderDate: orderDate,
            originalDate: order.orderDate,
            totalAmount: order.totalAmount || 0,
            paymentAmount: order.paymentAmount || order.totalAmount || 0,
            status: (order.status || 'PENDING').toUpperCase(),
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus || 'PENDING',
            transactionId: order.transactionId,
            orderItems: orderItems,
            itemCount: itemCount,
            customerAvatar: generateAvatar(customerName)
          };
        });
        
        // Sort by date (newest first)
        transformedOrders.sort((a, b) => new Date(b.originalDate || 0) - new Date(a.originalDate || 0));
        
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

  // Helper function to generate avatar
  const generateAvatar = (name) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8B4513&color=fff&size=100&bold=true`;
  };

  // Helper function to get product image
  const getProductImage = (product) => {
    if (!product) return getDefaultProductImage('Product');
    
    const imageUrl = product.imageUrl || product.image;
    if (imageUrl) {
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      }
      return `http://localhost:8080${imageUrl}`;
    }
    return getDefaultProductImage(product.name);
  };

  // Helper function for default product image
  const getDefaultProductImage = (productName) => {
    const initial = productName ? productName.charAt(0).toUpperCase() : 'P';
    return `https://via.placeholder.com/100x100/8B4513/ffffff?text=${encodeURIComponent(initial)}`;
  };

  // Mock data for fallback
  const getMockOrders = () => {
    return [
      {
        id: 1,
        orderId: 1,
        customerName: 'John Doe',
        customerPhone: '09123456789',
        orderDate: '12/08/2025',
        totalAmount: 100,
        paymentAmount: 100,
        status: 'PENDING',
        paymentMethod: 'GCASH',
        paymentStatus: 'PENDING',
        transactionId: 'TXN-123456789',
        orderItems: [
          {
            productId: 1,
            productName: 'Espresso',
            quantity: 2,
            price: 50,
            totalPrice: 100,
            imageUrl: 'https://via.placeholder.com/100x100/8B4513/ffffff?text=E'
          }
        ],
        itemCount: 2,
        customerAvatar: generateAvatar('John Doe')
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
        order.orderId.toString().toLowerCase().includes(term) ||
        order.customerName.toLowerCase().includes(term) ||
        order.customerPhone.toLowerCase().includes(term) ||
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
          order.orderId === orderId ? { 
            ...order, 
            status: newStatus,
            orderDate: new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          } : order
        )
      );

      alert(`✅ Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      alert(`Failed to update order status: ${error.response?.data?.message || error.message}`);
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
          order.orderId === orderId ? { 
            ...order, 
            status: 'CANCELLED',
            orderDate: new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          } : order
        )
      );

      alert('✅ Order cancelled successfully');
    } catch (error) {
      console.error('❌ Error cancelling order:', error);
      alert(`Failed to cancel order: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
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
      'PAYMAYA': 'PayMaya',
      'BANK_TRANSFER': 'Bank Transfer',
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
      'PAYMAYA': <FaMobileAlt className="payment-icon" />,
      'BANK_TRANSFER': <FaCreditCard className="payment-icon" />,
      'CASH': <FaMoneyBill className="payment-icon" />
    };
    
    return iconMap[paymentMethod] || <FaCreditCard className="payment-icon" />;
  };

  const getNextStatusOptions = (currentStatus) => {
    const statusFlow = {
      'PENDING': ['CONFIRMED'],
      'CONFIRMED': ['COMPLETED'],
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
        <p>Manage and track customer orders</p>
        
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
            placeholder="Search by Order ID, Customer Name, or Phone..."
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
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Orders Table - Compact View */}
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
              <div className="table-header white-header">
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
                        <img src={order.customerAvatar} alt={order.customerName} className="customer-avatar-small" />
                        <div className="customer-details">
                          <div className="customer-name-row">{order.customerName}</div>
                          <div className="customer-phone-row">{order.customerPhone}</div>
                        </div>
                      </div>
                    </div>
                    <div className="table-col date">
                      {order.orderDate}
                    </div>
                    <div className="table-col amount">
                      ₱{order.totalAmount?.toFixed(2)}
                    </div>
                    <div className="table-col payment">
                      <div className="payment-info">
                        <div className="payment-method-row">
                          {getPaymentMethodDisplay(order.paymentMethod)}
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

      {/* Order Details Modal - Card Style Popup */}
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
              {/* Customer Section */}
              <div className="customer-section-details">
                <div className="customer-header-details">
                  <img src={selectedOrder.customerAvatar} alt={selectedOrder.customerName} className="customer-avatar-large" />
                  <div className="customer-info-details">
                    <h4>{selectedOrder.customerName}</h4>
                    <div className="customer-contact">
                      <div className="contact-item">
                        <FaPhone />
                        <span>{selectedOrder.customerPhone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary Card */}
              <div className="order-summary-card">
                <div className="summary-header">
                  <FaStore />
                  <span>Order Summary</span>
                </div>
                <div className="summary-content">
                  <div className="summary-item">
                    <span className="summary-label">Order Date:</span>
                    <span className="summary-value">
                      {selectedOrder.orderDate}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Total Amount:</span>
                    <span className="summary-value total">
                      ₱{selectedOrder.totalAmount?.toFixed(2)}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Payment Method:</span>
                    <span className="summary-value payment">
                      {getPaymentMethodIcon(selectedOrder.paymentMethod)}
                      {getPaymentMethodDisplay(selectedOrder.paymentMethod)}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Status:</span>
                    <span className="summary-value">
                      <span className={`status-badge ${getStatusBadgeClass(selectedOrder.status)}`}>
                        {getStatusDisplay(selectedOrder.status)}
                      </span>
                    </span>
                  </div>
                  {selectedOrder.transactionId && (
                    <div className="summary-item">
                      <span className="summary-label">Transaction ID:</span>
                      <span className="summary-value transaction">
                        {selectedOrder.transactionId}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items Card */}
              <div className="order-items-card">
                <div className="items-header">
                  <FaBox />
                  <span>Order Items ({selectedOrder.itemCount})</span>
                </div>
                <div className="items-list">
                  {selectedOrder.orderItems.map((item, index) => (
                    <div key={index} className="item-card">
                      <div className="item-image">
                        <img 
                          src={item.imageUrl} 
                          alt={item.productName}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getDefaultProductImage(item.productName);
                          }}
                        />
                      </div>
                      <div className="item-details">
                        <div className="item-name">{item.productName}</div>
                        <div className="item-quantity-price">
                          <span className="quantity">Qty: {item.quantity}</span>
                          <span className="price">₱{item.price?.toFixed(2)} each</span>
                        </div>
                        <div className="item-total">₱{(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="items-total">
                  <span className="total-label">Order Total:</span>
                  <span className="total-amount">₱{selectedOrder.totalAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer - Simplified */}
            <div className="modal-footer">
              <div className="modal-actions-wrapper">
                <div className="modal-actions-group">
                  {/* Status Update Buttons - Only show positive status updates */}
                  {getNextStatusOptions(selectedOrder.status).length > 0 && (
                    <div className="status-actions-section">
                      <h4 className="actions-title">Update Status</h4>
                      <div className="status-buttons-grid">
                        {getNextStatusOptions(selectedOrder.status).map(status => (
                          <button
                            key={status}
                            className={`btn-status-action ${status.toLowerCase()}`}
                            onClick={() => {
                              handleStatusUpdate(selectedOrder.orderId, status);
                              setShowOrderDetails(false);
                            }}
                          >
                            {status === 'CONFIRMED' && <FaCheck />}
                            {status === 'COMPLETED' && <FaCheck />}
                            {getStatusDisplay(status)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Cancel Order Button - Only for non-cancelled, non-completed orders */}
                  {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'COMPLETED' && (
                    <div className="cancel-action-section">
                      <button
                        className="btn-cancel-order"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to cancel this order?')) {
                            handleCancelOrder(selectedOrder.orderId);
                            setShowOrderDetails(false);
                          }
                        }}
                      >
                        <FaTimes /> Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;