// components/admin/AdminLayout.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardContent from './DashboardContent';
import AdminHome from './AdminHome';
import AdminCoffee from './AdminCoffee';
import AdminDesserts from './AdminDesserts';
import AdminOrders from './AdminOrders';
import AdminProfile from './AdminProfile';

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <DashboardContent />
      <main className="admin-main-content">
        <Routes>
          <Route path="/" element={<AdminHome />} />
          <Route path="/coffee" element={<AdminCoffee />} />
          <Route path="/desserts" element={<AdminDesserts />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/profile" element={<AdminProfile />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminLayout;