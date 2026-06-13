import React, { useState } from 'react';
import styles from './TeacherModals.module.css';
import Notification from '../../UI/Notification';

const CreateTeacherModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    last_name: '',
    first_name: '',
    patronymic: ''
  });
  const [createdUser, setCreatedUser] = useState(null);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const token = localStorage.getItem('token');

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: 'success' });
    }, 3000);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showNotification('Скопировано в буфер обмена', 'success');
    } catch (err) {
      console.error('Ошибка копирования:', err);
      showNotification('Ошибка копирования', 'error');
    }
  };

  const handleCreate = async () => {
    if (!formData.last_name || !formData.first_name || !formData.patronymic) {
      showNotification('Заполните все поля: фамилию, имя и отчество', 'error');
      return;
    }
    
    setLoading(true);
    const password = generatePassword();
    
    try {
      const response = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: password,
          firstName: formData.first_name,
          lastName: formData.last_name,
          patronymic: formData.patronymic,
          role: 'teacher',
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.data) {
        // ✅ Сохраняем данные созданного пользователя и пароль
        setCreatedUser(data.data);
        setGeneratedPassword(password);
        setStep('password');
        onSuccess();
      } else {
        showNotification(data.error || 'Ошибка создания', 'error');
      }
    } catch (err) {
      console.error('Ошибка создания:', err);
      showNotification('Ошибка соединения', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (step === 'password') {
      onSuccess();
    }
    setStep('form');
    setCreatedUser(null);
    setGeneratedPassword('');
    setFormData({ last_name: '', first_name: '', patronymic: '' });
    setNotification({ message: '', type: 'success' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {step === 'form' ? (
          <>
            <h2>Создание учителя</h2>
            
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
          </>
        ) : (
          <>
            <h2 className={styles.successTitle}>Учитель успешно создан!</h2>
            
            <div className={styles.passwordSection}>
              <p className={styles.passwordLabel}>Логин для входа:</p>
              <div className={styles.infoBox}>
                <code className={styles.infoCode}>{createdUser?.login}</code>
              </div>
              
              <p className={styles.passwordLabel}>Сгенерированный пароль:</p>
              <div className={styles.passwordBox}>
                <code className={styles.passwordCode}>{generatedPassword}</code>
              </div>
            </div>
            
            <div className={styles.modalActions}>
              <button 
                className={styles.closeModalBtn}
                onClick={handleClose}
              >
                Закрыть
              </button>
            </div>
          </>
        )}
      </div>
      
      <Notification 
        message={notification.message} 
        type={notification.type} 
        onClose={() => setNotification({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default CreateTeacherModal;