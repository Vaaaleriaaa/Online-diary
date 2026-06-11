import React from 'react';
import PrevButton from './PrevButton';
import NextButton from './NextButton';
import styles from './WeekNavigation.module.css';

const WeekNavigation = ({ 
  weekDates, 
  formatWeekRange, 
  onPrevWeek, 
  onNextWeek 
}) => {
  return (
    <div className={styles.weekNavigation}>
      <PrevButton onClick={onPrevWeek} title="Предыдущая неделя" />
      <span className={styles.weekRange}>
        {formatWeekRange(weekDates)}
      </span>
      <NextButton onClick={onNextWeek} title="Следующая неделя" />
    </div>
  );
};

export default WeekNavigation;