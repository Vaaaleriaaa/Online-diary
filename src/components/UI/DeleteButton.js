import React from 'react';
import deleteIcon from '../../images/delete.svg';
import styles from './ActionButtons.module.css';

const DeleteButton = ({ onClick, title = 'Удалить', confirmMessage }) => {
  const handleClick = () => {
    if (confirmMessage && !window.confirm(confirmMessage)) {
      return;
    }
    onClick();
  };

  return (
    <button onClick={handleClick} className={styles.deleteBtn} title={title}>
      <img src={deleteIcon} alt="Удалить" className={styles.icon} />
    </button>
  );
};

export default DeleteButton;