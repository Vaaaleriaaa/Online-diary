import React from 'react';
import { Route, Routes } from 'react-router-dom';
import TeacherLayout from '../layouts/TeacherLayout';
import TeacherJournal from '../pages/teacher/TeacherJournal';
import TeacherHomework from '../pages/teacher/TeacherHomework';
import TeacherSchedule from '../pages/teacher/TeacherSchedule';
import Profile from '../pages/Profile';

const TeacherRoutes = () => {
  return (
    <Routes>
      <Route element={<TeacherLayout />}>
        <Route index element={<TeacherSchedule />} />
        <Route path="schedule" element={<TeacherSchedule />} />
        <Route path="journal" element={<TeacherJournal />} />
        <Route path="homework" element={<TeacherHomework />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
};

export default TeacherRoutes;