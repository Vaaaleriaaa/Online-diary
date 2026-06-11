import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import AdminSchedule from '../pages/admin/AdminSchedule';
import Profile from '../pages/Profile';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminSchedule />} />
        <Route path="schedule" element={<AdminSchedule />} />
        <Route path="lesson-slots" element={<div>Ячейки расписания</div>} />
        <Route path="classes" element={<div>Классы</div>} />
        <Route path="load" element={<div>Нагрузка</div>} />
        <Route path="users" element={<div>Пользователи</div>} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;