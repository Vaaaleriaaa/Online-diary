import React from "react";
import styles from "./StudentDayScheduleRow.module.css";

const StudentDayScheduleRow = ({
  lesson,
  lessonNumber
}) => {
  if(lesson){
    return (
        <tr className={styles.row}>
            <td>{lessonNumber}</td>
            <td>{lesson.subject_name}</td>
            <td>{lesson.teacher_last_name} {lesson.teacher_first_name}</td>
            <td>{lesson.room_number}</td>
        </tr>
    )
  }
  return (
    <tr className={styles.emptyRow}>
      <td className={styles.lessonNumber}>{lessonNumber}</td>
      <td colSpan="3" className={styles.emptyCell}></td>
    </tr>
  )
}

export default StudentDayScheduleRow;