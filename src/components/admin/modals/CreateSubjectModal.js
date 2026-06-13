import React, { useState } from 'react';
import styles from './TeacherModals.module.css';
import Notification from '../../UI/Notification';

const CreateSubjectModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const token = localStorage.getItem('token');

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: 'success' });
    }, 3000);
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      showNotification('Введите название предмета', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/subject', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim() }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('Предмет успешно создан', 'success');
        onSuccess();
        setTimeout(() => {
          onClose();
          setName('');
        }, 1000);
      } else {
        showNotification(data.error || 'Ошибка создания предмета', 'error');
      }
    } catch (err) {
      console.error('Ошибка создания:', err);
      showNotification('Ошибка соединения', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setNotification({ message: '', type: 'success' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>Создание предмета</h2>
        
        <div className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label>Название предмета</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Математика, Русский язык, Физика"
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
              onClick={handleCreate}
              disabled={loading}
            >
              {loading ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </div>
      </div>
      
      <Notification 
        message={notification.message} 
        type={notification.type} 
        onClose={() => setNotification({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default CreateSubjectModal;