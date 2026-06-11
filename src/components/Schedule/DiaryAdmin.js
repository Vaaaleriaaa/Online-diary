import React, { useState, useEffect, useCallback, useRef } from 'react';
import ClassSelector from '../UI/ClassSelector';
import DaySchedule from './Diary/DaySchedule';
import styles from './DiaryAdmin.module.css';
import NextButton from '../UI/NextButton';
import PrevButton from '../UI/PrevButton';
import Notification from '../UI/Notification';

const DiaryAdmin = () => {
  const [selectedClassId, setSelectedClassId] = useState('');
  const [classes, setClasses] = useState([]);
  const [scheduleData, setScheduleData] = useState(null);
  const [lessonSlots, setLessonSlots] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentWeekDate, setCurrentWeekDate] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const notificationTimeoutRef = useRef(null);

  const days = [
    { name: 'monday', displayName: 'Понедельник', value: 1, column: 'left' },
    { name: 'tuesday', displayName: 'Вторник', value: 2, column: 'left' },
    { name: 'wednesday', displayName: 'Среда', value: 3, column: 'left' },
    { name: 'thursday', displayName: 'Четверг', value: 4, column: 'right' },
    { name: 'friday', displayName: 'Пятница', value: 5, column: 'right' },
    { name: 'saturday', displayName: 'Суббота', value: 6, column: 'right' },
  ];

  // Функции уведомлений
  const showNotification = (message, type = 'success') => {
    if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    setNotification({ message, type });
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 3000);
  };

  const clearNotification = () => {
    if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    setNotification({ message: '', type: '' });
  };

  // Получение даты понедельника текущей недели
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

  // Получение дат всех дней недели
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

  // Загрузка расписания класса - объявляем ПЕРВОЙ, так как она нужна в других функциях
  const fetchClassSchedule = useCallback(async () => {
    if (!selectedClassId) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://localhost:3000/lessons/class/${selectedClassId}?weekDate=${currentWeekDate}`, {
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
  }, [selectedClassId, currentWeekDate]);

  // Загрузка списка классов
  const fetchClasses = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3000/classes', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setClasses(data.data);
        if (data.data.length) setSelectedClassId(data.data[0].class_id);
      }
    } catch (err) {
      setError('Ошибка загрузки классов');
    }
  }, []);

  // Загрузка ячеек расписания
  const fetchLessonSlots = useCallback(async () => {
    const token = localStorage.getItem('token');
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
  }, []);

  // Загрузка назначений (предметы + учителя) для выбранного класса
  const fetchAssignments = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      // Получаем ВСЕ назначения
      const response = await fetch('http://localhost:3000/assignments', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        // Если выбран класс, фильтруем назначения для него
        if (selectedClassId) {
          const filtered = data.data.filter(a => a.class?.class_id === parseInt(selectedClassId));
          setAssignments(filtered);
        } else {
          setAssignments(data.data);
        }
      }
    } catch (err) {
      console.error('Ошибка загрузки назначений:', err);
    }
  }, [selectedClassId]);

  // Загрузка кабинетов
  const fetchRooms = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3000/rooms', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setRooms(data.data);
      }
    } catch (err) {
      console.error('Ошибка загрузки кабинетов:', err);
    }
  }, []);

  // Добавление урока
  const addLesson = async (lessonNumber, date, formData) => {
    const token = localStorage.getItem('token');
    const slot = lessonSlots.find(s => s.lesson_number === lessonNumber);
    
    if (!slot) {
      showNotification(`Слот для урока №${lessonNumber} не найден`, 'error');
      return;
    }
    
    const bodyData = {
      assignmentId: parseInt(formData.assignmentId),
      slotId: slot.slot_id,
      date: date,
      roomId: formData.roomId ? parseInt(formData.roomId) : null,
    };
    
    try {
      const response = await fetch('http://localhost:3000/lesson', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('Урок успешно добавлен', 'success');
        await fetchClassSchedule();
      } else {
        showNotification(data.error || 'Ошибка добавления урока', 'error');
      }
    } catch (err) {
      showNotification('Ошибка соединения с сервером', 'error');
    }
  };

 // Обновление урока
