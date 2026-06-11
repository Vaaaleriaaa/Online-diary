import React from 'react';
import { Route, Routes } from 'react-router-dom';
import StudentLayout from '../layouts/StudentLayout';
import StudentHomework from '../pages/student/StudentHomework';
import StudentSchedule from '../pages/student/StudentShedule';
import StudentJournal from '../pages/student/StudentJournal';
import Profile from '../pages/Profile';

const StudentRoutes = () => {
  return (
    <Routes>
      <Route element={<StudentLayout />}>
        <Route index element={<StudentSchedule />} />
        <Route path="schedule" element={<StudentSchedule />} />
        <Route path="journal" element={<StudentJournal />} />
        <Route path="homework" element={<StudentHomework />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
};

export default StudentRoutes;