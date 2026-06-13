// src/components/UI/Notification.js
import React, { useState, useEffect, useRef } from 'react';
import styles from './Notification.module.css';

const Notification = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }
    
    setVisible(true);
    
    // ✅ Очищаем предыдущий таймер
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // ✅ Устанавливаем новый таймер
    timeoutRef.current = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);
    
    // ✅ Очистка при размонтировании или изменении message
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, duration, onClose]);

  if (!visible || !message) return null;

  return (
    <div className={`${styles.notification} ${styles[type]}`}>
      {message}
    </div>
  );
};

export default Notification;