const updateLesson = async (lessonId, formData) => {
  const token = localStorage.getItem('token');
  
  // Находим текущий урок
  let currentLesson = null;
  if (scheduleData?.schedule) {
    for (const day of Object.values(scheduleData.schedule)) {
      const found = day.find(lesson => lesson.lesson_id === lessonId);
      if (found) {
        currentLesson = found;
        break;
      }
    }
  }
  
  if (!currentLesson) {
    showNotification('Не удалось найти урок', 'error');
    return;
  }
  
  console.log('=== ТЕКУЩИЙ УРОК ===');
  console.log('currentLesson.date (raw):', currentLesson.date);
  
  // ПРАВИЛЬНОЕ ФОРМАТИРОВАНИЕ ДАТЫ с учетом часового пояса
  let formattedDate;
  
  if (currentLesson.date) {
    // Создаем объект Date из строки
    const dateObj = new Date(currentLesson.date);
    
    // Получаем локальные компоненты даты
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    formattedDate = `${year}-${month}-${day}`;
    
    console.log('dateObj:', dateObj);
    console.log('formattedDate:', formattedDate);
  }
  
  // Находим slot
  const slot = lessonSlots.find(s => s.lesson_number === currentLesson.lesson_number);
  if (!slot) {
    showNotification('Слот не найден', 'error');
    return;
  }
  
  // Формируем данные
  const updateData = {
    assignmentId: formData.assignmentId ? parseInt(formData.assignmentId) : currentLesson.assignment_id,
    slotId: slot.slot_id,
    date: formattedDate, // Используем правильно отформатированную дату
    roomId: formData.roomId ? parseInt(formData.roomId) : currentLesson.room_id,
  };
  
  console.log('=== ОТПРАВЛЯЕМЫЕ ДАННЫЕ ===');
  console.log('updateData.date:', updateData.date);
  console.log('Полный updateData:', updateData);
  
  try {
    const response = await fetch(`http://localhost:3000/lesson/${lessonId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    const data = await response.json();
    console.log('=== ОТВЕТ СЕРВЕРА ===');
    console.log('Status:', response.status);
    console.log('Response:', data);
    
    if (data.success) {
      showNotification('Урок успешно изменен', 'success');
      await fetchClassSchedule();
    } else {
      showNotification(data.error || `Ошибка ${response.status}`, 'error');
    }
  } catch (err) {
    console.error('Update error:', err);
    showNotification('Ошибка соединения с сервером', 'error');
  }
};

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Токен пользователя:', token);
    
    // Проверьте роль пользователя
    const fetchUserRole = async () => {
      const response = await fetch('http://localhost:3000/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      console.log('Текущий пользователь:', data);
    };
    
    if (token) {
      fetchUserRole();
    }
  }, []);

  // Удаление урока
  const deleteLesson = async (lessonId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/lesson/${lessonId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        showNotification('Урок удален', 'success');
        await fetchClassSchedule();
      } else {
        showNotification(data.error || 'Ошибка удаления урока', 'error');
      }
    } catch (err) {
      showNotification('Ошибка удаления урока', 'error');
    }
  };

  // Навигация по неделям
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

  // useEffect для начальной загрузки данных
  useEffect(() => {
    const init = async () => {
      await fetchClasses();
      await fetchLessonSlots();
      await fetchRooms();
    };
    init();
  }, []);

  // Загрузка назначений при выборе класса
  useEffect(() => {
    if (selectedClassId) {
      fetchAssignments();
    }
  }, [selectedClassId]);

  // Установка текущей недели
  useEffect(() => {
    setCurrentWeekDate(getCurrentWeekMonday());
  }, []);

  // Загрузка расписания при выборе класса или смене недели
  useEffect(() => {
    if (selectedClassId && currentWeekDate) {
      fetchClassSchedule();
    }
  }, [selectedClassId, currentWeekDate]);

  const weekDates = currentWeekDate ? getWeekDates(currentWeekDate) : {};
  const leftDays = days.filter(day => day.column === 'left');
  const rightDays = days.filter(day => day.column === 'right');

  const getLessonsForDay = (dayKey) => {
    if (!scheduleData?.schedule) return [];
    return scheduleData.schedule[dayKey] || [];
  };

  const classItems = classes.map(c => ({
    id: c.class_id,
    name: c.name
  }));

  const roomOptions = rooms.map(r => ({
    value: r.room_id,
    label: r.number
  }));

  if (loading) return <div className={styles.loading}>Загрузка...</div>;
  if (error) return <div className={styles.error}>Ошибка: {error}</div>;

  return (
    <div className={styles.diaryAdmin}>
      <Notification 
        message={notification.message} 
        type={notification.type} 
        onClose={clearNotification}
      />
      
      <div className={styles.weekNavigation}>
        <PrevButton onClick={goToPrevWeek} title='Предыдущая неделя' />
        <span className={styles.weekRange}>
          {weekDates['Понедельник'] && `${weekDates['Понедельник']} - ${weekDates['Суббота']}`}
        </span>
        <NextButton onClick={goToNextWeek} title='Следующая неделя'/>
      </div>

      <ClassSelector
        items={classItems}
        selectedId={selectedClassId}
        onSelectedIdChange={setSelectedClassId}
        placeholder="Выберите класс"
      />

      <div className={styles.twoColumns}>
        <div className={styles.leftColumn}>
          {leftDays.map(day => (
            <DaySchedule
              key={day.value}
              dayName={day.displayName}    
              dayKey={day.name}         
              date={weekDates[day.displayName]}
              lessons={getLessonsForDay(day.name)}
              lessonSlots={lessonSlots}
              assignments={assignments}
              roomOptions={roomOptions}
              onAddLesson={addLesson}
              onUpdateLesson={updateLesson}
              onDeleteLesson={deleteLesson}
            />
          ))}
        </div>

        <div className={styles.rightColumn}>
          {rightDays.map(day => (
            <DaySchedule
              key={day.value}
              dayName={day.displayName}
              dayKey={day.name}
              date={weekDates[day.displayName]}
              lessons={getLessonsForDay(day.name)} 
              lessonSlots={lessonSlots}
              assignments={assignments}
              roomOptions={roomOptions}
              onAddLesson={addLesson}
              onUpdateLesson={updateLesson}
              onDeleteLesson={deleteLesson}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiaryAdmin;