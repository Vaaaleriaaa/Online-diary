import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import styles from './Login.module.css';
import auth_background from "../images/auth_background.png"
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();
  
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!loginValue.trim() || !password.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    console.log('1. Отправка запроса на логин...');
    
    const result = await login(loginValue, password);
    
    console.log('2. Результат логина:', result);
    
    if (result.success) {
      console.log('3. Успешный вход! Перенаправление...');
      navigate('/schedule');
    } else {
      console.log('4. Ошибка входа:', result.error);
      setError(result.error || authError || 'Неверный логин или пароль');
    }
    
    setIsLoading(false);
  };

  return (
    <div className={styles.loginContainer}>
      {/* Левая часть - картинка */}
      <div className={styles.loginImage}>
        <img 
          src= { auth_background }
          alt="School illustration"
          className={styles.backgroundImage}
        />
        <div className={styles.logoOverlay}>
          <span className={styles.logoText}>Лампа</span>
        </div>
      </div>

      {/* Правая часть - форма */}
      <div className={styles.loginFormContainer}>
        <div className={styles.formWrapper}>
          <h2 className={styles.formTitle}>Вход</h2>
          
          <form onSubmit={handleSubmit} className={styles.loginForm}>
            <div className={styles.formGroup}>
              <label htmlFor="login">Логин</label>
              <input
                id="login"
                type="text"
                value={loginValue}
                onChange={(e) => setLoginValue(e.target.value)}
                placeholder="Введите логин"
                disabled={isLoading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Пароль</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className={styles.loginButton}
              disabled={isLoading || !loginValue.trim() || !password.trim()}
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;