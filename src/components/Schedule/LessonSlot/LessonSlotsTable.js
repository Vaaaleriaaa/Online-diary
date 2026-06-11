import React, { useEffect, useRef, useState } from 'react';
import styles from './LessonSlotsTable.module.css';
import LessonSlotRow from './LessonSlotRow';
import Notification from '../../UI/Notification';

const LessonSlotsTable = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const notificationTimeoutRef = useRef(null);

  const showNotification = (message, type = 'success') => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setNotification({ message, type });
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 3000);
  };

  const clearNotification = () => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setNotification({ message: '', type: '' });
  };

  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  const fetchSlots = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('http://localhost:3000/schedule/slots', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSlots(data.data);
        setError('');
      } else {
        setError(data.error || 'Ошибка загрузки');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const updateSlot = async (slotId, formData) => {
    const token = localStorage.getItem('token');
    
    const currentSlot = slots.find(s => s.slot_id === slotId);
    if (!currentSlot) {
      showNotification('Слот не найден', 'error');
      return;
    }
    
    const updateData = {};
    
    if (formData.lesson_number !== undefined && formData.lesson_number !== currentSlot.lesson_number) {
      updateData.lesson_number = parseInt(formData.lesson_number);
    }
    
    if (formData.start_time !== undefined) {
      const newStartTime = formData.start_time.includes(':') && !formData.start_time.includes(':00')
        ? `${formData.start_time}:00`
        : formData.start_time;
      if (newStartTime !== currentSlot.start_time) {
        updateData.start_time = newStartTime;
      }
    }
    
    if (formData.end_time !== undefined) {
      const newEndTime = formData.end_time.includes(':') && !formData.end_time.includes(':00')
        ? `${formData.end_time}:00`
        : formData.end_time;
      if (newEndTime !== currentSlot.end_time) {
        updateData.end_time = newEndTime;
      }
    }
    
    if (Object.keys(updateData).length === 0) {
      showNotification('Нет изменений', 'info');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3000/schedule/slot/${slotId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('Слот успешно обновлен', 'success');
        await fetchSlots();
      } else {
        showNotification(data.error || data.message || 'Ошибка обновления', 'error');
      }
    } catch (err) {
      showNotification('Ошибка соединения с сервером', 'error');
    }
  };

  const deleteSlot = async (slotId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/schedule/slot/${slotId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const responseText = await response.text();
      let data;
      try{
        data = JSON.parse(responseText);
      } catch {
      data = { success: false, error: responseText };
      }
      if (response.ok && data.success) {
        showNotification('Слот успешно удален', 'success');
        await fetchSlots();
      } else {
        let errorMessage = 'Нельзя удалить слот, который используется в расписании';
        if (data.error && data.error.includes('foreign key constraint')) {
          errorMessage = 'Невозможно удалить слот, так как он используется в уроках.';
      } else if (data.error) {
        errorMessage = data.error;
      }
        showNotification(errorMessage, 'error');
      }
    } catch (err) {
      console.error('Ошибка удаления:', err);
      showNotification('Ошибка соединения с сервером', 'error');
    }
  };

  const addSlot = async () => {
    const token = localStorage.getItem('token');
    
    const existingNumbers = slots.map(s => s.lesson_number);
    let newLessonNumber = null;
    
    for (let i = 1; i <= 8; i++) {
      if (!existingNumbers.includes(i)) {
        newLessonNumber = i;
        break;
      }
    }
    
    if (!newLessonNumber) {
      showNotification('Нельзя добавить более 8 уроков в день', 'error');
      return;
    }
    
    const bodyData = {
      lesson_number: newLessonNumber,
      start_time: '08:00:00',
      end_time: '08:45:00',
    };
    
    try {
      const response = await fetch('http://localhost:3000/schedule/slot', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('Слот успешно добавлен', 'success');
        await fetchSlots();
      } else {
        showNotification(data.error || data.message || 'Ошибка добавления', 'error');
      }
    } catch (err) {
      showNotification('Ошибка соединения с сервером', 'error');
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  if (loading) return <div className={styles.loading}>Загрузка...</div>;
  if (error) return <div className={styles.error}>Ошибка: {error}</div>;

  return (
    <div className={styles.container}>
      <Notification 
        message={notification.message} 
        type={notification.type} 
        onClose={clearNotification}
      />

      <div className={styles.header}>
        <button onClick={addSlot} className={styles.addButton}>+ Добавить слот расписания</button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>№</th>
            <th>Начало</th>
            <th>Конец</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {slots.map((slot) => (
            <LessonSlotRow
              key={slot.slot_id}
              slot={slot}
              onUpdate={updateSlot}
              onDelete={deleteSlot}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LessonSlotsTable;