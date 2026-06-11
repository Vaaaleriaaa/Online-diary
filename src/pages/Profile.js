// src/pages/Profile.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './Profile.module.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const token = localStorage.getItem('token');
  
  const [userInfo, setUserInfo] = useState(null);
  const [studentClass, setStudentClass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Получаем информацию о пользователе
  const fetchUserInfo = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      console.log('User info:', data);
      
      if (data.success && data.data) {
        setUserInfo(data.data);
        
        // Если ученик, получаем его класс
        if (data.data.role === 'student') {
          const studentResponse = await fetch(`http://localhost:3000/student/${data.data.user_id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const studentData = await studentResponse.json();
          if (studentData.success && studentData.data && studentData.data.class) {
            setStudentClass(studentData.data.class.class_name);
          }
        }
      }
    } catch (err) {
      console.error('Ошибка получения информации:', err);
    }
  }, [token]);

  // Проверка старого пароля через отдельный эндпоинт
  const verifyOldPassword = async (password) => {
    try {
      const response = await fetch('http://localhost:3000/auth/verify-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      return data.success && data.data.isValid;
    } catch (err) {
      console.error('Ошибка проверки пароля:', err);
      return false;
    }
  };

  // Изменение пароля
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');
    setErrorMessage('');
    
    // Валидация
    const newErrors = {};
    
    if (!passwordData.oldPassword) {
      newErrors.oldPassword = 'Введите текущий пароль';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Введите новый пароль';
    } else if (passwordData.newPassword.length < 3) {
      newErrors.newPassword = 'Пароль должен содержать минимум 3 символа';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      // Сначала проверяем старый пароль
      const isOldPasswordValid = await verifyOldPassword(passwordData.oldPassword);
      
      if (!isOldPasswordValid) {
        setErrors({ oldPassword: 'Неверный текущий пароль' });
        setLoading(false);
        return;
      }
      
      // Меняем пароль
      const response = await fetch('http://localhost:3000/auth/change-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccessMessage('Пароль успешно изменен');
        setPasswordData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setErrorMessage(data.error || 'Ошибка изменения пароля');
      }
    } catch (err) {
      setErrorMessage('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    // Очищаем ошибку для этого поля
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  // Получаем роль на русском
  const getRoleName = (role) => {
    switch(role) {
      case 'admin': return 'Администратор';
      case 'teacher': return 'Учитель';
      case 'student': return 'Ученик';
      default: return role;
    }
  };

  if (!userInfo) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  return (
    <div className={styles.profile}>
      <div className={styles.card}>
        <h1>Профиль пользователя</h1>
        
        <div className={styles.infoSection}>
          <div className={styles.infoRow}>
            <span className={styles.label}>ФИО:</span>
            <span className={styles.value}>
              {userInfo.last_name} {userInfo.first_name} {userInfo.patronymic || ''}
            </span>
          </div>
          
          <div className={styles.infoRow}>
            <span className={styles.label}>Логин:</span>
            <span className={styles.value}>{userInfo.login}</span>
          </div>
          
          <div className={styles.infoRow}>
            <span className={styles.label}>Роль:</span>
            <span className={styles.value}>{getRoleName(userInfo.role)}</span>
          </div>
          
          {userInfo.role === 'student' && studentClass && (
            <div className={styles.infoRow}>
              <span className={styles.label}>Класс:</span>
              <span className={styles.value}>{studentClass}</span>
            </div>
          )}
        </div>
        
        <div className={styles.divider} />
        
        <div className={styles.passwordSection}>
          <h2>Смена пароля</h2>
          
          {successMessage && (
            <div className={styles.successMessage}>{successMessage}</div>
          )}
          {errorMessage && (
            <div className={styles.errorMessage}>{errorMessage}</div>
          )}
          
          <form onSubmit={handleChangePassword}>
            <div className={styles.formGroup}>
              <label htmlFor="oldPassword">Текущий пароль</label>
              <input
                type="password"
                id="oldPassword"
                name="oldPassword"
                value={passwordData.oldPassword}
                onChange={handleInputChange}
                className={errors.oldPassword ? styles.error : ''}
              />
              {errors.oldPassword && (
                <span className={styles.errorText}>{errors.oldPassword}</span>
              )}
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="newPassword">Новый пароль</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handleInputChange}
                className={errors.newPassword ? styles.error : ''}
              />
              {errors.newPassword && (
                <span className={styles.errorText}>{errors.newPassword}</span>
              )}
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Повторите новый пароль</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? styles.error : ''}
              />
              {errors.confirmPassword && (
                <span className={styles.errorText}>{errors.confirmPassword}</span>
              )}
            </div>
            
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Сохранение...' : 'Изменить пароль'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;