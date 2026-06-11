import React from 'react';
import editIcon from '../../images/edit.svg';
import styles from './ActionButtons.module.css';

const EditButton = ({ onClick, title = 'Редактировать' }) => {
  return (
    <button onClick={onClick} className={styles.editBtn} title={title}>
      <img src={editIcon} alt="Редактировать" className={styles.icon} />
    </button>
  );
};

export default EditButton;