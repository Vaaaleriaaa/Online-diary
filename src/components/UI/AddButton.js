// src/components/UI/AddButton.js
import React from 'react';
import addIcon from '../../images/add.svg';
import styles from './ActionButtons.module.css';

const AddButton = ({ onClick, title = 'Добавить', text = 'Добавить', showText = true }) => {
  return (
    <button 
      onClick={onClick} 
      className={`${styles.addBtn} ${showText ? styles.withText : ''}`} 
      title={title}
    >
      <img src={addIcon} alt="Добавить" className={styles.icon} />
      {showText && <span className={styles.buttonText}>{text}</span>}
    </button>
  );
};

export default AddButton;