import React, { useEffect, useRef, useState } from 'react';
import styles from './TeacherJournalTable.module.css';
import Notification from '../../UI/Notification';

const TeacherJournalTable = ({ 
  students,
  lessons,
  type,
  data,
  onSaveCell,
  onDeleteCell,
  loading = false
}) => {
  const [editMode, setEditMode] = useState(false);
  const [editingCell, setEditingCell] = useState({ studentId: null, lessonId: null });
  const [editValue, setEditValue] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const inputRef = useRef(null);

  const showNotification = (message, type = 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 3000);
  };

   useEffect(() => {
    if (editingCell.studentId && editingCell.lessonId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  const sortedStudents = [...(students || [])].sort((a, b) => {
    const lastNameCompare = (a.last_name || '').localeCompare(b.last_name || '');
    if (lastNameCompare !== 0) return lastNameCompare;
    const firstNameCompare = (a.first_name || '').localeCompare(b.first_name || '');
    if (firstNameCompare !== 0) return firstNameCompare;
    return (a.patronymic || '').localeCompare(b.patronymic || '');
  });

  const sortedLessons = [...(lessons || [])].sort((a, b) => {
    if (a.day !== b.day) return a.day - b.day;
    return a.lessonNumber - b.lessonNumber;
  });

  const getShortName = (student) => {
    if (!student) return '';
    const lastName = student.last_name || '';
    const firstName = student.first_name ? student.first_name.charAt(0) + '.' : '';
    const patronymic = student.patronymic ? student.patronymic.charAt(0) + '.' : '';
    return `${lastName} ${firstName}${patronymic}`.trim();
  };

  const getStudentId = (student) => {
    return student.user_id || student.student_id;
  };

  // Получаем значение для отображения
  const getDisplayValue = (studentId, lessonId) => {
    if (!data || !data[studentId]) return '';
    const cellData = data[studentId][lessonId];
    if (!cellData) return '';
    
    if (typeof cellData === 'object') {
      if (cellData.status !== undefined) return cellData.status;
      if (cellData.value !== undefined) return cellData.value;
    }
    return cellData;
  };

  // Получаем сырое значение для редактирования
  const getRawValue = (studentId, lessonId) => {
    if (!data || !data[studentId]) return '';
    const cellData = data[studentId][lessonId];
    if (!cellData) return '';
    
    if (typeof cellData === 'object') {
      if (cellData.status !== undefined) return cellData.status;
      if (cellData.value !== undefined) return cellData.value;
    }
    return cellData || '';
  };

  // Сохранение значения
  const saveValue = async (studentId, lessonId, value) => {
    const trimmedValue = value ? value.trim() : '';
    
    if (trimmedValue === '') {
      // Удаляем значение
      await onDeleteCell(studentId, lessonId);
      return;
    }
    
    // Валидация
    if (type === 'grade') {
      const grade = parseInt(trimmedValue);
      if (isNaN(grade) || grade < 2 || grade > 5) {
        showNotification('Оценка должна быть от 2 до 5', 'error');
        return false;
      }
    } else {
      if (!['н', 'о', 'б'].includes(trimmedValue.toLowerCase())) {
        showNotification('Допустимые значения: н, о, б', 'error');
        return false;
      }
    }
    
    await onSaveCell(studentId, lessonId, trimmedValue);
    return true;
  };

  const startEdit = (studentId, lessonId) => {
    if (!editMode) return;
    const currentValue = getRawValue(studentId, lessonId);
    setEditingCell({ studentId, lessonId });
    setEditValue(currentValue || '');
  };

  const handleBlur = async () => {
    const { studentId, lessonId } = editingCell;
    if (studentId && lessonId) {
      await saveValue(studentId, lessonId, editValue);
    }
    setEditingCell({ studentId: null, lessonId: null });
    setEditValue('');
  };

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const { studentId, lessonId } = editingCell;
      const success = await saveValue(studentId, lessonId, editValue);
      if (success) {
        setEditingCell({ studentId: null, lessonId: null });
        setEditValue('');
      }
    } else if (e.key === 'Escape') {
      setEditingCell({ studentId: null, lessonId: null });
      setEditValue('');
    }
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
    setEditingCell({ studentId: null, lessonId: null });
    setEditValue('');
  };

  const getCellClassName = (studentId, lessonId) => {
    if (!data || !data[studentId]) {
      if (type === 'grade') return styles.emptyGradeCell;
      return styles.emptyAttendanceCell;
    }
    const cellData = data[studentId][lessonId];
    
    let value = null;
    if (cellData && typeof cellData === 'object') {
      value = cellData.status !== undefined ? cellData.status : cellData.value;
    } else {
      value = cellData;
    }
    
    if (type === 'grade') {
    // Пустая ячейка
      if (value === null || value === '') {
        return styles.emptyGradeCell;
      }
    
      // Цвет в зависимости от оценки
      const gradeNum = parseInt(value);
      if (gradeNum === 5) return `${styles.gradeCell} ${styles.grade5}`;
      if (gradeNum === 4) return `${styles.gradeCell} ${styles.grade4}`;
      if (gradeNum === 3) return `${styles.gradeCell} ${styles.grade3}`;
      if (gradeNum === 2) return `${styles.gradeCell} ${styles.grade2}`;
      return styles.gradeCell;
    } else {
      // Посещаемость
      switch(value) {
        case 'н': return `${styles.attendanceCell} ${styles.absent}`;
        case 'о': return `${styles.attendanceCell} ${styles.late}`;
        case 'б': return `${styles.attendanceCell} ${styles.sick}`;
        default: return styles.emptyAttendanceCell;
      }
    }
  };

  if (loading) return <div className={styles.loading}>Загрузка...</div>;
  if (!students || students.length === 0) return <div className={styles.empty}>Нет учеников в выбранном классе</div>;
  if (!lessons || lessons.length === 0) return <div className={styles.empty}>Нет уроков в выбранном месяце</div>;

  return (
    <div className={styles.tableWrapper}>
      <Notification 
        message={notification.message} 
        type={notification.type} 
        onClose={() => setNotification({ message: '', type: '' })}
      />
      
      <div className={styles.toolbar}>
        <button className={`${styles.editModeBtn} ${editMode ? styles.active : ''}`} onClick={toggleEditMode}>
          {editMode ? 'Сохранить' : 'Редактировать'}
        </button>
      </div>

      <table className={styles.journalTable}>
        <thead>
          <tr>
            <th className={styles.rowNumberColumn}>№</th>
            <th className={styles.studentColumn}>Ученик</th>
            {sortedLessons.map(lesson => (
              <th key={lesson.lessonId} className={styles.dayColumn}>
                {lesson.day}.{lesson.lessonNumber}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedStudents.map((student, index) => {
            const studentId = getStudentId(student);
            
            return (
              <tr key={studentId} className={styles.row}>
                <td className={styles.rowNumber}>{index + 1}</td>
                <td className={styles.studentName} title={`${student.last_name || ''} ${student.first_name || ''} ${student.patronymic || ''}`}>
                  {getShortName(student)}
                </td>
                {sortedLessons.map(lesson => {
                  const isEditing = editingCell.studentId === studentId && editingCell.lessonId === lesson.lessonId;
                  const displayValue = getDisplayValue(studentId, lesson.lessonId);
                  const isActive = editMode;
                  
                  if (isEditing) {
                    return (
                      <td key={lesson.lessonId} className={styles.editingCell}>
                        <input
                          ref={inputRef}
                          type="text"
                          className={styles.cellInput}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleBlur}
                          onKeyDown={handleKeyDown}
                          maxLength={1}
                          autoFocus
                        />
                      </td>
                    );
                  }
                  
                  return (
                    <td 
                      key={lesson.lessonId} 
                      className={`${getCellClassName(studentId, lesson.lessonId)} ${isActive ? styles.editable : ''}`}
                      onClick={() => isActive && startEdit(studentId, lesson.lessonId)}
                    >
                      {displayValue}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TeacherJournalTable;