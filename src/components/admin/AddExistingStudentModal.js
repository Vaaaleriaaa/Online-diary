// src/components/admin/AddExistingStudentModal.js
import React, { useState, useEffect, useCallback } from 'react';
import AddButton from '../UI/AddButton';
import Notification from '../UI/Notification';
import styles from './AddExistingStudentModal.module.css';

const AddExistingStudentModal = ({ isOpen, onClose, onSuccess, classId, classOptions }) => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const token = localStorage.getItem('token');

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const hideNotification = () => {
    setNotification({ message: '', type: 'success' });
  };

  // Загрузка учеников без класса
  const fetchStudentsWithoutClass = useCallback(async () => {
    setLoading(true);
    try {
      // Получаем всех учеников
      const allStudentsRes = await fetch('http://localhost:3000/users/students', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      // Получаем учеников с классом
      const studentsWithClassRes = await fetch('http://localhost:3000/students', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const allStudentsData = await allStudentsRes.json();
      const studentsWithClassData = await studentsWithClassRes.json();
      
      if (allStudentsData.success && studentsWithClassData.success) {
        const allStudents = allStudentsData.data || [];
        const studentsWithClass = studentsWithClassData.data || [];
        
        // Получаем ID учеников, у которых есть класс
        const studentsWithClassIds = new Set(studentsWithClass.map(s => s.user_id));
        
        // Фильтруем учеников без класса
        const studentsWithoutClass = allStudents.filter(s => !studentsWithClassIds.has(s.user_id));
        
        setStudents(studentsWithoutClass);
        setFilteredStudents(studentsWithoutClass);
      }
    } catch (err) {
      console.error('Ошибка загрузки учеников:', err);
      showNotification('Ошибка загрузки учеников', 'error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Загрузка при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      fetchStudentsWithoutClass();
    }
  }, [isOpen, fetchStudentsWithoutClass]);

  // Фильтрация учеников по поиску
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student => {
        const fullName = `${student.last_name} ${student.first_name} ${student.patronymic || ''}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
      });
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const handleAddStudent = async () => {
    if (!selectedStudentId) {
      showNotification('Выберите ученика', 'error');
      return;
    }
    
    if (!classId) {
      showNotification('Класс не выбран', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/student/${selectedStudentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ classId: classId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('Ученик успешно добавлен в класс', 'success');
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 1000);
      } else {
        showNotification(data.error || 'Ошибка добавления ученика', 'error');
      }
    } catch (err) {
      console.error('Ошибка:', err);
      showNotification('Ошибка соединения', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedStudentId('');
    setSearchTerm('');
    setStudents([]);
    setFilteredStudents([]);
    setNotification({ message: '', type: 'success' });
    onClose();
  };

  // Форматирование ФИО ученика
  const getStudentFullName = (student) => {
    return `${student.last_name} ${student.first_name} ${student.patronymic || ''}`.trim();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <Notification 
        message={notification.message} 
        type={notification.type} 
        onClose={hideNotification}
      />
      
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>Добавить ученика в класс</h2>
        
        <div className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label>Поиск ученика</label>
            <input
              type="text"
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Введите фамилию, имя или отчество..."
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Выберите ученика</label>
            {loading ? (
              <div className={styles.loading}>Загрузка...</div>
            ) : (
              <div className={styles.studentsList}>
                {filteredStudents.length === 0 ? (
                  <div className={styles.emptyStudents}>
                    {searchTerm ? 'Ученики не найдены' : 'Нет учеников без класса'}
                  </div>
                ) : (
                  filteredStudents.map(student => (
                    <div
                      key={student.user_id}
                      className={`${styles.studentItem} ${selectedStudentId === student.user_id ? styles.selected : ''}`}
                      onClick={() => setSelectedStudentId(student.user_id)}
                    >
                      <input
                        type="radio"
                        name="student"
                        checked={selectedStudentId === student.user_id}
                        onChange={() => setSelectedStudentId(student.user_id)}
                      />
                      <span className={styles.studentName}>
                        {getStudentFullName(student)}
                      </span>
                      <span className={styles.studentLogin}>
                        Логин: {student.login}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          <div className={styles.modalActions}>
            <button 
              className={styles.cancelModalBtn} 
              onClick={handleClose}
              disabled={loading}
            >
              Отмена
            </button>
            <AddButton 
              onClick={handleAddStudent}
              text={loading ? 'Добавление...' : 'Добавить'}
              showText={true}
              disabled={!selectedStudentId || loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddExistingStudentModal;