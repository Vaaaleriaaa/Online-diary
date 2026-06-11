import { useCallback, useEffect, useState } from 'react';

const useJournalData = (selectedClass, selectedSubject, activeTab, selectedMonth) => {
  const token = localStorage.getItem('token');
  const [students, setStudents] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [gradesData, setGradesData] = useState({});
  const [attendanceData, setAttendanceData] = useState({});
  const [tableLoading, setTableLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Получаем учеников выбранного класса
  const fetchStudents = useCallback(async () => {
    if (!selectedClass) return [];
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/class/${selectedClass.class_id}/students`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        const studentsData = data.data.students || data.data;
        const normalizedStudents = studentsData.map(student => ({
          ...student,
          user_id: student.user_id || student.student_id,
        }));
        setStudents(normalizedStudents);
        return normalizedStudents;
      }
      return [];
    } catch (err) {
      console.error('Ошибка загрузки учеников:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [token, selectedClass]);

  // Получаем список уроков за месяц
  const fetchLessons = useCallback(async () => {
    if (!selectedClass || !selectedSubject) return [];
    
    try {
      const monthNumber = selectedMonth + 1;
      const url = `http://localhost:3000/lessons/class/${selectedClass.class_id}/subject/${selectedSubject.subject_id}/lessons?month=${monthNumber}`;
      
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      
      if (data.success && data.data && data.data.lessons) {
        const lessonsList = data.data.lessons.map(lesson => ({
          lessonId: lesson.lesson_id,
          day: lesson.day,
          lessonNumber: lesson.lesson_number
        }));
        console.log('Загруженные уроки:', lessonsList);
        setLessons(lessonsList);
        return lessonsList;
      } else {
        setLessons([]);
        return [];
      }
    } catch (err) {
      console.error('Ошибка загрузки уроков:', err);
      setLessons([]);
      return [];
    }
  }, [token, selectedClass, selectedSubject, selectedMonth]);

  // Загрузка оценок класса
  const fetchGrades = useCallback(async (studentsList, lessonsList) => {
    if (!selectedClass || !selectedSubject) return;
    if (!studentsList || studentsList.length === 0) return;
    if (!lessonsList || lessonsList.length === 0) return;
    
    setTableLoading(true);
    try {
      const monthNumber = selectedMonth + 1;
      const url = `http://localhost:3000/grades/class/${selectedClass.class_id}/subject/${selectedSubject.subject_id}/month?month=${monthNumber}`;
      
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      console.log('Оценки класса:', data);
      
      if (data.success && data.data) {
        const gradesMap = {};
        
        // Инициализируем пустые данные для всех студентов и всех уроков
        studentsList.forEach(student => {
          const userId = student.user_id;
          gradesMap[userId] = {};
          lessonsList.forEach(lesson => {
            gradesMap[userId][lesson.lessonId] = null;
          });
        });
        
        // Заполняем существующие оценки
        const studentsDataFromResponse = data.data.students || [];
        studentsDataFromResponse.forEach(student => {
          const userId = student.user_id || student.student_id;
          
          if (!gradesMap[userId]) {
            gradesMap[userId] = {};
          }
          
          if (student.grades && Array.isArray(student.grades)) {
            student.grades.forEach(grade => {
              // Ищем урок по lesson_id или по дню
              let lesson = null;
              if (grade.lesson_id) {
                lesson = lessonsList.find(l => l.lessonId === grade.lesson_id);
              }
              if (!lesson && grade.day) {
                lesson = lessonsList.find(l => l.day === grade.day);
              }
              if (lesson) {
                gradesMap[userId][lesson.lessonId] = {
                  value: grade.value,
                  gradeId: grade.grade_id
                };
                console.log(`Оценка добавлена: userId=${userId}, lessonId=${lesson.lessonId}, day=${grade.day}, value=${grade.value}`);
              } else {
                console.warn(`Не найден урок для day=${grade.day}, lesson_id=${grade.lesson_id}`);
              }
            });
          }
        });
        
        console.log('Итоговый gradesMap:', gradesMap);
        setGradesData(gradesMap);
      }
    } catch (err) {
      console.error('Ошибка загрузки оценок:', err);
    } finally {
      setTableLoading(false);
    }
  }, [token, selectedClass, selectedSubject, selectedMonth]);

  // Загрузка посещаемости класса
  const fetchAttendance = useCallback(async (studentsList, lessonsList) => {
    if (!selectedClass || !selectedSubject) return;
    if (!studentsList || studentsList.length === 0) return;
    if (!lessonsList || lessonsList.length === 0) return;
    
    setTableLoading(true);
    try {
      const monthNumber = selectedMonth + 1;
      const url = `http://localhost:3000/attendance/class/${selectedClass.class_id}/subject/${selectedSubject.subject_id}/month?month=${monthNumber}`;
      
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      console.log('Посещаемость класса:', data);
      
      if (data.success && data.data) {
        const attendanceMap = {};
        
        // Инициализируем пустые данные
        studentsList.forEach(student => {
          const userId = student.user_id;
          attendanceMap[userId] = {};
          lessonsList.forEach(lesson => {
            attendanceMap[userId][lesson.lessonId] = null;
          });
        });
        
        // Заполняем существующие записи
        data.data.students?.forEach(student => {
          const userId = student.user_id || student.student_id;
          
          if (!attendanceMap[userId]) {
            attendanceMap[userId] = {};
          }
          
          if (student.attendance && Array.isArray(student.attendance)) {
            student.attendance.forEach(record => {
              let lesson = null;
              if (record.lesson_id) {
                lesson = lessonsList.find(l => l.lessonId === record.lesson_id);
              }
              if (!lesson && record.day) {
                lesson = lessonsList.find(l => l.day === record.day);
              }
              if (lesson) {
                attendanceMap[userId][lesson.lessonId] = {
                  status: record.status,
                  attendanceId: record.attendance_id
                };
              }
            });
          }
        });
        
        console.log('Итоговый attendanceMap:', attendanceMap);
        setAttendanceData(attendanceMap);
      }
    } catch (err) {
      console.error('Ошибка загрузки посещаемости:', err);
    } finally {
      setTableLoading(false);
    }
  }, [token, selectedClass, selectedSubject, selectedMonth]);

  // ✅ Главный эффект загрузки данных (последовательный)
  useEffect(() => {
    const loadAllData = async () => {
      if (!selectedClass || !selectedSubject) return;
      
      console.log('Начинаем загрузку данных...');
      
      // 1. Загружаем учеников
      const studentsList = await fetchStudents();
      console.log('Загружено учеников:', studentsList.length);
      
      // 2. Загружаем уроки
      const lessonsList = await fetchLessons();
      console.log('Загружено уроков:', lessonsList.length);
      
      // 3. Загружаем оценки или посещаемость
      if (studentsList.length > 0 && lessonsList.length > 0) {
        if (activeTab === 'gradeJournal') {
          await fetchGrades(studentsList, lessonsList);
        } else {
          await fetchAttendance(studentsList, lessonsList);
        }
      } else {
        console.warn('Нет учеников или уроков для загрузки');
      }
      
      setIsDataLoaded(true);
    };
    
    loadAllData();
  }, [selectedClass, selectedSubject, selectedMonth, activeTab, fetchStudents, fetchLessons, fetchGrades, fetchAttendance]);

  // Сохранение оценки
  const handleSaveGrade = useCallback(async (studentId, lessonId, value) => {
    try {
      const url = 'http://localhost:3000/grades';
      
      const gradeInfo = gradesData[studentId]?.[lessonId];
      const existingGradeId = gradeInfo?.gradeId;
      
      let response;
      let newGradeId = null;
      
      if (existingGradeId) {
        response = await fetch(`${url}/${existingGradeId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ value: parseInt(value) }),
        });
        newGradeId = existingGradeId;
      } else {
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            studentId, 
            lessonId, 
            value: parseInt(value) 
          }),
        });
      }
      
      const result = await response.json();
      
      if (response.ok) {
        if (!existingGradeId && result.data?.grade_id) {
          newGradeId = result.data.grade_id;
        }
        
        setGradesData(prev => ({
          ...prev,
          [studentId]: {
            ...prev[studentId],
            [lessonId]: {
              value: value,
              gradeId: newGradeId
            }
          }
        }));
      } else {
        console.error('Ошибка сохранения оценки:', result.error);
      }
    } catch (err) {
      console.error('Ошибка сохранения оценки:', err);
    }
  }, [token, gradesData]);

  // Сохранение посещаемости
  const handleSaveAttendance = useCallback(async (studentId, lessonId, status) => {
    try {
      const url = 'http://localhost:3000/attendance';
      
      const attendanceInfo = attendanceData[studentId]?.[lessonId];
      const existingAttendanceId = attendanceInfo?.attendanceId;
      
      let response;
      let newAttendanceId = null;
      
      if (existingAttendanceId) {
        response = await fetch(`${url}/${existingAttendanceId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: status }),
        });
        newAttendanceId = existingAttendanceId;
      } else {
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            studentId, 
            lessonId, 
            status: status 
          }),
        });
      }
      
      const result = await response.json();
      
      if (response.ok) {
        if (!existingAttendanceId && result.data?.attendance_id) {
          newAttendanceId = result.data.attendance_id;
        }
        
        setAttendanceData(prev => ({
          ...prev,
          [studentId]: {
            ...prev[studentId],
            [lessonId]: {
              status: status,
              attendanceId: newAttendanceId
            }
          }
        }));
      } else {
        console.error('Ошибка сохранения посещаемости:', result.error);
      }
    } catch (err) {
      console.error('Ошибка сохранения посещаемости:', err);
    }
  }, [token, attendanceData]);

  // Удаление оценки
  const handleDeleteGrade = useCallback(async (studentId, lessonId) => {
    try {
      const gradeInfo = gradesData[studentId]?.[lessonId];
      const existingGradeId = gradeInfo?.gradeId;
      
      if (!existingGradeId) {
        setGradesData(prev => {
          const newData = { ...prev };
          if (newData[studentId]) {
            delete newData[studentId][lessonId];
          }
          return newData;
        });
        return;
      }
      
      const response = await fetch(`http://localhost:3000/grades/${existingGradeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
            
      if (response.ok) {
        setGradesData(prev => {
          const newData = { ...prev };
          if (newData[studentId]) {
            delete newData[studentId][lessonId];
          }
          return newData;
        });
      }
    } catch (err) {
      console.error('Ошибка удаления оценки:', err);
    }
  }, [token, gradesData]);

  // Удаление отметки посещаемости
  const handleDeleteAttendance = useCallback(async (studentId, lessonId) => {
    try {
      const attendanceInfo = attendanceData[studentId]?.[lessonId];
      const existingAttendanceId = attendanceInfo?.attendanceId;
      
      if (!existingAttendanceId) {
        setAttendanceData(prev => {
          const newData = { ...prev };
          if (newData[studentId]) {
            delete newData[studentId][lessonId];
          }
          return newData;
        });
        return;
      }
      
      const response = await fetch(`http://localhost:3000/attendance/${existingAttendanceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
            
      if (response.ok) {
        setAttendanceData(prev => {
          const newData = { ...prev };
          if (newData[studentId]) {
            delete newData[studentId][lessonId];
          }
          return newData;
        });
      }
    } catch (err) {
      console.error('Ошибка удаления отметки:', err);
    }
  }, [token, attendanceData]);

  // Общие обработчики
  const handleSaveCell = useCallback(async (studentId, lessonId, value) => {
    if (activeTab === 'gradeJournal') {
      await handleSaveGrade(studentId, lessonId, value);
    } else {
      await handleSaveAttendance(studentId, lessonId, value);
    }
  }, [activeTab, handleSaveGrade, handleSaveAttendance]);

  const handleDeleteCell = useCallback(async (studentId, lessonId) => {
    if (activeTab === 'gradeJournal') {
      await handleDeleteGrade(studentId, lessonId);
    } else {
      await handleDeleteAttendance(studentId, lessonId);
    }
  }, [activeTab, handleDeleteGrade, handleDeleteAttendance]);

  return {
    students,
    lessons,
    gradesData,
    attendanceData,
    tableLoading,
    loading,
    handleSaveCell,
    handleDeleteCell,
    isDataLoaded
  };
};

export default useJournalData;