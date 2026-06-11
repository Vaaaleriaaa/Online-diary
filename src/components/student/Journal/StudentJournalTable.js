import React from 'react';
import styles from './StudentJournalTable.module.css';
import StudentJournalRow from './StudentJournalRow';

const StudentJournalTable = ({ 
  subjects,
  lessons,
  type,
  data,
  loading = false
}) => {

  const sortedSubjects = [...(subjects || [])].sort((a, b) => 
    a.subject_name.localeCompare(b.subject_name)
  );

  // Сортируем уроки по дню и номеру
  const sortedLessons = [...(lessons || [])].sort((a, b) => {
    if (a.day !== b.day) return a.day - b.day;
    return a.lessonNumber - b.lessonNumber;
  });

  const buildDataMap = () => {
    if (!data || !data.subjects) return {};
    
    const dataMap = {};
    data.subjects.forEach(subject => {
      dataMap[subject.subject_id] = {};
      
      // ✅ Определяем, с каким полем работаем: 'grades' или 'attendance'
      const records = subject.grades || subject.attendance;
      
      if (records && Array.isArray(records)) {
        records.forEach(record => {
          // Находим lessonId по дню
          const lesson = sortedLessons.find(l => l.day === record.day);
          if (lesson) {
            // ✅ Для оценок берем record.grade, для посещаемости - record.status
            const value = type === 'grade' ? record.grade : record.status;
            // ✅ Сохраняем значение, если оно есть и не null
            if (value !== null && value !== undefined) {
              dataMap[subject.subject_id][lesson.lessonId] = value;
            }
          }
        });
      }
    });
    return dataMap;
  };

  const dataMap = buildDataMap();

  if (loading) return <div className={styles.loading}>Загрузка...</div>;
  if (!subjects || subjects.length === 0) return <div className={styles.empty}>Нет предметов</div>;
  if (!lessons || lessons.length === 0) return <div className={styles.empty}>Нет уроков в выбранном месяце</div>;

  return (
    <div className={styles.tableWrapper}>

      <table className={styles.journalTable}>
        <thead>
          <tr>
            <th className={styles.rowNumberColumn}>№</th>
            <th className={styles.subjectColumn}>Предмет</th>
            {sortedLessons.map(lesson => (
              <th key={lesson.lessonId} className={styles.dayColumn}>
                {lesson.day}.{lesson.lessonNumber}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedSubjects.map((subject, index) => (
            <StudentJournalRow
              key={subject.subject_id}
              subjectName={subject.subject_name}
              rowNumber={index + 1}
              lessons={sortedLessons}
              type={type}
              data={dataMap[subject.subject_id] || {}}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentJournalTable;