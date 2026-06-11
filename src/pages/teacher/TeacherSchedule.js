import React, { useCallback, useEffect, useState } from "react";
import styles from "./TeacherSchedule.module.css"
import useWeekNavigation from '../../hooks/useWeekNavigation';
import WeekNavigation from "../../components/UI/WeekNavigation";
import TeacherDaySchedule from "../../components/teacher/Diary/TeacherDaySchedule";
import { useAuth } from "../../contexts/AuthContext";

const TeacherSchedule = () => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const [scheduleData, setScheduleData] = useState(null);
  const [lessonSlots, setLessonSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const days = [
    { name: 'monday', displayName: 'Понедельник', value: 1, column: 'left' },
    { name: 'tuesday', displayName: 'Вторник', value: 2, column: 'left' },
    { name: 'wednesday', displayName: 'Среда', value: 3, column: 'left' },
    { name: 'thursday', displayName: 'Четверг', value: 4, column: 'right' },
    { name: 'friday', displayName: 'Пятница', value: 5, column: 'right' },
    { name: 'saturday', displayName: 'Суббота', value: 6, column: 'right' },
  ];

   const { 
    currentWeekDate, 
    setCurrentWeek, 
    getWeekDates, 
    formatWeekRange, 
    goToPrevWeek, 
    goToNextWeek 
  } = useWeekNavigation();
  
  const weekDates = getWeekDates(currentWeekDate);

  useEffect(() => {
    setCurrentWeek();
  }, [setCurrentWeek]);

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    try {
    const response = await fetch(`http://localhost:3000/lessons/teacher/${user.id}?weekDate=${currentWeekDate}`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    console.log(data);
    console.log(data.success);
    
    if (data.success) {
        setScheduleData(data.data);
    } else {
        setError(data.error);
    }
    } catch (err) {
      setError('Ошибка загрузки расписания');
    } finally {
    setLoading(false);
    }
  }, [token, user?.id, currentWeekDate]);

  // Загрузка ячеек расписания
  const fetchLessonSlots = useCallback(async () => {
    try {
    const response = await fetch('http://localhost:3000/schedule/slots', {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    if (data.success) {
        setLessonSlots(data.data);
    }
    } catch (err) {
    console.error('Ошибка загрузки слотов:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchLessonSlots();
  }, [fetchLessonSlots]);

  useEffect(() => {
    if (user?.id && currentWeekDate) {
      fetchSchedule();
    }
  }, [user?.id, currentWeekDate, fetchSchedule]);  

  const leftDays = days.filter(day => day.column === 'left');
  const rightDays = days.filter(day => day.column === 'right');

  const getLessonsForDay = (dayKey) => {
    if (!scheduleData?.schedule) return [];
    return scheduleData.schedule[dayKey] || [];
  };

  if (loading) return <div className={styles.loading}>Загрузка...</div>;
  if (error) return <div className={styles.error}>Ошибка: {error}</div>;

  return (
    <div className={styles.container}>
      <h2>Расписание</h2>
       <WeekNavigation 
          weekDates={weekDates}
          formatWeekRange={formatWeekRange}
          onPrevWeek={goToPrevWeek}
          onNextWeek={goToNextWeek}
      />

      <div className={styles.twoColumns}>
        <div className={styles.leftColumn}>
          {leftDays.map(day => (
            <TeacherDaySchedule
              key={day.value}
              dayName={day.displayName}    
              dayKey={day.name}         
              date={weekDates[day.displayName]}
              lessons={getLessonsForDay(day.name)}
              lessonSlots={lessonSlots}
            />
          ))}
        </div>

        <div className={styles.rightColumn}>
          {rightDays.map(day => (
            <TeacherDaySchedule
              key={day.value}
              dayName={day.displayName}
              dayKey={day.name}
              date={weekDates[day.displayName]}
              lessons={getLessonsForDay(day.name)} 
              lessonSlots={lessonSlots}
            />
          ))}
        </div>
      </div>
    </div>  
  );
}

export default TeacherSchedule;