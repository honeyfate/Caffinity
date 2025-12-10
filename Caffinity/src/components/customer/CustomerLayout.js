import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomerDashboard from './CustomerDashboard';
import CustomerHome from './CustomerHome';
import CustomerCoffee from './CustomerCoffee';
import CustomerDesserts from './CustomerDesserts';
import CustomerCart from './CustomerCart';
import CustomerProfile from './CustomerProfile';
import '../css/CustomerLayout.css';
import CustomerOrders from './CustomerOrders';
const CustomerLayout = () => {
  return (
    <div className="customer-layout">
      <CustomerDashboard />
      <main className="customer-main-content">
        <Routes>
          <Route path="/" element={<CustomerHome />} />
          <Route path="/coffee" element={<div className="coffee-page-background"><CustomerCoffee /></div>} />
          <Route path="/desserts" element={<CustomerDesserts />} />
          <Route path="/cart" element={<CustomerCart />} />
          <Route path="/orders" element={<CustomerOrders />} />
          <Route path="/profile" element={<CustomerProfile />} />
        </Routes>
      </main>
    </div>
  );
};

export default CustomerLayout;