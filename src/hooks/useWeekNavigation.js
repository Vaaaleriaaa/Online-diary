import { useState, useCallback } from 'react';

const useWeekNavigation = () => {
  const [currentWeekDate, setCurrentWeekDate] = useState('');

  // Получение даты понедельника текущей недели
  const getCurrentWeekMonday = useCallback(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysToMonday);
    
    const year = monday.getFullYear();
    const month = String(monday.getMonth() + 1).padStart(2, '0');
    const day = String(monday.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Получение дат всех дней недели
  const getWeekDates = useCallback((mondayDate) => {
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
  }, []);

  // Форматирование диапазона дат для отображения (ДД.ММ.ГГГГ - ДД.ММ.ГГГГ)
  const formatWeekRange = useCallback((weekDates) => {
    if (!weekDates['Понедельник'] || !weekDates['Суббота']) return '';
    
    const formatDate = (dateString) => {
      const [year, month, day] = dateString.split('-');
      return `${day}.${month}.${year}`;
    };
    
    return `${formatDate(weekDates['Понедельник'])} - ${formatDate(weekDates['Суббота'])}`;
  }, []);

  // Переход на предыдущую неделю
  const goToPrevWeek = useCallback(() => {
    setCurrentWeekDate(prev => {
      const currentMonday = new Date(prev);
      currentMonday.setDate(currentMonday.getDate() - 7);
      const year = currentMonday.getFullYear();
      const month = String(currentMonday.getMonth() + 1).padStart(2, '0');
      const day = String(currentMonday.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });
  }, []);

  // Переход на следующую неделю
  const goToNextWeek = useCallback(() => {
    setCurrentWeekDate(prev => {
      const currentMonday = new Date(prev);
      currentMonday.setDate(currentMonday.getDate() + 7);
      const year = currentMonday.getFullYear();
      const month = String(currentMonday.getMonth() + 1).padStart(2, '0');
      const day = String(currentMonday.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });
  }, []);

  // Установка текущей недели
  const setCurrentWeek = useCallback(() => {
    setCurrentWeekDate(getCurrentWeekMonday());
  }, [getCurrentWeekMonday]);

  return {
    currentWeekDate,
    setCurrentWeekDate,
    setCurrentWeek,
    getWeekDates,
    formatWeekRange,
    goToPrevWeek,
    goToNextWeek
  };
};

export default useWeekNavigation;