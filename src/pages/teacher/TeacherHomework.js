// src/pages/teacher/TeacherHomework.js
import React, { useCallback, useEffect, useState } from "react";
import styles from "./TeacherHomework.module.css";
import { useAuth } from "../../contexts/AuthContext";
import useMonthNavigation from '../../hooks/useMonthNavigation';
import MonthNavigation from '../../components/UI/MonthNavigation';
import Select from "../../components/UI/Select";
import EditButton from "../../components/UI/EditButton";
import SaveButton from "../../components/UI/SaveButton";
import CancelButton from "../../components/UI/CancelButton";
import Notification from "../../components/UI/Notification";
import DeleteButton from "../../components/UI/DeleteButton";
import AddButton from "../../components/UI/AddButton";

const TeacherHomework = () => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isSubjectDisabled, setIsSubjectDisabled] = useState(true);
  const [homeworkList, setHomeworkList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingHomeworkId, setEditingHomeworkId] = useState(null);
  const [editText, setEditText] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [homeworkToDelete, setHomeworkToDelete] = useState(null);

  const { selectedMonth, months, setMonth } = useMonthNavigation();

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 3000);
  };

  // Получаем все назначения учителя
  const fetchTeacherAssignments = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`http://localhost:3000/assignment/teacher/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        const uniqueClasses = [];
        const seenClassIds = new Set();
        const assignmentsData = data.data.assignments;
        
        assignmentsData.forEach(assignment => {
          if (assignment.class && !seenClassIds.has(assignment.class.class_id)) {
            seenClassIds.add(assignment.class.class_id);
            uniqueClasses.push({
              class_id: assignment.class.class_id,
              class_name: assignment.class.class_name
            });
          }
        });
        
        setClasses(uniqueClasses);
        window.teacherAssignments = assignmentsData;
        
        if (uniqueClasses.length > 0 && !selectedClass) {
          setSelectedClass(uniqueClasses[0]);
          setIsSubjectDisabled(false);
        }
      }
    } catch (err) {
      console.error('Ошибка загрузки назначений:', err);
    }
  }, [user?.id, token, selectedClass]);

  // Получаем предметы для выбранного класса
  const fetchSubjectsForClass = useCallback((classId) => {
    if (!classId) return;
    
    const assignments = window.teacherAssignments || [];
    const filteredSubjects = [];
    const seenSubjectIds = new Set();
    
    assignments.forEach(assignment => {
      if (assignment.class && assignment.class.class_id === classId && 
          assignment.subject && !seenSubjectIds.has(assignment.subject.subject_id)) {
        seenSubjectIds.add(assignment.subject.subject_id);
        filteredSubjects.push({
          subject_id: assignment.subject.subject_id,
          subject_name: assignment.subject.name
        });
      }
    });
    
    setSubjects(filteredSubjects);
    
    if (filteredSubjects.length > 0) {
      setSelectedSubject(filteredSubjects[0]);
    } else {
      setSelectedSubject(null);
    }
  }, []);

  // Получаем домашние задания
  const fetchHomework = useCallback(async () => {
    if (!selectedClass || !selectedSubject) return;
    
    setLoading(true);
    try {
      const monthNumber = selectedMonth + 1;
      const url = `http://localhost:3000/homework/class/${selectedClass.class_id}/subject/${selectedSubject.subject_id}/month?month=${monthNumber}`;
      
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      console.log('Ответ ДЗ:', data);

      
      if (data.success && data.data) {
        console.log('Уроки с ДЗ:', data.data.homework);
        setHomeworkList(data.data.homework || []);
      }
    } catch (err) {
      console.error('Ошибка загрузки ДЗ:', err);
    } finally {
      setLoading(false);
    }
  }, [token, selectedClass, selectedSubject, selectedMonth]);

  // Сохранение ДЗ
  const handleSaveHomework = async (homeworkId, lessonId) => {
    const textToSave = editText && typeof editText === 'string' ? editText.trim() : '';

    if (!textToSave) {
      showNotification('Введите текст домашнего задания', 'error');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3000/homework/${homeworkId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textToSave }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('Домашнее задание сохранено', 'success');
        await fetchHomework();
        setEditingHomeworkId(null);
        setEditText('');
      } else {
        showNotification(data.error || 'Ошибка сохранения', 'error');
      }
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      showNotification('Ошибка соединения', 'error');
    }
  };

  // Создание нового ДЗ
  const handleCreateHomework = async (lessonId) => {
    const textToSave = editText && typeof editText === 'string' ? editText.trim() : '';
    if (!textToSave) {
      showNotification('Введите текст домашнего задания', 'error');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3000/homework`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          lessonId: lessonId,
          text: editText.trim()
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('Домашнее задание создано', 'success');
        await fetchHomework();
        setEditingHomeworkId(null);
        setEditText('');
      } else {
        showNotification(data.error || 'Ошибка создания', 'error');
      }
    } catch (err) {
      showNotification('Ошибка соединения', 'error');
    }
  };

  // Удаление ДЗ
  const handleDeleteHomework = async (homeworkId) => {    
    try {
      const response = await fetch(`http://localhost:3000/homework/${homeworkId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('Домашнее задание удалено', 'success');
        await fetchHomework();
      } else {
        showNotification(data.error || 'Ошибка удаления', 'error');
      }
    } catch (err) {
      showNotification('Ошибка соединения', 'error');
    }
  };

  // Начало редактирования
  const startEdit = (homework) => {
    setEditingHomeworkId(homework.lesson_id);
    setEditText(homework.homework_text || '');
  };

  const cancelEdit = () => {
    setEditingHomeworkId(null);
    setEditText('');
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  // useEffect hooks
  useEffect(() => {
    if (user?.id) {
      fetchTeacherAssignments();
    }
  }, [user?.id, fetchTeacherAssignments]);
  
  useEffect(() => {
    if (selectedClass) {
      fetchSubjectsForClass(selectedClass.class_id);
      setIsSubjectDisabled(false);
    } else {
      setIsSubjectDisabled(true);
      setSubjects([]);
      setSelectedSubject(null);
    }
  }, [selectedClass, fetchSubjectsForClass]);

  useEffect(() => {
    if (selectedClass && selectedSubject) {
      fetchHomework();
    }
  }, [selectedClass, selectedSubject, selectedMonth, fetchHomework]);

  const handleClassChange = (e) => {
    const classId = parseInt(e.target.value);
    const selected = classes.find(c => c.class_id === classId);
    setSelectedClass(selected);
    setSelectedSubject(null);
  };

  const handleSubjectChange = (e) => {
    const subjectId = parseInt(e.target.value);
    const selected = subjects.find(s => s.subject_id === subjectId);
    setSelectedSubject(selected);
  };

  const classOptions = classes.map(cls => ({
    value: cls.class_id,
    label: cls.class_name
  }));

  const subjectOptions = subjects.map(subj => ({
    value: subj.subject_id,
    label: subj.subject_name
  }));

  if (loading) return <div className={styles.loading}>Загрузка...</div>;

  return (
    <div className={styles.teacherHomework}>
      <Notification 
        message={notification.message} 
        type={notification.type} 
        onClose={() => setNotification({ message: '', type: '' })}
      />

      <h1>Домашние задания</h1>
      <div className={styles.filters}>
        <Select
          name="class"
          value={selectedClass?.class_id || ''}
          onChange={handleClassChange}
          options={classOptions}
          placeholder="Выберите класс"
        />
        
        <Select
          name="subject"
          value={selectedSubject?.subject_id || ''}
          onChange={handleSubjectChange}
          options={subjectOptions}
          placeholder={
            isSubjectDisabled || classes.length === 0 
              ? 'Сначала выберите класс' 
              : subjects.length === 0 
                ? 'Нет предметов для этого класса' 
                : 'Выберите предмет'
          }
          disabled={isSubjectDisabled || subjects.length === 0}
        />
      </div>

      <MonthNavigation 
          months={months}
          selectedMonth={selectedMonth}
          onMonthChange={setMonth}
        />

      <div className={styles.homeworkList}>
        {homeworkList.length === 0 ? (
          <div className={styles.empty}>Нет уроков в выбранном месяце</div>
        ) : (
          homeworkList.map((homework, index) => {
            const isEditing = editingHomeworkId === homework.lesson_id;
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
                  {isEditing ? (
                    <textarea
                      className={styles.homeworkInput}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      placeholder="Введите текст домашнего задания..."
                      rows={3}
                      autoFocus
                    />
                  ) : (
                    <div className={styles.homeworkText}>
                      {hasHomework ? 
                      homework.homework_text : 
                        <AddButton 
                          onClick={() => {
                            setEditingHomeworkId(homework.lesson_id);
                            setEditText('');
                          }}
                          text="Добавить ДЗ"
                          title="Добавить домашнее задание"
                          showText={true}
                        />}
                    </div>
                  )}
                </div>
                
                <div className={styles.homeworkActions}>
                  {isEditing ? (
                    <>
                      <SaveButton onClick={() => 
                        hasHomework 
                          ? handleSaveHomework(homework.homework_id, homework.lesson_id)
                          : handleCreateHomework(homework.lesson_id)
                      } />
                      <CancelButton onClick={cancelEdit} />
                    </>
                  ) : (
                    <>
                      {hasHomework && (
                        <>
                          <EditButton onClick={() => startEdit(homework)} />
                          <DeleteButton 
                            className={styles.deleteBtn}
                            onClick={() => handleDeleteHomework(homework.homework_id)}
                            title="Удалить"
                          />  
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TeacherHomework;