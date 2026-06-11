import React from "react";
import styles from "./TeacherDayScheduleRow.module.css"

const TeacherDayScheduleRow = ({
  lesson,
  lessonNumber
}) => {
  if(lesson){
    return (
        <tr className={styles.row}>
            <td>{lessonNumber}</td>
            <td>{lesson.class_name}</td>
            <td>{lesson.subject_name}</td>
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

export default TeacherDayScheduleRow;