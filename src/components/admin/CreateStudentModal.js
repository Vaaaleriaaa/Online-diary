// src/components/admin/CreateStudentModal.js
import React, { useState } from 'react';
import Select from '../UI/Select';
import AddButton from '../UI/AddButton';
import styles from './CreateStudentModal.module.css';

const CreateStudentModal = ({ isOpen, onClose, onSuccess, classOptions }) => {
  const [step, setStep] = useState('form'); // 'form' или 'password'
  const [newStudent, setNewStudent] = useState({
    last_name: '',
    first_name: '',
    patronymic: '',
    class_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const token = localStorage.getItem('token');

  const modalClassOptions = [
    { value: '', label: 'Без класса' },
    ...classOptions
  ];

  // Генерация случайного пароля из 8 символов
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Копирование пароля в буфер обмена
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Пароль скопирован в буфер обмена');
    } catch (err) {
      console.error('Ошибка копирования:', err);
    }
  };

  const handleCreate = async () => {
    if (!newStudent.last_name || !newStudent.first_name) {
      alert('Заполните фамилию и имя');
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
          firstName: newStudent.first_name,
          lastName: newStudent.last_name,
          patronymic: newStudent.patronymic || '',
          role: 'student',
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.data) {
        const userId = data.data.user_id;
        
      // 2. Привязываем ученика к классу (если выбран класс)
      if (newStudent.class_id) {
        const classResponse = await fetch('http://localhost:3000/student', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            studentId: userId.toString(), // Приводим к строке, как требует схема
            classId: parseInt(newStudent.class_id) 
          }),
        });
        
        const classData = await classResponse.json();
        
        if (!classData.success) {
          console.error('Ошибка привязки к классу:', classData.error);
          alert('Ученик создан, но не удалось привязать к классу');
        }
      }
        
        setGeneratedPassword(password);
        setStep('password');
      } else {
        alert(data.error || 'Ошибка создания');
      }
    } catch (err) {
      console.error('Ошибка создания:', err);
      alert('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (step === 'password') {
        onSuccess(); // Обновляем список ТОЛЬКО при закрытии окна с паролем
    }
    setStep('form');
    setGeneratedPassword('');
    setNewStudent({
      last_name: '',
      first_name: '',
      patronymic: '',
      class_id: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {step === 'form' ? (
          // Форма создания ученика
          <>
            <h2>Создание ученика</h2>
            
            <div className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Фамилия *</label>
                <input
                  type="text"
                  value={newStudent.last_name}
                  onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                  placeholder="Введите фамилию"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Имя *</label>
                <input
                  type="text"
                  value={newStudent.first_name}
                  onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                  placeholder="Введите имя"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Отчество</label>
                <input
                  type="text"
                  value={newStudent.patronymic}
                  onChange={(e) => setNewStudent({ ...newStudent, patronymic: e.target.value })}
                  placeholder="Введите отчество (необязательно)"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Класс</label>
                <Select
                  value={newStudent.class_id}
                  onChange={(e) => setNewStudent({ ...newStudent, class_id: e.target.value })}
                  options={modalClassOptions}
                  placeholder="Выберите класс (необязательно)"
                />
              </div>
              
              <div className={styles.modalActions}>
                <button 
                  className={styles.cancelModalBtn} 
                  onClick={handleClose}
                >
                  Отмена
                </button>
                <AddButton 
                  onClick={handleCreate}
                  text={loading ? 'Создание...' : 'Создать'}
                  showText={true}
                />
              </div>
            </div>
          </>
        ) : (
          // Окно с сгенерированным паролем
          <>
            <h2 className={styles.successTitle}>✓ Ученик успешно создан!</h2>
            
            <div className={styles.passwordSection}>
              <p className={styles.passwordLabel}>Сгенерированный пароль для входа:</p>
              <div className={styles.passwordBox}>
                <code className={styles.passwordCode}>{generatedPassword}</code>
                <button 
                  className={styles.copyBtn}
                  onClick={() => copyToClipboard(generatedPassword)}
                >
                  📋 Копировать
                </button>
              </div>
              <p className={styles.passwordHint}>
                Сохраните этот пароль. Ученик сможет изменить его после первого входа 
                в разделе "Профиль".
              </p>
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
    </div>
  );
};

export default CreateStudentModal;