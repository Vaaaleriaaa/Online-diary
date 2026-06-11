import React from 'react';
import saveIcon from '../../images/save.svg';
import styles from './ActionButtons.module.css';

const SaveButton = ({ onClick, title = 'Сохранить' }) => {
  return (
    <button onClick={onClick} className={styles.saveBtn} title={title}>
      <img src={saveIcon} alt="Сохранить" className={styles.icon} />
    </button>
  );
};

export default SaveButton;