import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from '../pages/admin/AdminHeader';

const AdminLayout = () => {
  
  return (
    <div>
      <AdminHeader />
      <Outlet />
    </div>
  );
};

export default AdminLayout;