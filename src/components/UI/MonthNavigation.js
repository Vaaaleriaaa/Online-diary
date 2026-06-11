// src/components/UI/MonthNavigation.js
import React from 'react';
import MonthButton from './MonthButton';
import styles from './MonthNavigation.module.css';

const MonthNavigation = ({ 
  months,           // массив месяцев
  selectedMonth,    // индекс выбранного месяца
  onMonthChange     // коллбэк при смене месяца
}) => {
  const monthColors = [
    '#A3C4F3', // Январь - красный
    '#90DBF4', // Февраль - желтый
    '#8EECF5', // Март - бирюзовый
    '#98F5E1', // Апрель - голубой
    '#B9FBC0', // Май - зеленый
    '#FFEAA7', // Июнь - светло-желтый
    '#DDA0DD', // Июль - сливовый
    '#98D8C8', // Август - мятный
    '#FBF8CC', // Сентябрь - персиковый
    '#FDE4CF', // Октябрь - светло-зеленый
    '#FFCFD2', // Ноябрь - лавандовый
    '#CFBAF0'  // Декабрь - розовый
  ];

  const getMonthColor = (index) => {
    return monthColors[index % monthColors.length];
  };

  return (
    <div className={styles.monthNavigation}>
      {months.map((month, index) => (
        <MonthButton
          key={month}
          month={month}
          isActive={selectedMonth === index}
          onClick={() => onMonthChange(index)}
          color={getMonthColor(index)}
        />
      ))}
    </div>
  );
};

export default MonthNavigation;