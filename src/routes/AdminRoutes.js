import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import AdminSchedule from '../pages/admin/AdminSchedule';
import Profile from '../pages/Profile';
import ClassManagement from '../pages/admin/ClassManagement';
import TeachersManagement from '../pages/admin/TeachersManagement';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminSchedule />} />
        <Route path="schedule" element={<AdminSchedule />} />
        <Route path="students" element={<ClassManagement />} />
        <Route path="teachers" element={<TeachersManagement />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;