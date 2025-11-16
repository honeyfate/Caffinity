import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomerDashboard from './CustomerDashboard';
import CustomerHome from './CustomerHome';
import CustomerCoffee from './CustomerCoffee';
import CustomerDesserts from './CustomerDesserts';
import CustomerCart from './CustomerCart';
import CustomerProfile from './CustomerProfile';
import '../css/CustomerLayout.css';

const CustomerLayout = () => {
  return (
    <div className="customer-layout">
      <CustomerDashboard />
      <main className="customer-main-content">
        <Routes>
          <Route path="/" element={<CustomerHome />} />
          <Route path="/coffee" element={<CustomerCoffee />} />
          <Route path="/desserts" element={<CustomerDesserts />} />
          <Route path="/cart" element={<CustomerCart />} />
          <Route path="/profile" element={<CustomerProfile />} />
        </Routes>
      </main>
    </div>
  );
};

export default CustomerLayout;