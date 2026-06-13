import React from 'react';
import styles from '../../../pages/admin/TeachersManagement.module.css';
import AddButton from '../../UI/AddButton';
import EditButton from '../../UI/EditButton';
import DeleteButton from '../../UI/DeleteButton';

const TeachersList = ({
  teachers,
  selectedTeacher,
  onSelectTeacher,
  onEditTeacher,
  onDeleteTeacher,
  onCreateTeacher
}) => {
  // Сортировка учителей по фамилии
  const sortedTeachers = [...teachers].sort((a, b) => 
    (a.last_name || '').localeCompare(b.last_name || '')
  );

  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        <h3>Учителя</h3>
        <AddButton
          onClick={onCreateTeacher}
          text=""
          title="Добавить учителя"
          className={styles.smallAddButton}
        />
      </div>
      <div className={styles.columnContent}>
        {sortedTeachers.map(teacher => (
          <div
            key={teacher.user_id}
            className={`${styles.teacherItem} ${selectedTeacher?.user_id === teacher.user_id ? styles.active : ''}`}
          >
            <span 
              className={styles.teacherName}
              onClick={() => onSelectTeacher(teacher)}
            >
              {teacher.last_name} {teacher.first_name} {teacher.patronymic || ''}
            </span>
            <div className={styles.itemActions}>
              <EditButton 
                onClick={() => onEditTeacher(teacher)} 
                title="Редактировать учителя"
                small
              />
              <DeleteButton 
                onClick={() => onDeleteTeacher(teacher)} 
                title="Удалить учителя"
              />
            </div>
          </div>
        ))}
        {teachers.length === 0 && (
          <div className={styles.emptyMessage}>Нет учителей</div>
        )}
      </div>
    </div>
  );
};

export default TeachersList;