// components/admin/AdminOrders.js (COMPLETE IMPLEMENTATION)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/AdminOrders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:8080/api/orders');
        
        if (response.data && Array.isArray(response.data)) {
          setOrders(response.data);
          setFilteredOrders(response.data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        alert('Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on status and search term
  useEffect(() => {
    let filtered = orders;

    // Filter by status
    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toString().includes(searchTerm) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  }, [orders, selectedStatus, searchTerm]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setIsLoading(true);
      const response = await axios.put(`http://localhost:8080/api/orders/${orderId}/status`, null, {
        params: { status: newStatus }
      });

      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? response.data : order
        )
      );

      alert(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
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
      const response = await axios.put(`http://localhost:8080/api/orders/${orderId}/cancel`);
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? response.data : order
        )
      );

      alert('Order cancelled successfully');
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order: ' + (error.response?.data || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'PENDING': 'status-pending',
      'CONFIRMED': 'status-confirmed',
      'PREPARING': 'status-preparing',
      'READY': 'status-ready',
      'COMPLETED': 'status-completed',
      'CANCELLED': 'status-cancelled'
    };
    return statusClasses[status] || 'status-pending';
  };

  // In AdminOrders.js - Update the status filter logic
const getNextStatusOptions = (currentStatus) => {
  const statusFlow = {
    'PENDING': ['CONFIRMED', 'CANCELLED'],
    'PAYMENT_PENDING': ['CONFIRMED', 'CANCELLED'], // NEW
    'CONFIRMED': ['PREPARING', 'CANCELLED'],
    'PREPARING': ['READY'],
    'READY': ['COMPLETED'],
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
      preparing: orders.filter(o => o.status === 'PREPARING').length,
      ready: orders.filter(o => o.status === 'READY').length,
      completed: orders.filter(o => o.status === 'COMPLETED').length,
      cancelled: orders.filter(o => o.status === 'CANCELLED').length
    };
    return stats;
  };

  const stats = getOrderStatistics();

  return (
    <div className="admin-orders">
      <div className="page-header">
        <h1>Order Management</h1>
        <p>View and manage customer orders</p>
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
        <div className="stat-card preparing">
          <div className="stat-value">{stats.preparing}</div>
          <div className="stat-label">Preparing</div>
        </div>
        <div className="stat-card ready">
          <div className="stat-value">{stats.ready}</div>
          <div className="stat-label">Ready</div>
        </div>
        <div className="stat-card completed">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by order ID, customer name, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="status-filters">
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PREPARING">Preparing</option>
            <option value="READY">Ready</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="content-card">
        <div className="card-header">
          <h3 className="card-title">
            Orders ({filteredOrders.length})
            {selectedStatus !== 'ALL' && ` - ${selectedStatus}`}
          </h3>
        </div>
        <div className="card-content">
          {isLoading ? (
            <div className="loading">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="empty-state">
              <p>No orders found</p>
            </div>
          ) : (
            <div className="orders-table">
              <div className="table-header">
                <div className="table-col order-id">Order ID</div>
                <div className="table-col customer">Customer</div>
                <div className="table-col date">Order Date</div>
                <div className="table-col amount">Amount</div>
                <div className="table-col status">Status</div>
                <div className="table-col actions">Actions</div>
              </div>
              
              <div className="table-body">
                {filteredOrders.map(order => (
                  <div key={order.id} className="table-row">
                    <div className="table-col order-id">#{order.id}</div>
                    <div className="table-col customer">
                      <div className="customer-name">{order.user?.name || 'Unknown'}</div>
                      <div className="customer-address">{order.shippingAddress}</div>
                    </div>
                    <div className="table-col date">
                      {formatDate(order.orderDate)}
                    </div>
                    <div className="table-col amount">
                      ₱{order.totalAmount?.toFixed(2)}
                    </div>
                    <div className="table-col status">
                      <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="table-col actions">
                      <div className="action-buttons">
                        {/* Status Update Dropdown */}
                        {getNextStatusOptions(order.status).length > 0 && (
                          <select
                            value=""
                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                            disabled={isLoading}
                          >
                            <option value="">Update Status</option>
                            {getNextStatusOptions(order.status).map(status => (
                              <option key={status} value={status}>
                                Mark as {status}
                              </option>
                            ))}
                          </select>
                        )}
                        
                        {/* Cancel Button */}
                        {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                          <button
                            className="btn-cancel"
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={isLoading}
                          >
                            Cancel
                          </button>
                        )}
                        
                        {/* View Details Button */}
                        <button
                          className="btn-view"
                          onClick={() => alert(`Order Details: ${JSON.stringify(order, null, 2)}`)}
                        >
                          View
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
    </div>
  );
};

export default AdminOrders;