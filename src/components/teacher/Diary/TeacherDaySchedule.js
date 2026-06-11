import React from "react";
import styles from "./TeacherDaySchedule.module.css"
import TeacherDayScheduleRow from "./TeacherDayScheduleRow";

const TeacherDaySchedule = ({
  dayName,
  date, 
  lessons,
  lessonSlots
}) => {

  const lessonsByNumber = {};
  lessons.forEach(lesson => {
    lessonsByNumber[lesson.lesson_number] = lesson;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  };
  

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.dayWrap}>
          <span className={styles.day}>{dayName}</span>
        </div>
        <div className={styles.dateWrap}>
          <span className={styles.date}>{formatDate(date)}</span>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
          <th className={styles["lesson-number"]}>№</th>
          <th className={styles["class-name"]}>Класс</th>
          <th className={styles["lesson-subject"]}>Предмет</th>
          <th className={styles["lesson-room"]}>Кабинет</th>
          </tr>
        </thead>
        <tbody>
          {lessonSlots.map((slot) => {
            const lesson = lessonsByNumber[slot.lesson_number];
            return (
              <TeacherDayScheduleRow
                key={slot.lesson_number}
                lesson={lesson}
                lessonNumber={slot.lesson_number}
              />
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default TeacherDaySchedule;