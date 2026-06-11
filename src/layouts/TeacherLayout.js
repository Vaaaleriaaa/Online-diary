import React from 'react';
import { Outlet } from 'react-router-dom';
import TeacherHeader from '../pages/teacher/TeacherHeader';

const StudentLayout = () => {
  
  return (
    <div>
      <TeacherHeader />
      <Outlet />
    </div>
  );
};

export default StudentLayout;