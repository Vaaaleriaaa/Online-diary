import React from 'react';
import cancelIcon from '../../images/cancel.svg';
import styles from './ActionButtons.module.css';

const CancelButton = ({ onClick, title = 'Отмена' }) => {
  return (
    <button onClick={onClick} className={styles.cancelBtn} title={title}>
      <img src={cancelIcon} alt="Отмена" className={styles.icon} />
    </button>
  );
};

export default CancelButton;