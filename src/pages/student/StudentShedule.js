import React, { useCallback, useEffect, useState } from "react";
import styles from "./StudentSchedule.module.css"
import useWeekNavigation from '../../hooks/useWeekNavigation';
import WeekNavigation from "../../components/UI/WeekNavigation";
import StudentDaySchedule from "../../components/student/Diary/StudentDaySchedule";
import { useAuth } from "../../contexts/AuthContext";

const StudentSchedule = () => {

  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const [scheduleData, setScheduleData] = useState(null);
  const [lessonSlots, setLessonSlots] = useState([]);
  const [classId, setClassId] = useState(null);
  const [className, setClassName] = useState('');
  const [isLoadingClass, setIsLoadingClass] = useState(true);
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
          setScheduleData(data.data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Ошибка загрузки расписания');
      } finally {
        setLoading(false);
      }
    }, [token, classId, currentWeekDate]);

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
    if (user?.id) {
      fetchStudentClass();
    }
  }, [user, fetchStudentClass]);

  useEffect(() => {
    if (classId && currentWeekDate) {
      fetchSchedule();
    }
  }, [classId, currentWeekDate, fetchSchedule]);

  const leftDays = days.filter(day => day.column === 'left');
  const rightDays = days.filter(day => day.column === 'right');

  const getLessonsForDay = (dayKey) => {
    if (!scheduleData?.schedule) return [];
    return scheduleData.schedule[dayKey] || [];
  };

  if (isLoadingClass) {
    return <div className={styles.loading}>Определение класса ученика...</div>;
  }

  if (error) {
    return <div className={styles.error}>Ошибка: {error}</div>;
  }

  if (!classId) {
    return <div className={styles.loading}>Класс не найден. Обратитесь к администратору.</div>;
  }

  if (loading && !scheduleData) {
    return <div className={styles.loading}>Загрузка расписания...</div>;
  }

  return (
    <div className={styles.container}>
      <h2>Расписание {className}</h2>

      <WeekNavigation 
        weekDates={weekDates}
        formatWeekRange={formatWeekRange}
        onPrevWeek={goToPrevWeek}
        onNextWeek={goToNextWeek}
      />

      <div className={styles.twoColumns}>
        <div className={styles.leftColumn}>
          {leftDays.map(day => (
            <StudentDaySchedule
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
            <StudentDaySchedule
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
    )
}

export default StudentSchedule;