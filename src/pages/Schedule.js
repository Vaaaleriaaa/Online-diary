import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import StudentSchedule from './student/Schedule';
import TeacherSchedule from './teacher/Schedule';
import AdminSchedule from './admin/schedule/AdminSchedule';

const Schedule = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!user) {
    return <div>Пользователь не найден</div>;
  }

  switch (user.role) {
    case 'student':
      return <StudentSchedule />;
    case 'teacher':
      return <TeacherSchedule />;
    case 'admin':
      return <AdminSchedule />;
    default:
      return <div>Неизвестная роль: {user.role}</div>;
  }
};

export default Schedule;