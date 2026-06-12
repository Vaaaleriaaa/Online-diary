import React, { useState } from 'react';
import Select from '../UI/Select';
import Notification from '../UI/Notification';
import styles from './CreateClassModal.module.css';

const CreateClassModal = ({ isOpen, onClose, onSuccess }) => {
  const [newClass, setNewClass] = useState({ grade_year: '', grade_letter: '' });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'success' });
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

  const handleCreate = async () => {
    if (!newClass.grade_year || !newClass.grade_letter) {
      showNotification('Заполните год и букву класса', 'error');
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
          grade_letter: newClass.grade_letter.toUpperCase(),
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
            <label>Год обучения *</label>
            <Select
              value={newClass.grade_year}
              onChange={(e) => setNewClass({ ...newClass, grade_year: e.target.value })}
              options={gradeOptions}
              placeholder="Выберите год"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Буква класса *</label>
            <input
              type="text"
              maxLength="2"
              value={newClass.grade_letter}
              onChange={(e) => setNewClass({ ...newClass, grade_letter: e.target.value.toUpperCase() })}
              placeholder="Например: А, Б, В, Г"
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