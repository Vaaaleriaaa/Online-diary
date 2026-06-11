import React, { useState, useEffect, useCallback } from 'react';
import styles from './StudentJournal.module.css';
import { useAuth } from "../../contexts/AuthContext";
import Tabs from "../../components/UI/Tabs";
import useMonthNavigation from '../../hooks/useMonthNavigation';
import MonthNavigation from '../../components/UI/MonthNavigation';
import StudentJournalTable from '../../components/student/Journal/StudentJournalTable';

const StudentJournal = () => {
  const { user } = useAuth();
  const [activeTabJournal, setactiveTabJournal] = useState('gradeJournal');
  const [gradesData, setGradesData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [className, setClassName] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [lessons, setLessons] = useState([]);
  const token = localStorage.getItem('token');

  const { 
    selectedMonth, 
    months, 
    setMonth 
  } = useMonthNavigation();

  const tabsJournal = [
    { id: 'gradeJournal', label: `Оценки` },
    { id: 'attendanceJournal', label: `Посещаемость` },
  ];

  const fetchStudentInfo = useCallback(async () => {
    const userId = user?.id;
    if (!userId) return;
    
    try {
      const response = await fetch(`http://localhost:3000/student/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success && data.data && data.data.class) {
        setClassName(data.data.class.class_name);
      }
    } catch (err) {
      console.error('Ошибка получения информации:', err);
    }
  }, [user, token]);

 // Извлекаем уникальные уроки из данных (для колонок таблицы)
  const extractLessonsFromData = (data) => {
    if (!data || !data.subjects) return [];
    
    const lessonsMap = new Map();
    
    data.subjects.forEach(subject => {
      const records = subject.grades || subject.attendance;
      if (records && Array.isArray(records)) {
        records.forEach(record => {
          if (!lessonsMap.has(record.day)) {
            lessonsMap.set(record.day, {
              lessonId: `day_${record.day}`,
              day: record.day,
              lessonNumber: 1
            });
          }
        });
      }
    });
    
    const lessonsList = Array.from(lessonsMap.values());
    lessonsList.sort((a, b) => a.day - b.day);
    
    return lessonsList;
  };

  // Получение оценок
  const fetchGrades = useCallback(async () => {
    setLoading(true);
    try {
      const monthNumber = selectedMonth + 1;
      console.log(`Запрос оценок: месяц=${monthNumber}, год=${selectedYear}`);
      
      const response = await fetch(
        `http://localhost:3000/grades/student?month=${monthNumber}&year=${selectedYear}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      console.log('Оценки:', data);
      
      if (data.success && data.data) {
        setGradesData(data.data);
        
        // Извлекаем предметы
        if (data.data.subjects && data.data.subjects.length > 0) {
          setSubjects(data.data.subjects);
        }
        
        // Извлекаем уроки из оценок
        const lessonsList = extractLessonsFromData(data.data);
        setLessons(lessonsList);
      } else {
        setGradesData(null);
        setSubjects([]);
        setLessons([]);
      }
    } catch (err) {
      console.error('Ошибка загрузки оценок:', err);
      setGradesData(null);
    } finally {
      setLoading(false);
    }
  }, [token, selectedMonth, selectedYear]);

  // Получение посещаемости
  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const monthNumber = selectedMonth + 1;
      console.log(`Запрос посещаемости: месяц=${monthNumber}, год=${selectedYear}`);
      
      const response = await fetch(
        `http://localhost:3000/attendance/student?month=${monthNumber}&year=${selectedYear}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      console.log('Посещаемость:', data);
      
      if (data.success && data.data) {
        setAttendanceData(data.data);
        
        // Извлекаем предметы
        if (data.data.subjects && data.data.subjects.length > 0) {
          setSubjects(data.data.subjects);
        }
        
        // Извлекаем уроки из данных посещаемости
        const lessonsList = extractLessonsFromData(data.data);
        setLessons(lessonsList);
      } else {
        setAttendanceData(null);
        setSubjects([]);
        setLessons([]);
      }
    } catch (err) {
      console.error('Ошибка загрузки посещаемости:', err);
      setAttendanceData(null);
    } finally {
      setLoading(false);
    }
  }, [token, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchStudentInfo();
  }, [fetchStudentInfo]);

   useEffect(() => {
    if (selectedMonth !== undefined && selectedYear) {
      if (activeTabJournal === 'gradeJournal') {
        fetchGrades();
      } else {
        fetchAttendance();
      }
    }
  }, [selectedMonth, selectedYear, activeTabJournal, fetchGrades, fetchAttendance]);

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  const currentData = activeTabJournal === 'gradeJournal' ? gradesData : attendanceData;
  const currentType = activeTabJournal === 'gradeJournal' ? 'grade' : 'attendance';

  return (
    <div className={styles.studentJournal}>
      <Tabs tabs={tabsJournal} activeTab={activeTabJournal} onTabChange={setactiveTabJournal} />
      
      <MonthNavigation 
        months={months}
        selectedMonth={selectedMonth}
        onMonthChange={setMonth}
      />

      {!subjects || subjects.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Нет данных за {months[selectedMonth]} {selectedYear} года</p>
          <p className={styles.hint}>
            {selectedYear < new Date().getFullYear() 
              ? `За ${selectedYear} год данные отсутствуют` 
              : selectedYear > new Date().getFullYear()
                ? `Учебный год ${selectedYear} еще не наступил`
                : `В этом месяце нет уроков`}
          </p>
        </div>
      ) : lessons.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Нет уроков в выбранном месяце</p>
        </div>
      ) : (
        <StudentJournalTable
          subjects={subjects}
          lessons={lessons}
          type={currentType}
          data={currentData}
          loading={loading}
        />
      )}
    </div>
  );
};

export default StudentJournal;