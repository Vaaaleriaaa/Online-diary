import React from 'react';
import styles from './ActionButtons.module.css';
import nextlIcon from '../../images/next.svg'


const PrevButton = ({ onClick, title = 'Назад' }) => {
  
  return (    
    <button onClick={onClick} className={styles.prevBtn} title={title}>
        <img src={nextlIcon} alt="Назад" className={styles.icon} />
        <span>{title}</span>
    </button>
  );
};

export default PrevButton;