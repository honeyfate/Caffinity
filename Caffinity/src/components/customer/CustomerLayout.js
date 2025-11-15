import React from 'react';
import { Outlet } from 'react-router-dom';
import CustomerDashboard from './CustomerDashboard'; // This would be just the header

const CustomerLayout = () => {
  return (
    <div className="customer-layout">
      <CustomerDashboard /> {/* This would be modified to only contain the header */}
      <main className="customer-main-content">
        <Outlet /> {/* This renders the child routes */}
      </main>
    </div>
  );
};

export default CustomerLayout;