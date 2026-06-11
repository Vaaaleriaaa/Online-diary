import { useState, useCallback } from 'react';

const useMonthNavigation = (initialMonth = new Date().getMonth()) => {
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  // Получить текущий месяц (1-12 для API)
  const getCurrentMonthNumber = useCallback(() => {
    return selectedMonth + 1;
  }, [selectedMonth]);

  // Получить название текущего месяца
  const getCurrentMonthName = useCallback(() => {
    return months[selectedMonth];
  }, [months, selectedMonth]);

  // Переключение на предыдущий месяц
  const goToPrevMonth = useCallback(() => {
    setSelectedMonth(prev => {
      if (prev === 0) {
        setSelectedYear(year => year - 1);
        return 11;
      }
      return prev - 1;
    });
  }, []);

  // Переключение на следующий месяц
  const goToNextMonth = useCallback(() => {
    setSelectedMonth(prev => {
      if (prev === 11) {
        setSelectedYear(year => year + 1);
        return 0;
      }
      return prev + 1;
    });
  }, []);

  // Установка месяца по индексу
  const setMonth = useCallback((monthIndex) => {
    setSelectedMonth(monthIndex);
  }, []);

  // Получить количество дней в месяце
  const getDaysInMonth = useCallback(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedYear, selectedMonth]);

  // Получить массив дней месяца
  const getMonthDays = useCallback(() => {
    const daysCount = getDaysInMonth();
    return Array.from({ length: daysCount }, (_, i) => i + 1);
  }, [getDaysInMonth]);

  return {
    selectedMonth,
    selectedYear,
    months,
    setSelectedMonth,
    setSelectedYear,
    getCurrentMonthNumber,
    getCurrentMonthName,
    goToPrevMonth,
    goToNextMonth,
    setMonth,
    getDaysInMonth,
    getMonthDays
  };
};

export default useMonthNavigation;