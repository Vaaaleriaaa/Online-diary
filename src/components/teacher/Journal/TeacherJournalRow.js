import React, { useState } from 'react';
import styles from './TeacherJournalRow.module.css';

const TeacherJournalRow = ({ 
  student,      // объект ученика { student_id, first_name, last_name, patronymic }
  rowNumber,    // номер строки (1, 2, 3...)
  days,         // массив дней месяца [1, 2, 3...31]
  type,         // 'grade' или 'attendance'
  data,         // данные { day: значение } для оценок или посещаемости
  onGradeChange,    // коллбэк при изменении оценки
  onAttendanceChange // коллбэк при изменении посещаемости
}) => {
  const [editingDay, setEditingDay] = useState(null);
  const [tempValue, setTempValue] = useState('');

  // Форматируем ФИО: Фамилия И.О.
  const getShortName = () => {
    const lastName = student.last_name || '';
    const firstName = student.first_name ? student.first_name.charAt(0) + '.' : '';
    const patronymic = student.patronymic ? student.patronymic.charAt(0) + '.' : '';
    return `${lastName} ${firstName}${patronymic}`.trim();
  };

  // Полное ФИО для title (подсказки)
  const getFullName = () => {
    const parts = [
      student.last_name,
      student.first_name,
      student.patronymic
    ].filter(Boolean);
    return parts.join(' ');
  };

  // Получаем значение для ячейки
  const getCellValue = (day) => {
    if (!data || !data[day]) return '';
    return data[day];
  };

  // Начинаем редактирование ячейки
  const startEditing = (day, currentValue) => {
    setEditingDay(day);
    setTempValue(currentValue || '');
  };

  // Сохраняем значение
  const saveValue = (day) => {
    if (type === 'grade') {
      // Для оценок: валидация 2-5, пустое значение = удалить оценку
      let grade = tempValue.trim();
      if (grade === '') {
        onGradeChange?.(student.student_id, day, null);
      } else if (/^[2-5]$/.test(grade)) {
        onGradeChange?.(student.student_id, day, parseInt(grade));
      }
    } else {
      // Для посещаемости: валидация 'н', 'о', 'б', пустое значение = удалить отметку
      let status = tempValue.trim().toLowerCase();
      if (status === '') {
        onAttendanceChange?.(student.student_id, day, null);
      } else if (['н', 'о', 'б'].includes(status)) {
        onAttendanceChange?.(student.student_id, day, status);
      }
    }
    setEditingDay(null);
    setTempValue('');
  };

  // Отмена редактирования
  const cancelEditing = () => {
    setEditingDay(null);
    setTempValue('');
  };

  // Обработка нажатия Enter
  const handleKeyDown = (e, day) => {
    if (e.key === 'Enter') {
      saveValue(day);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  // Получаем CSS класс для ячейки (только для посещаемости)
  const getCellClassName = (day) => {
    if (type !== 'attendance') return styles.gradeCell;
    
    const value = getCellValue(day);
    switch(value) {
      case 'н': return `${styles.attendanceCell} ${styles.absent}`;
      case 'о': return `${styles.attendanceCell} ${styles.late}`;
      case 'б': return `${styles.attendanceCell} ${styles.sick}`;
      default: return styles.attendanceCell;
    }
  };

  return (
    <tr className={styles.row}>
      <td className={styles.rowNumber}>{rowNumber}</td>
      <td className={styles.studentName} title={getFullName()}>
        {getShortName()}
      </td>
      {days.map(day => {
        const value = getCellValue(day);
        const isEditing = editingDay === day;
        
        return (
          <td 
            key={day} 
            className={getCellClassName(day)}
            onClick={() => !isEditing && startEditing(day, value)}
          >
            {isEditing ? (
              <input
                type="text"
                className={styles.cellInput}
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onBlur={() => saveValue(day)}
                onKeyDown={(e) => handleKeyDown(e, day)}
                autoFocus
                maxLength={1}
              />
            ) : (
              <span className={styles.cellValue}>
                {value || '—'}
              </span>
            )}
          </td>
        );
      })}
    </tr>
  );
};

export default TeacherJournalRow;