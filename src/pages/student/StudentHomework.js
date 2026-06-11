import React, { useCallback, useEffect, useState } from 'react';
import styles from './StudentHomework.module.css';
import Select from '../../components/UI/Select';
import MonthNavigation from '../../components/UI/MonthNavigation';
import useMonthNavigation from '../../hooks/useMonthNavigation';
import { useAuth } from '../../contexts/AuthContext';

const StudentHomework = () => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const [className, setClassName] = useState('');
  const [classId, setClassId] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [allHomework, setAllHomework] = useState([]);
  const [homeworkList, setHomeworkList] = useState([]); 
  const [loading, setLoading] = useState(false);

  const { selectedMonth, months, setMonth } = useMonthNavigation();

  const fetchStudentInfo = useCallback(async () => {
    const userId = user?.id;
    if (!userId) return;
    
    try {
      const response = await fetch(`http://localhost:3000/student/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      console.log('Информация о студенте:', data);
      
      if (data.success && data.data && data.data.class) {
        setClassName(data.data.class.class_name);
        setClassId(data.data.class.class_id);
      }
    } catch (err) {
      console.error('Ошибка получения информации:', err);
    }
  }, [user, token]);

  const fetchSubjects = useCallback(async () => {
    if (!classId) return;
    
    try {
      const response = await fetch(`http://localhost:3000/class/${classId}/subjects`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      console.log('Предметы класса:', data);
      
      if (data.success && data.data) {
        setSubjects(data.data);
        if (data.data.length > 0) {
          setSelectedSubject(data.data[0]);
        }
      }
    } catch (err) {
      console.error('Ошибка загрузки предметов:', err);
    }
  }, [token, classId]);

  const fetchAllHomework = useCallback(async () => {
    if (!classId) return;
    
    setLoading(true);
    try {
      const monthNumber = selectedMonth + 1;
      const currentYear = new Date().getFullYear();
      const response = await fetch(
        `http://localhost:3000/homework/class/${classId}/month?month=${monthNumber}&year=${currentYear}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      
      if (data.success && data.data) {
        setAllHomework(data.data.homework || []);
      } else {
        setAllHomework([]);
      }
    } catch (err) {
      console.error('Ошибка загрузки ДЗ:', err);
      setAllHomework([]);
    } finally {
      setLoading(false);
    }
  }, [token, classId, selectedMonth]);

  // ✅ Фильтруем ДЗ по выбранному предмету
  useEffect(() => {
    if (!selectedSubject) {
      setHomeworkList([]);
      return;
    }
    
    const filtered = allHomework.filter(
      homework => homework.subject_id === selectedSubject.subject_id
    );
    setHomeworkList(filtered);
  }, [selectedSubject, allHomework]);

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (user?.id) {
      fetchStudentInfo();
    }
  }, [user?.id, fetchStudentInfo]);

  useEffect(() => {
    if (classId) {
      fetchSubjects();
    }
  }, [classId, fetchSubjects]);

  useEffect(() => {
    if (classId) {
      fetchAllHomework();
    }
  }, [classId, selectedMonth, fetchAllHomework]);

  const handleSubjectChange = (e) => {
    const subjectId = parseInt(e.target.value);
    const selected = subjects.find(s => s.subject_id === subjectId);
    setSelectedSubject(selected);
  };

  const subjectOptions = subjects.map(subj => ({
    value: subj.subject_id,
    label: subj.subject_name
  }));

  if (loading) return <div className={styles.loading}>Загрузка...</div>;


  return (
    <div className={styles.studentHomework}>
      <h1>Домашние задания</h1>
      <div className={styles.filter}>
        <Select
          name="class"
          value={selectedSubject?.subject_id || ''}
          onChange={handleSubjectChange}
          options={subjectOptions}
          placeholder="Выберите предмет"
        />
      </div>

      <MonthNavigation 
          months={months}
          selectedMonth={selectedMonth}
          onMonthChange={setMonth}
        />

<div className={styles.homeworkList}>
        {!selectedSubject ? (
          <div className={styles.empty}>Выберите предмет</div>
        ) : homeworkList.length === 0 ? (
          <div className={styles.empty}>Нет домашних заданий за выбранный месяц</div>
        ) : (
          homeworkList.map((homework, index) => {
            const hasHomework = homework.homework_text !== null;
            
            return (
              <div 
                key={homework.lesson_id} 
                className={`${styles.homeworkItem} ${index % 2 === 0 ? styles.even : styles.odd}`}
              >
                <div className={styles.homeworkDate}>
                  <span className={styles.day}>{formatDate(homework.date)}</span>
                  <span className={styles.lessonNumber}>Урок {homework.lesson_number}</span>
                </div>
                
                <div className={styles.homeworkContent}>
                  <div className={styles.homeworkText}>
                    {hasHomework ? homework.homework_text : '—'}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentHomework;