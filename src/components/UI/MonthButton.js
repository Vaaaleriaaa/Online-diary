import React from 'react';
import styles from './MonthButton.module.css';

const MonthButton = ({ month, onClick, isActive, color = '#4a90e2' }) => {
  return (
    <button
      className={`${styles.monthButton} ${isActive ? styles.active : ''}`}
      onClick={() => onClick(month)}
      style={{ '--button-color': color }}
    >
      {month}
    </button>
  );
};

export default MonthButton;