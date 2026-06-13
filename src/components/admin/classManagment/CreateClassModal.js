import React, { useState } from 'react';
import styles from '../modals/TeacherModals.module.css';
import { validateGradeLetter } from '../../../utils/validation';
import Notification from '../../UI/Notification';
import Select from '../../UI/Select';

const CreateClassModal = ({ isOpen, onClose, onSuccess }) => {
  const [newClass, setNewClass] = useState({ grade_year: '', grade_letter: '' });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const [letterError, setLetterError] = useState('');
  const token = localStorage.getItem('token');

  const gradeOptions = [...Array(11)].map((_, i) => ({ 
    value: i + 1, 
    label: `${i + 1}` 
  }));

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
    setNewClass({ ...newClass, grade_letter: validation.isValid ? validation.value : value.toUpperCase() });
  };

  const handleCreate = async () => {
    // Валидация буквы
    const letterValidation = validateGradeLetter(newClass.grade_letter);
    if (!letterValidation.isValid) {
      showNotification(letterValidation.message, 'error');
      return;
    }

    if (!newClass.grade_year) {
      showNotification('Выберите год обучения', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/class', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grade_year: parseInt(newClass.grade_year),
          grade_letter: letterValidation.value,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('Класс успешно создан', 'success');
        onSuccess();
        handleClose();
      } else {
        showNotification(data.error || 'Ошибка создания класса', 'error');
      }
    } catch (err) {
      console.error('Ошибка создания класса:', err);
      showNotification('Ошибка соединения', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewClass({ grade_year: '', grade_letter: '' });
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
        <h2>Добавление класса</h2>
        
        <div className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label>Год обучения</label>
            <Select
              value={newClass.grade_year}
              onChange={(e) => setNewClass({ ...newClass, grade_year: e.target.value })}
              options={gradeOptions}
              placeholder="Выберите год"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Буква класса</label>
            <input
              type="text"
              maxLength="1"
              value={newClass.grade_letter}
              onChange={(e) => handleLetterChange(e.target.value)}
              placeholder="Например: А, Б, В, Г"
              className={`${styles.input} ${letterError ? styles.inputError : ''}`}
            />
            {letterError && <small className={styles.errorHint}>{letterError}</small>}
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
              onClick={handleCreate}
              disabled={loading}
            >
              {loading ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateClassModal;