import React from 'react';

const AdminHome = () => {
  // Sample data for demonstration
  const dashboardStats = {
    totalOrders: 156,
    totalRevenue: 12540,
    activeProducts: 24,
    pendingOrders: 8,
    customerSatisfaction: 94,
    monthlyGrowth: 12
  };

  const recentActivities = [
    { id: 1, action: 'New order received', time: '5 min ago', status: 'pending' },
    { id: 2, action: 'Coffee stock updated', time: '1 hour ago', status: 'completed' },
    { id: 3, action: 'New dessert added', time: '2 hours ago', status: 'completed' },
    { id: 4, action: 'Customer review received', time: '3 hours ago', status: 'pending' }
  ];

  return (
    <div className="admin-home">
      <div className="welcome-section">
        <h1>Admin Dashboard</h1>
        <p>Welcome back! Here's what's happening with your cafe today.</p>
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
            <p>Total orders processed this month</p>
          </div>
          <div className="card-stats">
            <div>
              <div className="stat-value">{dashboardStats.totalOrders}</div>
              <div className="stat-label">Orders</div>
            </div>
            <span className="status-badge status-active">+12%</span>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="content-card">
          <div className="card-header">
            <div className="card-icon">💰</div>
            <h3 className="card-title">Total Revenue</h3>
          </div>
          <div className="card-content">
            <p>Revenue generated this month</p>
          </div>
          <div className="card-stats">
            <div>
              <div className="stat-value">${dashboardStats.totalRevenue}</div>
              <div className="stat-label">Revenue</div>
            </div>
            <span className="status-badge status-active">+8%</span>
          </div>
        </div>

        {/* Products Card */}
        <div className="content-card">
          <div className="card-header">
            <div className="card-icon">☕</div>
            <h3 className="card-title">Active Products</h3>
          </div>
          <div className="card-content">
            <p>Coffee and dessert items available</p>
          </div>
          <div className="card-stats">
            <div>
              <div className="stat-value">{dashboardStats.activeProducts}</div>
              <div className="stat-label">Products</div>
            </div>
            <div className="card-actions">
              <button className="card-btn">Manage</button>
            </div>
          </div>
        </div>

        {/* Pending Orders Card */}
        <div className="content-card">
          <div className="card-header">
            <div className="card-icon">⏰</div>
            <h3 className="card-title">Pending Orders</h3>
          </div>
          <div className="card-content">
            <p>Orders waiting for processing</p>
          </div>
          <div className="card-stats">
            <div>
              <div className="stat-value">{dashboardStats.pendingOrders}</div>
              <div className="stat-label">Pending</div>
            </div>
            <span className="status-badge status-pending">Action needed</span>
          </div>
          <div className="card-actions">
            <button className="card-btn">View Orders</button>
          </div>
        </div>

        {/* Customer Satisfaction Card */}
        <div className="content-card">
          <div className="card-header">
            <div className="card-icon">⭐</div>
            <h3 className="card-title">Customer Satisfaction</h3>
          </div>
          <div className="card-content">
            <p>Based on recent customer reviews</p>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${dashboardStats.customerSatisfaction}%` }}
              ></div>
            </div>
          </div>
          <div className="card-stats">
            <div>
              <div className="stat-value">{dashboardStats.customerSatisfaction}%</div>
              <div className="stat-label">Satisfaction Rate</div>
            </div>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="content-card">
          <div className="card-header">
            <div className="card-icon">📊</div>
            <h3 className="card-title">Recent Activity</h3>
          </div>
          <div className="card-content">
            {recentActivities.map(activity => (
              <div key={activity.id} style={{ 
                padding: '10px 0', 
                borderBottom: '1px solid rgba(139, 69, 19, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ color: '#e8d5b5', fontWeight: '500' }}>{activity.action}</div>
                  <div style={{ color: '#e8d5b5', opacity: '0.7', fontSize: '0.9rem' }}>{activity.time}</div>
                </div>
                <span className={`status-badge ${activity.status === 'pending' ? 'status-pending' : 'status-active'}`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
          <div className="card-actions">
            <button className="card-btn secondary">View All</button>
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
          <p>Frequently used admin actions</p>
        </div>
        <div className="card-actions">
          <button className="card-btn">Add New Product</button>
          <button className="card-btn secondary">View Reports</button>
          <button className="card-btn secondary">Manage Inventory</button>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;