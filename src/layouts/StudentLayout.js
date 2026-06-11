import React from 'react';
import { Outlet } from 'react-router-dom';
import StudentHeader from '../pages/student/StudentHeader';

const StudentLayout = () => {
  
  return (
    <div>
      <StudentHeader />
      <Outlet />
    </div>
  );
};

export default StudentLayout;