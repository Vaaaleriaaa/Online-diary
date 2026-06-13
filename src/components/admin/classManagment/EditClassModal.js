import React, { useState } from 'react';
import styles from '../modals/TeacherModals.module.css';
import { validateGradeLetter } from '../../../utils/validation';
import Notification from '../../UI/Notification';

const EditClassModal = ({ isOpen, onClose, onSuccess, classData, classOptions }) => {
  const [gradeLetter, setGradeLetter] = useState(classData?.grade_letter || '');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const [letterError, setLetterError] = useState('');
  const token = localStorage.getItem('token');

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: 'success' });
    }, 3000);
  };

  const handleLetterChange = (value) => {
    const validation = validateGradeLetter(value);
    if (!validation.isValid && value !== '') {
      setLetterError(validation.message);
    } else {
      setLetterError('');
    }
    setGradeLetter(validation.isValid ? validation.value : value.toUpperCase());
  };

  const handleSave = async () => {
    const letterValidation = validateGradeLetter(gradeLetter);
    if (!letterValidation.isValid) {
      showNotification(letterValidation.message, 'error');
      return;
    }

    if (gradeLetter === classData.grade_letter) {
      showNotification('Буква класса не изменилась', 'info');
      onClose();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/class/${classData.class_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grade_letter: letterValidation.value,
        }),
      });

      const data = await response.json();
      if (data.success) {
        showNotification('Класс успешно обновлен', 'success');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      } else {
        showNotification(data.error || 'Ошибка обновления класса', 'error');
      }
    } catch (err) {
      console.error('Ошибка:', err);
      showNotification('Ошибка соединения', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setGradeLetter('');
    setLetterError('');
    setNotification({ message: '', type: 'success' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <Notification 
        message={notification.message} 
        type={notification.type} 
        onClose={() => setNotification({ message: '', type: 'success' })}
      />
      
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Редактирование класса</h2>
          <button className={styles.closeBtn} onClick={handleClose}>×</button>
        </div>
        
        <div className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label>Год обучения</label>
            <input
              type="text"
              className={styles.input}
              value={`${classData.grade_year} класс`}
              disabled
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
            <small className={styles.hint}>Год обучения изменить нельзя</small>
          </div>
          
          <div className={styles.formGroup}>
            <label>Буква класса</label>
            <input
              type="text"
              maxLength="1"
              className={`${styles.input} ${letterError ? styles.inputError : ''}`}
              value={gradeLetter}
              onChange={(e) => handleLetterChange(e.target.value)}
              placeholder="Например: А, Б, В, Г"
              autoFocus
            />
          </div>
          
          <div className={styles.modalActions}>
            <button 
              className={styles.cancelModalBtn} 
              onClick={handleClose}
              disabled={loading}
            >
              Отмена
            </button>
            <button 
              className={styles.saveModalBtn} 
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditClassModal;