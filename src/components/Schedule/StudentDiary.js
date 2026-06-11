// src/components/student/StudentDiary.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PrevButton from '../UI/PrevButton';
import NextButton from '../UI/NextButton';
import styles from './StudentDiary.module.css';

const StudentDiary = () => {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentWeekDate, setCurrentWeekDate] = useState('');
  const [error, setError] = useState('');
  const [classId, setClassId] = useState(null);
  const [className, setClassName] = useState('');
  const [isLoadingClass, setIsLoadingClass] = useState(true);
  const token = localStorage.getItem('token');

  const days = [
    { name: 'monday', displayName: 'Понедельник' },
    { name: 'tuesday', displayName: 'Вторник' },
    { name: 'wednesday', displayName: 'Среда' },
    { name: 'thursday', displayName: 'Четверг' },
    { name: 'friday', displayName: 'Пятница' },
    { name: 'saturday', displayName: 'Суббота' },
  ];

  const getCurrentWeekMonday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysToMonday);
    
    const year = monday.getFullYear();
    const month = String(monday.getMonth() + 1).padStart(2, '0');
    const day = String(monday.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getWeekDates = (mondayDate) => {
    if (!mondayDate) return {};
    const [year, month, day] = mondayDate.split('-').map(Number);
    const weekDates = {};
    const daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    
    daysOfWeek.forEach((dayName, index) => {
      const date = new Date(year, month - 1, day + index);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      weekDates[dayName] = `${y}-${m}-${d}`;
    });
    
    return weekDates;
  };

  // Получаем класс ученика
  const fetchStudentClass = useCallback(async () => {
    const userId = user?.id;
    
    if (!userId) {
      console.error('Нет user.id в контексте');
      setError('Не удалось определить пользователя');
      setIsLoadingClass(false);
      return;
    }
    
    setIsLoadingClass(true);
    
    try {
      const response = await fetch(`http://localhost:3000/student/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success && data.data) {
        if (data.data.class && data.data.class.class_id) {
          setClassId(data.data.class.class_id);
          setClassName(data.data.class.class_name);
        } else {
          setError('Ученик не привязан к классу. Обратитесь к администратору.');
        }
      } else {
        setError(data.error || 'Ошибка получения информации об ученике');
      }
    } catch (err) {
      console.error('Ошибка:', err);
      setError('Ошибка получения информации о классе');
    } finally {
      setIsLoadingClass(false);
    }
  }, [user, token]);

  // Получаем расписание класса
  const fetchSchedule = useCallback(async () => {
    if (!classId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/lessons/class/${classId}?weekDate=${currentWeekDate}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        setSchedule(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Ошибка загрузки расписания');
    } finally {
      setLoading(false);
    }
  }, [token, classId, currentWeekDate]);

  useEffect(() => {
    if (user?.id) {
      fetchStudentClass();
    }
  }, [user, fetchStudentClass]);

  useEffect(() => {
    setCurrentWeekDate(getCurrentWeekMonday());
  }, []);

  useEffect(() => {
    if (classId && currentWeekDate) {
      fetchSchedule();
    }
  }, [classId, currentWeekDate, fetchSchedule]);

  const goToPrevWeek = () => {
    const currentMonday = new Date(currentWeekDate);
    currentMonday.setDate(currentMonday.getDate() - 7);
    const year = currentMonday.getFullYear();
    const month = String(currentMonday.getMonth() + 1).padStart(2, '0');
    const day = String(currentMonday.getDate()).padStart(2, '0');
    setCurrentWeekDate(`${year}-${month}-${day}`);
  };

  const goToNextWeek = () => {
    const currentMonday = new Date(currentWeekDate);
    currentMonday.setDate(currentMonday.getDate() + 7);
    const year = currentMonday.getFullYear();
    const month = String(currentMonday.getMonth() + 1).padStart(2, '0');
    const day = String(currentMonday.getDate()).padStart(2, '0');
    setCurrentWeekDate(`${year}-${month}-${day}`);
  };

  const weekDates = getWeekDates(currentWeekDate);

  if (isLoadingClass) {
    return <div className={styles.loading}>Определение класса ученика...</div>;
  }
  
  if (error) {
    return <div className={styles.error}>Ошибка: {error}</div>;
  }
  
  if (!classId) {
    return <div className={styles.loading}>Класс не найден. Обратитесь к администратору.</div>;
  }
  
  if (loading && !schedule) {
    return <div className={styles.loading}>Загрузка расписания...</div>;
  }

  return (
    <div className={styles.studentDiary}>
      <div className={styles.header}>
        <h1>Расписание</h1>
        <div className={styles.classInfo}>{className}</div>
      </div>
      <div className={styles.weekNavigation}>
        <PrevButton onClick={goToPrevWeek} title="Предыдущая неделя" />
        <span className={styles.weekRange}>
          {weekDates['Понедельник'] && `${weekDates['Понедельник']} - ${weekDates['Суббота']}`}
        </span>
        <NextButton onClick={goToNextWeek} title="Следующая неделя" />
      </div>

      <div className={styles.diaryGrid}>
        {days.map(day => (
          <div key={day.name} className={styles.dayCard}>
            <h3 className={styles.dayTitle}>
              {day.displayName}
              <span className={styles.dayDate}>
                {weekDates[day.displayName]?.split('-').reverse().join('.')}
              </span>
            </h3>
            <div className={styles.tableWrapper}>
              <table className={styles.diaryTable}>
                <thead>
                  <tr>
                    <th>№</th>
                    <th>Предмет</th>
                    <th>Учитель</th>
                    <th>Кабинет</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule?.schedule?.[day.name]?.map((lesson, idx) => (
                    <tr key={lesson.lesson_id || idx}>
                      <td className={styles.lessonNumber}>{lesson.lesson_number}</td>
                      <td className={styles.subjectName}>{lesson.subject_name}</td>
                      <td className={styles.teacherName}>
                        {lesson.teacher_last_name} {lesson.teacher_first_name}
                      </td>
                      <td className={styles.roomNumber}>{lesson.room_number || '—'}</td>
                    </tr>
                  ))}
                  {/* Пустые строки до 8 уроков */}
                  {(!schedule?.schedule?.[day.name] || schedule.schedule[day.name].length < 8) && 
                    [...Array(8 - (schedule?.schedule?.[day.name]?.length || 0))].map((_, idx) => (
                      <tr key={`empty-${idx}`}>
                        <td className={styles.lessonNumber}>
                          {idx + (schedule?.schedule?.[day.name]?.length || 0) + 1}
                        </td>
                        <td colSpan="3" className={styles.emptyCell}>—</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentDiary;