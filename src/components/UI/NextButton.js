import React from 'react';
import styles from './ActionButtons.module.css';
import nextlIcon from '../../images/next.svg'

const NextButton = ({ onClick, title = 'Дальше' }) => {
  return (    
    <button onClick={onClick} className={styles.nextlBtn} title={title}>
        <span>{title}</span>
        <img src={nextlIcon} alt="Дальше" className={styles.icon} />
    </button>
  );
};

export default NextButton;