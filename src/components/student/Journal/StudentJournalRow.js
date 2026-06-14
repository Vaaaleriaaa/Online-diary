import React from 'react';
import styles from './StudentJournalRow.module.css';

const StudentJournalRow = ({ 
  subjectName,
  rowNumber,
  lessons,
  type,
  data,
}) => {

  const getCellValue = (lessonId) => {
    const value = data[lessonId];
    if (!value) return '';
    return value;
  };

  const getCellClassName = (lessonId) => {
    const value = getCellValue(lessonId);
    
    if (type === 'grade') {
      // Оценки
      if (!value || value === '') return styles.emptyGradeCell;
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

  return (
    <tr className={styles.row}>
      <td className={styles.rowNumber}>{rowNumber}</td>
      <td className={styles.subjectName}>{subjectName}</td>
      {lessons.map(lesson => {
        const value = getCellValue(lesson.lessonId);
        
        return (
          <td 
            key={lesson.lessonId} 
            className={getCellClassName(lesson.lessonId)}
          >
            <span className={styles.cellValue}>{value || ''}</span>
          </td>
        );
      })}
    </tr>
  );
};

export default StudentJournalRow;