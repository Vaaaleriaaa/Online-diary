// src/components/admin/modals/EditTeacherModal.js
import React, { useState, useEffect } from 'react';
import styles from './TeacherModals.module.css';
import Notification from '../../UI/Notification';

const EditTeacherModal = ({ isOpen, onClose, onSuccess, teacher }) => {
  const [formData, setFormData] = useState({
    last_name: '',
    first_name: '',
    patronymic: ''
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const token = localStorage.getItem('token');

  // ✅ Обновляем форму при изменении teacher
  useEffect(() => {
    if (teacher && isOpen) {
      setFormData({
        last_name: teacher.last_name || '',
        first_name: teacher.first_name || '',
        patronymic: teacher.patronymic || ''
      });
    }
  }, [teacher, isOpen]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: 'success' });
    }, 3000);
  };

  const handleUpdate = async () => {
    // ✅ Проверяем все три поля (фамилия, имя, отчество - обязательны)
    if (!formData.last_name || !formData.first_name || !formData.patronymic) {
      showNotification('Заполните все поля: фамилию, имя и отчество', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/users/${teacher.user_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.first_name,
          lastName: formData.last_name,
          patronymic: formData.patronymic,
          role: 'teacher'
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('Данные учителя обновлены', 'success');
        onSuccess();
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        showNotification(data.error || 'Ошибка обновления', 'error');
      }
    } catch (err) {
      console.error('Ошибка обновления:', err);
      showNotification('Ошибка соединения', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ last_name: '', first_name: '', patronymic: '' });
    setNotification({ message: '', type: 'success' });
    onClose();
  };

  if (!isOpen || !teacher) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>Редактирование учителя</h2>
        
        <div className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label>Фамилия</label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              placeholder="Введите фамилию"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Имя</label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              placeholder="Введите имя"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Отчество</label>
            <input
              type="text"
              value={formData.patronymic}
              onChange={(e) => setFormData({ ...formData, patronymic: e.target.value })}
              placeholder="Введите отчество"
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
              onClick={handleUpdate}
              disabled={loading}
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
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

export default EditTeacherModal;