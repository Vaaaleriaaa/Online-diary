import React, { useCallback } from 'react';
import styles from '../../../pages/admin/TeachersManagement.module.css';
import AddButton from '../../UI/AddButton';
import EditButton from '../../UI/EditButton';
import DeleteButton from '../../UI/DeleteButton';

const AssignmentsList = ({
  assignments,
  loading,
  selectedTeacher,
  selectedSubject,
  onEditAssignment,
  onDeleteAssignment,
  onCreateAssignment,
  disabled
}) => {

  const getClassName = useCallback((assignment) => {
    if (assignment.class) {
      return assignment.class.class_name || 
              `${assignment.class.grade_year}${assignment.class.grade_letter}`;
    }
  },[]);

  if (disabled) {
    return (
      <div className={styles.column}>
        <div className={styles.columnHeader}>
          <h3>Классы</h3>
          <AddButton
            onClick={onCreateAssignment}
            text=""
            title="Добавить назначение"
            className={styles.smallAddButton}
          />
        </div>

        <div className={styles.columnContent}>
          <div className={styles.emptyMessage}>
            {!selectedTeacher ? 'Сначала выберите учителя' : 'Сначала выберите предмет'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        <h3>Классы</h3>
          <AddButton
            onClick={onCreateAssignment}
            text=""
            title="Добавить назначение"
            className={styles.smallAddButton}
          />
      </div>
      <div className={styles.columnContent}>
        {loading ? (
          <div className={styles.loading}>Загрузка...</div>
        ) : (
          <>
            {assignments.map(assignment => (
              <div
                key={assignment.assignment_id}
                className={styles.assignmentItem}
              >
                <span className={styles.className}>
                  {getClassName(assignment)}
                </span>
                <div className={styles.itemActions}>
                  <EditButton 
                    onClick={() => onEditAssignment(assignment)} 
                    title="Редактировать назначение"
                    small
                  />
                  <DeleteButton 
                    onClick={() => onDeleteAssignment(assignment)} 
                    title="Удалить назначение"
                  />
                </div>
              </div>
            ))}
            {assignments.length === 0 && (
              <div className={styles.emptyMessage}>
                Нет назначенных классов
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AssignmentsList;